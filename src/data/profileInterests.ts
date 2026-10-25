/** Interests patriots can highlight on their guild profile */
export const PATRIOT_INTERESTS = [
  "Youth & leagues",
  "Integrity",
  "Programmes",
  "Tourism",
  "Buy Uganda",
  "Mobility",
  "Civic education",
  "Charity & CSR",
  "PLU TV",
  "Membership",
] as const;

export type PatriotInterest = (typeof PATRIOT_INTERESTS)[number];
