/**
 * Single source of truth for the eight standard ABO/Rh blood groups.
 * Blood group notations are internationally standardized and used universally
 * across both Bangla and English interfaces.
 */
export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/**
 * Type guard to check if an unknown value is a valid BloodGroup.
 */
export function isBloodGroup(value: unknown): value is BloodGroup {
  return typeof value === "string" && BLOOD_GROUPS.includes(value as BloodGroup);
}

/**
 * Red Blood Cell (RBC) Donation Compatibility Matrix.
 * Maps a donor's blood group to the recipient blood groups they can safely donate to.
 */
export const DONATION_COMPATIBILITY: Record<BloodGroup, readonly BloodGroup[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal RBC donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Can only donate RBC to AB+
};

/**
 * Red Blood Cell (RBC) Receive Compatibility Matrix.
 * Maps a recipient's blood group to the donor blood groups they can safely receive from.
 */
export const RECEIVE_COMPATIBILITY: Record<BloodGroup, readonly BloodGroup[]> = {
  "O-": ["O-"], // Can only receive from O-
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal RBC recipient
};

/**
 * Evaluates whether a donor blood group is compatible to donate to a recipient blood group.
 */
export function canDonateTo(donor: BloodGroup, recipient: BloodGroup): boolean {
  return DONATION_COMPATIBILITY[donor]?.includes(recipient) ?? false;
}

/**
 * Returns all recipient blood groups that can receive blood from the specified donor group.
 */
export function getCompatibleRecipientGroups(donor: BloodGroup): readonly BloodGroup[] {
  return DONATION_COMPATIBILITY[donor] ?? [];
}

/**
 * Returns all donor blood groups that the specified recipient can safely receive from.
 */
export function getCompatibleDonorGroups(recipient: BloodGroup): readonly BloodGroup[] {
  return RECEIVE_COMPATIBILITY[recipient] ?? [];
}
