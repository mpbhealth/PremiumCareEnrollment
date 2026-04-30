---
name: Oldest-age Direct Enrollment pricing
overview: Centralize pricing age bands on the maximum age derived from the primary applicant’s DOB plus every dependent’s DOB, reusing existing `calculateAgeFromDOB` parsing and eligibility rules—all within `pricingLogic.ts` so `EnrollmentSummary` and `EnrollmentWizard` require no signature changes.
todos:
  - id: helper-max-age
    content: Add household age collection + max age (primary + dependents) in pricingLogic.ts
    status: completed
  - id: wire-direct-enrollment
    content: Use max age in getCarePlusPricingOptions (Premium Care); keep errors/eligibility unchanged
    status: completed
  - id: verify-build
    content: Run npm run build (and lint if needed)
    status: completed
isProject: false
---

# Use oldest household age for Direct Enrollment quotes

## Current behavior ([`src/utils/pricingLogic.ts`](src/utils/pricingLogic.ts))

(This repo: **`getCarePlusPricingOptions`**; sister “Direct Enrollment” apps may use **`getDirectEnrollmentPricingOptions`** with the same logic.)

`getCarePlusPricingOptions(memberDOB, dependents)` derives a single **`pricingAge`** from **all parseable household DOBs**, using **`Math.max(...ages)`** so the rate band matches the **oldest** member.

`getCoverageType(dependents)` already reflects household composition for **which product rows** (`Member Only` vs `Member + Spouse`, etc.). The fix is the **age band** (`18-29` vs `30-64` from `CARE_PLUS_PRICING`), which must reflect the **oldest** household member with a parseable DOB, not only the primary.

Call sites (**no changes needed**):

- [`src/components/EnrollmentSummary.tsx`](src/components/EnrollmentSummary.tsx) — already passes `memberDOB` and `dependents`.
- [`src/components/EnrollmentWizard.tsx`](src/components/EnrollmentWizard.tsx) — passes `formData.dob` and `formData.dependents`.

## Target behavior

1. Build a finite list of **integer ages** via existing [`calculateAgeFromDOB`](src/utils/pricingLogic.ts) for:
   - primary `memberDOB`
   - each `dependent.dob`
2. **Ignore** entries where DOB is missing/unparseable (`null`) so partial forms degrade to “whatever valid ages exist” (same philosophy as today: invalid primary still blocks with the existing message).
3. **`pricingAge = Math.max(...ages)`**.
4. If **no ages** remain (effectively invalid primary DOB): keep current early return (**“Please enter a valid date of birth…”**).
5. Run existing **`getAgeRange(pricingAge)`** and the rest of filtering unchanged (**18–64** gate, **`getCoverageType`**, map to **`CARE_PLUS_PRICING`**).

**Example:** Primary 35, Spouse DOB ⇒ 52, Child 18 → ages `{35,52,18}` → **52** → **`30-64`** tier for that coverage type.

## Implementation steps

1. In [`src/utils/pricingLogic.ts`](src/utils/pricingLogic.ts), add a small internal helper (e.g. **`collectHouseholdAges(primaryDob: string, dependents: Dependent[]): number[]`**) that pushes non-null **`calculateAgeFromDOB`** results for primary then each dependent—or inline if you prefer a single exported **`getPricingAgeForHousehold(primaryDob, dependents): number | null`** returning **`Math.max`** or `null`.
2. At the top of **`getCarePlusPricingOptions`**, replace single-member age with **`collectHouseholdAges` + `Math.max`** (or equivalent):
   - `ages = collect...`
   - `if (ages.length === 0)` → unchanged error path
   - `const pricingAge = Math.max(...ages)`
   - **`getAgeRange(pricingAge)`** (and thereafter identical).
3. Add a concise file-level or function JSDoc note: **pricing age band follows oldest enrolled member with a parseable DOB**.

## Edge cases (document in code comment)

- **Dependent without DOB yet:** that person contributes no age → max ignores them until entered (same UI order as entering DOBs step-by-step).
- **Someone 65+ in household:** **`getAgeRange`** already returns **`null`** and **`Coverage is available for members aged 18-64 only.`** applies to the oldest age (**correct tightening** vs using only primary).

## Verification

- **Manual:** Enrollment with younger primary + spouse DOB implying **≥50** confirms IUA dropdown prices match **older** bracket.
- **`npm run build`** (optional **`npm run typecheck`**) passes.

No changes to Essentials pricing ([`calculateEssentialPricing`](src/utils/pricingLogic.ts)) unless product later mandates age-tiered Essentials (out of scope).
