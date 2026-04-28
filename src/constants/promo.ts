/** Default PDID for promo product scope when enrollment pdid is missing or ≤ 0 (Premium Care). */
export const DEFAULT_PROMO_PDID = 43957;

export function getEffectivePromoPdid(pdid: number): number {
  return typeof pdid === 'number' && pdid > 0 ? pdid : DEFAULT_PROMO_PDID;
}
