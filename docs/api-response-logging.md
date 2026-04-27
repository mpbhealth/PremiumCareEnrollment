# API response logging — co-locate the upstream JSON response with the request payload

Use this when a project already audit-logs the **outbound** enrollment payload to a Supabase table (e.g. `premiumCare_log`) and you also want the **inbound** response body from the external enrollment API stored on the **same row**, so request and response are trivially correlated by primary key.

This document describes the exact pattern used in **Premium Care Enrollment** (`PremiumCareEnrollment`).

**Reference files in this repo**

| Concern | File |
|---------|------|
| Migration that adds the `response` column | `supabase/migrations/20260423120000_add_response_to_premiumCare_log.sql` |
| Edge Function that calls the upstream API and writes the log row | `supabase/functions/enrollment-api-premiumcare/index.ts` (`insertPremiumCareLogSafe`, `finally` after external `fetch`) |
| Log table create migration | `supabase/migrations/20260324120000_create_careplus_log_table.sql` |

**Log table:** `premiumCare_log` (mixed case, quoted in SQL).

**Columns used for audit**

| Column | Role |
|--------|------|
| `request_payload` | Decrypted inbound body from the app (PII in clear for ops) |
| `log` | Small JSON summary: `agentNumber`, `externalHttpStatus`, `fetchError`, `transactionSuccess` |
| `response` | Full upstream JSON as **text** (`JSON.stringify` of parsed body, or synthetic object for non-JSON bodies) |

> **Sister projects:** the log table name, Edge Function folder, and column layout may differ. The shape of the additive change is the same: `ALTER TABLE … ADD COLUMN IF NOT EXISTS response text`, plus extending the **single** `INSERT` to include `response: JSON.stringify(responseData)` (never a second row for the response).

---

## TL;DR — the four guarantees

1. **Schema is additive and idempotent.** `ADD COLUMN IF NOT EXISTS response text` — re-running the migration is a no-op, and the column is **nullable** so historical rows stay valid.
2. **One row per submission, not two.** The same `INSERT` that captures the outbound audit (`request_payload` + `log`) also captures the inbound `response`. Pairing happens by primary key, not by timestamp guessing.
3. **Logging cannot break enrollment.** The `INSERT` is wrapped in `try / catch` and a non-zero `logError` is logged to `console.error` but never thrown. The Edge Function still returns the upstream response to the client. (This repo also runs the insert from a `finally` block so early `return`s still audit when the inner flow ran.)
4. **Stored as `text`, not `jsonb`.** The column is plain `text` so the row preserves exact serialized content, including any odd shapes the upstream returns. Cast at read-time (`response::jsonb`) when you need to query inside it.

---

## 1. The migration (one-time, additive)

See `supabase/migrations/20260423120000_add_response_to_premiumCare_log.sql`:

```sql
ALTER TABLE public."premiumCare_log"
  ADD COLUMN IF NOT EXISTS response text;

COMMENT ON COLUMN public."premiumCare_log".response IS
  'JSON string of external enrollment API response (SUCCESS, MESSAGES, MEMBER.ID, etc.)';
```

Notes:

- Quote `"premiumCare_log"` because the name is mixed case.
- Do **not** add `NOT NULL` or a default on `response`.
- RLS is unchanged; the Edge Function uses `SUPABASE_SERVICE_ROLE_KEY`.

---

## 2. The Edge Function change

In `enrollment-api-premiumcare`, after the external API response is parsed (`response.json()` or a synthetic object for non-JSON), the `finally` block calls `insertPremiumCareLogSafe`, which performs **one** insert including:

- `log` — summary JSON (no duplicate full body; full body is in `response`)
- `request_payload` — clear request from the client
- `response` — `JSON.stringify(externalResponse)` when present, else `null`

Critical rules (from the shared pattern):

1. Insert runs **before** the client receives the final response (here: `await` in `finally` completes before the `return` from `try` propagates).
2. Use `JSON.stringify` for `response` so the `text` column contract is obvious.
3. Outer `try` / inner `if (logError)` both **`console.error` and never throw**.

---

## 3. Outcome matrix

| Upstream API result | `request_payload` | `response` | Edge Function returns |
|---------------------|-------------------|------------|------------------------|
| 200 + success | clear request | full upstream JSON | `{ success, status, data }` |
| 200 + `SUCCESS = "false"` | clear request | full upstream JSON | Same; client interprets payload |
| 4xx / 5xx with JSON | clear request | error JSON | `{ success: false, status, data }` |
| Non-JSON body | clear request | `{"nonJsonResponse":true,"preview":"..."}` | 502 to client |
| Network error before response | clear request | `null` (or omit); `log.fetchError` set | 504 |
| Supabase insert fails | — | — | Enrollment response still returned; error logged |

---

## 4. Replication checklist

- [ ] Migration adds nullable `response text` to `premiumCare_log`.
- [ ] `enrollment-api-premiumcare` insert includes `response: JSON.stringify(...)` on the same row as `request_payload` / `log`.
- [ ] Insert wrapped in try/catch; `logError` checked; never throw on audit failure.
- [ ] No second insert or sibling table for “responses only”.
- [ ] Deploy: run migration, then **redeploy** the Edge Function.

---

## 5. Querying the audit log

`premiumCare_log` uses `created_at` (not `date`):

```sql
SELECT
  id,
  created_at,
  (response::jsonb)->'data'->>'SUCCESS' AS upstream_success,
  (response::jsonb)->'data'->'MESSAGES' AS upstream_messages
FROM public."premiumCare_log"
ORDER BY created_at DESC
LIMIT 20;

SELECT
  id,
  created_at,
  request_payload,
  response
FROM public."premiumCare_log"
WHERE created_at >= now() - interval '24 hours'
  AND (response::jsonb)->'data'->>'SUCCESS' = 'false'
ORDER BY created_at DESC;
```

---

## 6. Replication summary (PR blurb)

> Add nullable `response text` to `premiumCare_log` via idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS`. In `enrollment-api-premiumcare`, extend the single `premiumCare_log` insert to include `response: JSON.stringify(parsedUpstreamBody)` alongside existing `request_payload` and summary `log`. Keep the insert in a safe wrapper that logs failures and never throws, so audit issues never break enrollment. Query with `response::jsonb` when needed.
