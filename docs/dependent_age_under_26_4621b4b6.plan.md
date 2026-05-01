---
name: Dependent age under 26
overview: "Enforce that **Child** dependents must be under age 26 (from DOB using existing `calculateAgeFromDOB`). **Spouse** dependents keep the current rule: **18 or older**, no upper age cap. Update Step 1 validation and mirror checks server-side so submissions cannot bypass the UI."
todos:
  - id: wizard-validation
    content: "Extend validateStep1: Child age >= 26 error; keep Spouse age < 18"
    status: completed
  - id: api-validation
    content: Mirror Child/Spouse DOB rules in enrollment-api-premiumcare before external submit
    status: completed
  - id: manual-check
    content: Smoke-test Step 1 + API error path for blocked ages
    status: completed
isProject: false
---

# Dependent age: Child under 26, Spouse 18+

## Current behavior

**Premium Care (this repo):** [`src/components/EnrollmentWizard.tsx`](src/components/EnrollmentWizard.tsx), `validateStep1`.

- Primary: 18+ (`calculateAgeFromDOB`)
- Dependents: **Spouse** gets `age < 18` → error. **Child**: after this work, also `age >= 26` → error.

Age is computed in [`src/utils/pricingLogic.ts`](src/utils/pricingLogic.ts) via `calculateAgeFromDOB` (integer age at “today,” same as primary).

Sister “Direct Enrollment” repos may use [`supabase/functions/enrollment-api-direct/index.ts`](...) with the same logic.

## Target behavior (Option A)

| Relationship | Rule |
|--------------|------|
| Child | `age !== null && age >= 26` → block with a clear message (e.g. dependents must be under 26). |
| Spouse | Unchanged: `age !== null && age < 18` → block. |

**Edge case:** Integer age 25 passes; on 26th birthday, age is 26 and fails (consistent with “under 26”).

## Implementation

1. **Client — `validateStep1` in `EnrollmentWizard.tsx`**
   - After valid DOB for each dependent:
     - If `relationship === 'Child'`: add error when `age !== null && age >= 26`.
     - If `relationship === 'Spouse'`: keep existing `age < 18` branch.
   - Reuse `calculateAgeFromDOB` (already imported from `pricingLogic`).

2. **Server — [`supabase/functions/enrollment-api-premiumcare/index.ts`](supabase/functions/enrollment-api-premiumcare/index.ts)**
   - After building `requestData`, parse each dependent’s DOB (same MM/DD/YYYY assumption as the client) and apply the same Child/Spouse rules (`calculateAgeFromDobMmDdYyyy` + shared error strings in comments).
   - Return `400` with a stable error message if validation fails.

3. **Optional hygiene (minimal)**
   - If duplication feels heavy, extract a tiny `dependentAgeValidation.ts` in `src/utils` with exported messages + predicates and import it in the wizard only; duplicate the numeric rules as a short comment-linked block in the Edge function (Deno cannot import cleanly from `src`)—**only worth it if you already share validation across packages.** Default: wizard + inline server duplicate to stay scoped.

## Out of scope

- Changing primary subscriber 18+ rule.
- Pricing / `getAgeRange` (household tiers)—unchanged.
- Copy in terms/marketing unless you explicitly want UX helper text near Child DOB in `DependentCard` (optional follow-up).

## Verification

- Manual: Step 1 with Child DOB implying age 25 → passes; age 26 → blocked.
- Spouse DOB age 17 → blocked; age 18+ → passes regardless of age 26+.
