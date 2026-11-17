export const ENDORSEMENT_CAMPAIGN = {
  eyebrow: "PLU presidential endorsement campaign",
  headline: "ENDORSEMENT OF GEN MUHOOZI KAINERUGABA FOR PRESIDENT, 2031",
  lead: "Add your voice to this public expression of support.",
  formTitle: "Add your name to the presidential endorsement campaign.",
  formSubtitle: "Complete the short form below. No photo or upload is required.",
  onePerId: "One endorsement per National ID.",
  ninHint: "Used privately to prevent duplicate entries. It is not displayed publicly.",
  districtHint: "Selecting a district is all that is needed for this campaign.",
  messageHint:
    "This stays in the protected endorsement record and is not displayed publicly, unless you tick the box below.",
  consentLabel:
    "I confirm these details are mine and that I support this endorsement. Only combined figures are shown publicly; my individual details stay in the protected endorsement record.",
  publishMessageLabel: "Display my endorsement message publicly if approved by the Secretariat.",
  submitLabel: "Record my endorsement",
} as const;

export const ENDORSEMENT_AGE_GROUPS = [
  "18-25",
  "26-35",
  "36-45",
  "46-55",
  "56-65",
  "66 and over",
] as const;

export const ENDORSEMENT_GENDERS = [
  { value: "", label: "Select gender" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
] as const;