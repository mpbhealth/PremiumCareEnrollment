import { calculateAgeFromDOB } from './pricingLogic';

export type DependentRelationship = 'Spouse' | 'Child';

/**
 * True when a dependent is a Child whose age is computable AND under 18.
 * Used to make email / phone / Social Security optional in step 3 for
 * children too young to reasonably have their own contact info.
 *
 * Keep in sync with any server-side relaxation of dependent contact rules
 * in supabase/functions/enrollment-api-premiumcare (currently the function
 * does not enforce per-dependent contact fields, so this is purely a UX
 * relaxation today — see optional_child_contact_fields plan for context).
 */
export function isChildDependentUnder18ForContactOptional(
  dob: string,
  relationship: DependentRelationship
): boolean {
  if (relationship !== 'Child') return false;
  const age = calculateAgeFromDOB(dob);
  return age !== null && age < 18;
}
