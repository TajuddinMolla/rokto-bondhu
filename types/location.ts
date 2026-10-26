/**
 * Administrative division of Bangladesh (১ম স্তরের প্রশাসনিক কাঠামো)
 */
export interface Division {
  id: string;
  nameBn: string;
  nameEn: string;
}

/**
 * Administrative district of Bangladesh (২য় স্তরের প্রশাসনিক কাঠামো)
 */
export interface District {
  id: string;
  divisionId: string;
  nameBn: string;
  nameEn: string;
}

/**
 * Upazila / Thana of Bangladesh (৩য় স্তরের প্রশাসনিক কাঠামো)
 */
export interface Upazila {
  id: string;
  districtId: string;
  nameBn: string;
  nameEn: string;
}

/**
 * Structured location address representation for profiles and requests.
 */
export interface LocationAddress {
  divisionId: string;
  districtId: string;
  upazilaId: string;
  area?: string; // Optional local neighbourhood, village, or union
}

/**
 * Filter parameters for querying donors or blood requests by geography.
 */
export interface LocationFilter {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
}
