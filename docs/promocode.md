# Promocode system — export guide for similar projects

This document describes how enrollment promocodes work in this codebase pattern (Supabase + PostgREST + optional Edge API validation). **Premium Care Enrollment** uses **`DEFAULT_PROMO_PDID = 43957`** in [`src/constants/promo.ts`](../src/constants/promo.ts) and the same value as **`DEFAULT_ENROLLMENT_PDID`** in [`enrollment-api-premiumcare`](../supabase/functions/enrollment-api-premiumcare/index.ts). When porting to another product line, replace that number everywhere it appears.

---

## 1. What you are implementing

| Piece | Role |
|--------|------|
| **`promocodes` table** | Stores one row per code; each row has a **product scope** string and a **fixed dollar discount**. |
| **Client validation** | User enters a code; app loads the active row, checks **product** against the enrollment’s PDID, then applies **discount** to the initial payment. |
| **Server re-validation** | Enrollment submission repeats the same lookup + product check so discounts cannot be forged client-side. |
| **Pricing helper** | `initial_payment_after_discount = max(0, initial_payment - discount_amount)`. |

This repo scopes **`promocodes.product`** to a **single enrollment identifier: PDID** (numeric product ID). Other projects might store PDID under another name; the **mechanism** is the same: **match DB `product` column to whatever ID represents “this enrollment product”.**

---

## 2. Config you must set per project

Define **one default PDID** used when the form does not yet have a positive PDID:

```text
DEFAULT_PROMO_PDID = <your number>   // Premium Care Enrollment: 43957 (see src/constants/promo.ts)
```

**Where to wire it (conceptually):**

- **Frontend** — constant, env (`VITE_DEFAULT_PROMO_PDID`), or app config object consumed by your promo service.
- **Edge function / API** — environment variable (e.g. `DEFAULT_ENROLLMENT_PDID`) or the same numeric literal **kept in sync** with the client.

Use the same numeric literal (or env var) on the client and edge function so promo **product** matching and enrollment **PDID** stay aligned.

---

## 3. Database: `promocodes`

Reference migration shape:

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `code` | **UNIQUE** — each promo string appears once (different codes can share the same `product`). |
| `product` | **Not unique.** Stores the product scope: typically **`"<PDID>"`** as text (e.g. `"43957"` for Premium Care). See wildcards below. |
| `discount_amount` | Non-negative numeric; dollars subtracted from initial payment. |
| `active` | Boolean; only `active = true` rows participate in validation. |

**RLS:** Policy that allows **anonymous `SELECT`** for rows with `active = true` is typical so the browser can validate without a logged-in user. Inserts/updates remain admin-only.

**Indexes:** Unique on `code`; optional index on `active`.

---

## 4. Product column semantics (`product`)

The enrollment **eligible PDID** is computed as:

```text
effective_pdid = (user_pdid is number && user_pdid > 0) ? user_pdid : DEFAULT_PROMO_PDID
```

A promocode row **matches** the enrollment when:

1. **`product` is empty**, or equals (case-insensitive) **`*`**, **`ALL`**, or **`ANY`** → code applies to any enrollment (wildcard rows).
2. Otherwise **`product`** (normalized) must equal **`String(effective_pdid)`** (normalized).

**Multiple codes per product:** Many rows may use the same `product` value (same PDID). **`code` stays unique** across the table.

---

## 5. Code lookup: case-insensitive + literal string

PostgREST/Supabase: use **`ilike`** on `code` with the **trimmed user input**, not `eq` with forced uppercase, so DB casing can differ from user input.

**Critical:** `ilike` treats `%` and `_` as wildcards. **Escape** backslash, percent, and underscore in the user’s input before sending:

```typescript
function escapePromoCodeForILike(trimmed: string): string {
  return trimmed
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
```

**Query pattern:**

- `from('promocodes').select('code, product, discount_amount')`
- `.ilike('code', escapePromoCodeForILike(trimmedUserInput))`
- `.eq('active', true)`
- `.limit(1)`

Use **`limit(1)`** instead of **`maybeSingle()`** if your PostgREST stack misbehaves on zero-or-many rows.

If no row → **invalid code**. If row exists → proceed to product match.

---

## 6. Client-side validation flow

1. Trim user input.
2. Run the query above.
3. If no row → error.
4. If `enrollmentCtx` is provided, build the **eligible PDID set** (this repo uses a single entry: `String(effective_pdid)` using **`DEFAULT_PROMO_PDID`** when `pdid` is missing or ≤ 0).
5. Compare row `product` to eligible IDs using wildcard rules (Section 4).
6. On success, persist **`AppliedPromo`**: `{ code, product, discountAmount }` from the row.

**UI:** Do not force uppercase on every keystroke if you rely on `ilike`; trimming is enough.

---

## 7. Applying the discount

```typescript
function applyPromoDiscount(initialPayment: number, appliedPromo: AppliedPromo | null): number {
  if (!appliedPromo) return initialPayment;
  return Math.max(0, initialPayment - appliedPromo.discountAmount);
}
```

Use the same helper anywhere the enrollment fee is shown (summary, payment step, PDF, etc.).

---

## 8. Server-side (Edge function / API) parity

When the client submits enrollment:

1. If `promoCode` is non-empty, repeat the **same** `promocodes` query + **same** `escapePromoCodeForILike` + **same** `effective_pdid` / product match (using **the same `DEFAULT_PROMO_PDID`** as the client).
2. If the match succeeds, recompute enrollment fee: **`max(0, base_fee - discount_amount)`** — do **not** trust client-sent dollar amounts for the promo discount.

Duplicate `escapePromoCodeForILike` in the Edge bundle if needed (no shared package), but keep logic **byte-identical**.

---

## 9. Admin data entry cheat sheet

| Goal | Set `product` to |
|------|---------------------|
| Code valid only for PDID **12345** | `12345` (string) |
| Code valid for **any** product line | `*` or `ALL` or `ANY`, or leave empty per your wildcard implementation |

Always insert **distinct `code`** values per row.

---

## 10. Checklist when copying to another repo

- [ ] Create `promocodes` table + RLS + indexes (or equivalent).
- [ ] Set **`DEFAULT_PROMO_PDID`** (and document it for admins creating rows).
- [ ] Implement **`escapePromoCodeForILike`** + **`ilike`** lookup + **`limit(1)`**.
- [ ] Implement **wildcard + PDID** matching for `product`.
- [ ] Wire **`validatePromoCode`** (or equivalent) with **`pdid`** from enrollment state.
- [ ] Implement **`applyPromoDiscount`** (or equivalent) with **`Math.max(0, …)`**.
- [ ] Mirror promo validation + fee math on **submit** server-side.
- [ ] Smoke-test: unknown code, inactive row, wrong PDID row, wildcard row, multiple codes same PDID.

---

## 11. Prompt snippet for AI-assisted ports

Paste something like this when asking an AI to implement the same system in another codebase:

```text
Implement promocode validation per docs/promocode.md pattern:
- Supabase table promocodes (code unique, product text, discount_amount, active).
- Lookup: trim input, escape % _ \ for ilike, filter active=true, limit 1.
- Product match: wildcards empty/* /ALL/ANY = any; else product must equal String(effective_pdid).
- effective_pdid = user pdid if > 0 else DEFAULT_PROMO_PDID.
- Use this DEFAULT_PROMO_PDID for this project: 43957 (Premium Care) or <YOUR PDID>
- Client applies max(0, initial - discount); server recomputes on submit.
- Keep client `DEFAULT_PROMO_PDID` and edge `DEFAULT_ENROLLMENT_PDID` identical.
```

(Replace the last line with your real default PDID or “read from env `VITE_DEFAULT_PROMO_PDID`”.)

---

## 12. Reference locations in this repository

| Area | Path |
|------|------|
| This guide | `docs/promocode.md` |
| Default PDID constant | `src/constants/promo.ts` (`DEFAULT_PROMO_PDID`, `getEffectivePromoPdid`) |
| Client service | `src/utils/promoCodeService.ts` |
| UI apply | `src/components/EnrollmentSummary.tsx` (passes `pdid` into `validatePromoCode`) |
| Step 1 wiring | `src/components/Step1PersonalInfo.tsx` |
| Default form `pdid` | `src/hooks/useEnrollmentStorage.ts` |
| Edge validation | `supabase/functions/enrollment-api-premiumcare/index.ts` (`DEFAULT_ENROLLMENT_PDID`, `ilike`, product match) |
| Migration | `supabase/migrations/20260123163522_create_promocodes_table.sql` |

---

*Last aligned with Premium Care Enrollment: PDID **43957**, PDID-only product matching, `ilike` + escape, server parity on submit.*
