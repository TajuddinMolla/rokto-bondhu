import type { District, Division, Upazila } from "@/types/location";
import type { Locale } from "@/i18n/config";

/**
 * The 8 Official Administrative Divisions of Bangladesh (৮টি প্রশাসনিক বিভাগ)
 */
export const BANGLADESH_DIVISIONS: readonly Division[] = [
  { id: "dhaka", nameBn: "ঢাকা", nameEn: "Dhaka" },
  { id: "chattogram", nameBn: "চট্টগ্রাম", nameEn: "Chattogram" },
  { id: "rajshahi", nameBn: "রাজশাহী", nameEn: "Rajshahi" },
  { id: "khulna", nameBn: "খুলনা", nameEn: "Khulna" },
  { id: "barishal", nameBn: "বরিশাল", nameEn: "Barishal" },
  { id: "sylhet", nameBn: "সিলেট", nameEn: "Sylhet" },
  { id: "rangpur", nameBn: "রংপুর", nameEn: "Rangpur" },
  { id: "mymensingh", nameBn: "ময়মনসিংহ", nameEn: "Mymensingh" },
] as const;

/**
 * All 64 Administrative Districts of Bangladesh organized by division (৬৪টি প্রশাসনিক জেলা)
 */
export const BANGLADESH_DISTRICTS: readonly District[] = [
  // Dhaka Division (13)
  { id: "dhaka", divisionId: "dhaka", nameBn: "ঢাকা", nameEn: "Dhaka" },
  { id: "gazipur", divisionId: "dhaka", nameBn: "গাজীপুর", nameEn: "Gazipur" },
  { id: "narayanganj", divisionId: "dhaka", nameBn: "নারায়ণগঞ্জ", nameEn: "Narayanganj" },
  { id: "tangail", divisionId: "dhaka", nameBn: "টাঙ্গাইল", nameEn: "Tangail" },
  { id: "narsingdi", divisionId: "dhaka", nameBn: "নরসিংদী", nameEn: "Narsingdi" },
  { id: "manikganj", divisionId: "dhaka", nameBn: "মানিকগঞ্জ", nameEn: "Manikganj" },
  { id: "munshiganj", divisionId: "dhaka", nameBn: "মুন্সীগঞ্জ", nameEn: "Munshiganj" },
  { id: "faridpur", divisionId: "dhaka", nameBn: "ফরিদপুর", nameEn: "Faridpur" },
  { id: "gopalganj", divisionId: "dhaka", nameBn: "গোপালগঞ্জ", nameEn: "Gopalganj" },
  { id: "madaripur", divisionId: "dhaka", nameBn: "মাদারীপুর", nameEn: "Madaripur" },
  { id: "rajbari", divisionId: "dhaka", nameBn: "রাজবাড়ী", nameEn: "Rajbari" },
  { id: "shariatpur", divisionId: "dhaka", nameBn: "শরীয়তপুর", nameEn: "Shariatpur" },
  { id: "kishoreganj", divisionId: "dhaka", nameBn: "কিশোরগঞ্জ", nameEn: "Kishoreganj" },

  // Chattogram Division (11)
  { id: "chattogram", divisionId: "chattogram", nameBn: "চট্টগ্রাম", nameEn: "Chattogram" },
  { id: "coxs-bazar", divisionId: "chattogram", nameBn: "কক্সবাজার", nameEn: "Cox's Bazar" },
  { id: "cumilla", divisionId: "chattogram", nameBn: "কুমিল্লা", nameEn: "Cumilla" },
  { id: "feni", divisionId: "chattogram", nameBn: "ফেনী", nameEn: "Feni" },
  { id: "brahmanbaria", divisionId: "chattogram", nameBn: "ব্রাহ্মণবাড়িয়া", nameEn: "Brahmanbaria" },
  { id: "noakhali", divisionId: "chattogram", nameBn: "নোয়াখালী", nameEn: "Noakhali" },
  { id: "chandpur", divisionId: "chattogram", nameBn: "চাঁদপুর", nameEn: "Chandpur" },
  { id: "lakshmipur", divisionId: "chattogram", nameBn: "লক্ষ্মীপুর", nameEn: "Lakshmipur" },
  { id: "rangamati", divisionId: "chattogram", nameBn: "রাঙ্গামাটি", nameEn: "Rangamati" },
  { id: "bandarban", divisionId: "chattogram", nameBn: "বান্দরবান", nameEn: "Bandarban" },
  { id: "khagrachhari", divisionId: "chattogram", nameBn: "খাগড়াছড়ি", nameEn: "Khagrachhari" },

  // Rajshahi Division (8)
  { id: "rajshahi", divisionId: "rajshahi", nameBn: "রাজশাহী", nameEn: "Rajshahi" },
  { id: "bogura", divisionId: "rajshahi", nameBn: "বগুড়া", nameEn: "Bogura" },
  { id: "pabna", divisionId: "rajshahi", nameBn: "পাবনা", nameEn: "Pabna" },
  { id: "sirajganj", divisionId: "rajshahi", nameBn: "সিরাজগঞ্জ", nameEn: "Sirajganj" },
  { id: "naogaon", divisionId: "rajshahi", nameBn: "নওগাঁ", nameEn: "Naogaon" },
  { id: "natore", divisionId: "rajshahi", nameBn: "নাটোর", nameEn: "Natore" },
  { id: "chapainawabganj", divisionId: "rajshahi", nameBn: "চাঁপাইনবাবগঞ্জ", nameEn: "Chapainawabganj" },
  { id: "joypurhat", divisionId: "rajshahi", nameBn: "জয়পুরহাট", nameEn: "Joypurhat" },

  // Khulna Division (10)
  { id: "khulna", divisionId: "khulna", nameBn: "খুলনা", nameEn: "Khulna" },
  { id: "jashore", divisionId: "khulna", nameBn: "যশোর", nameEn: "Jashore" },
  { id: "satkhira", divisionId: "khulna", nameBn: "সাতক্ষীরা", nameEn: "Satkhira" },
  { id: "kushtia", divisionId: "khulna", nameBn: "কুষ্টিয়া", nameEn: "Kushtia" },
  { id: "bagerhat", divisionId: "khulna", nameBn: "বাগেরহাট", nameEn: "Bagerhat" },
  { id: "jhenaidah", divisionId: "khulna", nameBn: "ঝিনাইদহ", nameEn: "Jhenaidah" },
  { id: "chuadanga", divisionId: "khulna", nameBn: "চুয়াডাঙ্গা", nameEn: "Chuadanga" },
  { id: "magura", divisionId: "khulna", nameBn: "মাগুরা", nameEn: "Magura" },
  { id: "meherpur", divisionId: "khulna", nameBn: "মেহেরপুর", nameEn: "Meherpur" },
  { id: "narail", divisionId: "khulna", nameBn: "নড়াইল", nameEn: "Narail" },

  // Barishal Division (6)
  { id: "barishal", divisionId: "barishal", nameBn: "বরিশাল", nameEn: "Barishal" },
  { id: "patuakhali", divisionId: "barishal", nameBn: "পটুয়াখালী", nameEn: "Patuakhali" },
  { id: "bhola", divisionId: "barishal", nameBn: "ভোলা", nameEn: "Bhola" },
  { id: "pirojpur", divisionId: "barishal", nameBn: "পিরোজপুর", nameEn: "Pirojpur" },
  { id: "barguna", divisionId: "barishal", nameBn: "বরগুনা", nameEn: "Barguna" },
  { id: "jhalokati", divisionId: "barishal", nameBn: "ঝালকাঠি", nameEn: "Jhalokati" },

  // Sylhet Division (4)
  { id: "sylhet", divisionId: "sylhet", nameBn: "সিলেট", nameEn: "Sylhet" },
  { id: "moulvibazar", divisionId: "sylhet", nameBn: "মৌলভীবাজার", nameEn: "Moulvibazar" },
  { id: "habiganj", divisionId: "sylhet", nameBn: "হবিগঞ্জ", nameEn: "Habiganj" },
  { id: "sunamganj", divisionId: "sylhet", nameBn: "সুনামগঞ্জ", nameEn: "Sunamganj" },

  // Rangpur Division (8)
  { id: "rangpur", divisionId: "rangpur", nameBn: "রংপুর", nameEn: "Rangpur" },
  { id: "dinajpur", divisionId: "rangpur", nameBn: "দিনাজপুর", nameEn: "Dinajpur" },
  { id: "kurigram", divisionId: "rangpur", nameBn: "কুড়িগ্রাম", nameEn: "Kurigram" },
  { id: "gaibandha", divisionId: "rangpur", nameBn: "গাইবান্ধা", nameEn: "Gaibandha" },
  { id: "nilphamari", divisionId: "rangpur", nameBn: "নীলফামারী", nameEn: "Nilphamari" },
  { id: "lalmonirhat", divisionId: "rangpur", nameBn: "লালমনিরহাট", nameEn: "Lalmonirhat" },
  { id: "thakurgaon", divisionId: "rangpur", nameBn: "ঠাকুরগাঁও", nameEn: "Thakurgaon" },
  { id: "panchagarh", divisionId: "rangpur", nameBn: "পঞ্চগড়", nameEn: "Panchagarh" },

  // Mymensingh Division (4)
  { id: "mymensingh", divisionId: "mymensingh", nameBn: "ময়মনসিংহ", nameEn: "Mymensingh" },
  { id: "jamalpur", divisionId: "mymensingh", nameBn: "জামালপুর", nameEn: "Jamalpur" },
  { id: "netrokona", divisionId: "mymensingh", nameBn: "নেত্রকোণা", nameEn: "Netrokona" },
  { id: "sherpur", divisionId: "mymensingh", nameBn: "শেরপুর", nameEn: "Sherpur" },
] as const;

/**
 * Verified Upazilas and Thanas for major districts.
 * Designed for modular expansion; each record maps directly to a verified district ID.
 */
export const BANGLADESH_UPAZILAS: readonly Upazila[] = [
  // Dhaka District Upazilas & Thanas
  { id: "dhanmondi", districtId: "dhaka", nameBn: "ধানমন্ডি", nameEn: "Dhanmondi" },
  { id: "gulshan", districtId: "dhaka", nameBn: "গুলশান", nameEn: "Gulshan" },
  { id: "mirpur", districtId: "dhaka", nameBn: "মিরপুর", nameEn: "Mirpur" },
  { id: "uttara", districtId: "dhaka", nameBn: "উত্তরা", nameEn: "Uttara" },
  { id: "mohammadpur", districtId: "dhaka", nameBn: "মোহাম্মদপুর", nameEn: "Mohammadpur" },
  { id: "motijheel", districtId: "dhaka", nameBn: "মতিঝিল", nameEn: "Motijheel" },
  { id: "tejgaon", districtId: "dhaka", nameBn: "তেজগাঁও", nameEn: "Tejgaon" },
  { id: "banani", districtId: "dhaka", nameBn: "বনানী", nameEn: "Banani" },
  { id: "shahbagh", districtId: "dhaka", nameBn: "শাহবাগ", nameEn: "Shahbagh" },
  { id: "savar", districtId: "dhaka", nameBn: "সাভার", nameEn: "Savar" },
  { id: "keraniganj", districtId: "dhaka", nameBn: "কেরানীগঞ্জ", nameEn: "Keraniganj" },
  { id: "dhamrai", districtId: "dhaka", nameBn: "ধামরাই", nameEn: "Dhamrai" },
  { id: "dohar", districtId: "dhaka", nameBn: "দোহার", nameEn: "Dohar" },
  { id: "nawabganj-dhaka", districtId: "dhaka", nameBn: "নবাবগঞ্জ", nameEn: "Nawabganj" },

  // Gazipur District Upazilas
  { id: "gazipur-sadar", districtId: "gazipur", nameBn: "গাজীপুর সদর", nameEn: "Gazipur Sadar" },
  { id: "tongi", districtId: "gazipur", nameBn: "টঙ্গী", nameEn: "Tongi" },
  { id: "kaliakair", districtId: "gazipur", nameBn: "কালিয়াকৈর", nameEn: "Kaliakair" },
  { id: "kaliganj-gazipur", districtId: "gazipur", nameBn: "কালীগঞ্জ", nameEn: "Kaliganj" },
  { id: "kapasia", districtId: "gazipur", nameBn: "কাপাসিয়া", nameEn: "Kapasia" },
  { id: "sreepur-gazipur", districtId: "gazipur", nameBn: "শ্রীপুর", nameEn: "Sreepur" },

  // Narayanganj District Upazilas
  { id: "narayanganj-sadar", districtId: "narayanganj", nameBn: "নারায়ণগঞ্জ সদর", nameEn: "Narayanganj Sadar" },
  { id: "bandar", districtId: "narayanganj", nameBn: "বন্দর", nameEn: "Bandar" },
  { id: "rupganj", districtId: "narayanganj", nameBn: "রূপগঞ্জ", nameEn: "Rupganj" },
  { id: "sonargaon", districtId: "narayanganj", nameBn: "সোনারগাঁও", nameEn: "Sonargaon" },
  { id: "araihazar", districtId: "narayanganj", nameBn: "আড়াইহাজার", nameEn: "Araihazar" },

  // Chattogram District Upazilas & Thanas
  { id: "kotwali-chattogram", districtId: "chattogram", nameBn: "কোতোয়ালী", nameEn: "Kotwali" },
  { id: "panchlaish", districtId: "chattogram", nameBn: "পাঁচলাইশ", nameEn: "Panchlaish" },
  { id: "pahartali", districtId: "chattogram", nameBn: "পাহাড়তলী", nameEn: "Pahartali" },
  { id: "halishahar", districtId: "chattogram", nameBn: "হালিশহর", nameEn: "Halishahar" },
  { id: "patenga", districtId: "chattogram", nameBn: "পতেঙ্গা", nameEn: "Patenga" },
  { id: "chandgaon", districtId: "chattogram", nameBn: "চান্দগাঁও", nameEn: "Chandgaon" },
  { id: "hathazari", districtId: "chattogram", nameBn: "হাটহাজারী", nameEn: "Hathazari" },
  { id: "sitakunda", districtId: "chattogram", nameBn: "সীতাকুণ্ড", nameEn: "Sitakunda" },
  { id: "mirsharai", districtId: "chattogram", nameBn: "মীরসরাই", nameEn: "Mirsharai" },
  { id: "raozan", districtId: "chattogram", nameBn: "রাউজান", nameEn: "Raozan" },
  { id: "rangunia", districtId: "chattogram", nameBn: "রাঙ্গুনিয়া", nameEn: "Rangunia" },
  { id: "patiya", districtId: "chattogram", nameBn: "পটিয়া", nameEn: "Patiya" },
  { id: "boalkhali", districtId: "chattogram", nameBn: "বোয়ালখালী", nameEn: "Boalkhali" },
  { id: "anwara", districtId: "chattogram", nameBn: "আনোয়ারা", nameEn: "Anwara" },

  // Cox's Bazar Upazilas
  { id: "coxs-bazar-sadar", districtId: "coxs-bazar", nameBn: "কক্সবাজার সদর", nameEn: "Cox's Bazar Sadar" },
  { id: "chakaria", districtId: "coxs-bazar", nameBn: "চকোরিয়া", nameEn: "Chakaria" },
  { id: "teknaf", districtId: "coxs-bazar", nameBn: "টেকনাফ", nameEn: "Teknaf" },
  { id: "ramu", districtId: "coxs-bazar", nameBn: "রামু", nameEn: "Ramu" },
  { id: "ukhiya", districtId: "coxs-bazar", nameBn: "উখিয়া", nameEn: "Ukhiya" },

  // Rajshahi District Upazilas & Thanas
  { id: "boalia", districtId: "rajshahi", nameBn: "বোয়ালিয়া", nameEn: "Boalia" },
  { id: "rajpara", districtId: "rajshahi", nameBn: "রাজপাড়া", nameEn: "Rajpara" },
  { id: "motihar", districtId: "rajshahi", nameBn: "মতিহার", nameEn: "Motihar" },
  { id: "shah-makhdum", districtId: "rajshahi", nameBn: "শাহ মখদুম", nameEn: "Shah Makhdum" },
  { id: "paba", districtId: "rajshahi", nameBn: "পবা", nameEn: "Paba" },
  { id: "durgapur-rajshahi", districtId: "rajshahi", nameBn: "দুর্গাপুর", nameEn: "Durgapur" },
  { id: "bagmara", districtId: "rajshahi", nameBn: "বাগমারা", nameEn: "Bagmara" },
  { id: "charghat", districtId: "rajshahi", nameBn: "চারঘাট", nameEn: "Charghat" },
  { id: "puthia", districtId: "rajshahi", nameBn: "পুঠিয়া", nameEn: "Puthia" },
  { id: "godagari", districtId: "rajshahi", nameBn: "গোদাগাড়ী", nameEn: "Godagari" },
  { id: "tanore", districtId: "rajshahi", nameBn: "তানোর", nameEn: "Tanore" },

  // Sylhet District Upazilas
  { id: "sylhet-sadar", districtId: "sylhet", nameBn: "সিলেট সদর", nameEn: "Sylhet Sadar" },
  { id: "south-surma", districtId: "sylhet", nameBn: "দক্ষিণ সুরমা", nameEn: "South Surma" },
  { id: "beanibazar", districtId: "sylhet", nameBn: "বিয়ানীবাজার", nameEn: "Beanibazar" },
  { id: "golapganj", districtId: "sylhet", nameBn: "গোলাপগঞ্জ", nameEn: "Golapganj" },
  { id: "biswanath", districtId: "sylhet", nameBn: "বিশ্বনাথ", nameEn: "Biswanath" },
  { id: "fenchuganj", districtId: "sylhet", nameBn: "ফেঞ্চুগঞ্জ", nameEn: "Fenchuganj" },
  { id: "balaganj", districtId: "sylhet", nameBn: "বালাগঞ্জ", nameEn: "Balaganj" },
  { id: "gowainghat", districtId: "sylhet", nameBn: "গোয়াইনঘাট", nameEn: "Gowainghat" },
  { id: "osmani-nagar", districtId: "sylhet", nameBn: "ওসমানী নগর", nameEn: "Osmani Nagar" },

  // Khulna District Upazilas & Thanas
  { id: "khulna-sadar", districtId: "khulna", nameBn: "খুলনা সদর", nameEn: "Khulna Sadar" },
  { id: "sonadanga", districtId: "khulna", nameBn: "সোনাডাঙ্গা", nameEn: "Sonadanga" },
  { id: "khalishpur", districtId: "khulna", nameBn: "খালিশপুর", nameEn: "Khalishpur" },
  { id: "daulatpur-khulna", districtId: "khulna", nameBn: "দৌলতপুর", nameEn: "Daulatpur" },
  { id: "rupsha", districtId: "khulna", nameBn: "রূপসা", nameEn: "Rupsha" },
  { id: "dumuria", districtId: "khulna", nameBn: "ডুমুরিয়া", nameEn: "Dumuria" },
  { id: "batiaghata", districtId: "khulna", nameBn: "বটিয়াঘাটা", nameEn: "Batiaghata" },

  // Barishal District Upazilas
  { id: "barishal-sadar", districtId: "barishal", nameBn: "বরিশাল সদর", nameEn: "Barishal Sadar" },
  { id: "babuganj", districtId: "barishal", nameBn: "বাবুগঞ্জ", nameEn: "Babuganj" },
  { id: "bakerganj", districtId: "barishal", nameBn: "বাকেরগঞ্জ", nameEn: "Bakerganj" },
  { id: "banaripara", districtId: "barishal", nameBn: "বানারীপাড়া", nameEn: "Banaripara" },
  { id: "gaurnadi", districtId: "barishal", nameBn: "গৌরনদী", nameEn: "Gaurnadi" },

  // Rangpur District Upazilas
  { id: "rangpur-sadar", districtId: "rangpur", nameBn: "রংপুর সদর", nameEn: "Rangpur Sadar" },
  { id: "badarganj", districtId: "rangpur", nameBn: "বদরগঞ্জ", nameEn: "Badarganj" },
  { id: "mithapukur", districtId: "rangpur", nameBn: "মিঠাপুকুর", nameEn: "Mithapukur" },
  { id: "pirganj-rangpur", districtId: "rangpur", nameBn: "পীরগঞ্জ", nameEn: "Pirganj" },
  { id: "kaunia", districtId: "rangpur", nameBn: "কাউনিয়া", nameEn: "Kaunia" },

  // Mymensingh District Upazilas
  { id: "mymensingh-sadar", districtId: "mymensingh", nameBn: "ময়মনসিংহ সদর", nameEn: "Mymensingh Sadar" },
  { id: "muktagachha", districtId: "mymensingh", nameBn: "মুক্তাগাছা", nameEn: "Muktagachha" },
  { id: "trishal", districtId: "mymensingh", nameBn: "ত্রিশাল", nameEn: "Trishal" },
  { id: "bhaluka", districtId: "mymensingh", nameBn: "ভালুকা", nameEn: "Bhaluka" },
  { id: "gaffargaon", districtId: "mymensingh", nameBn: "গফরগাঁও", nameEn: "Gaffargaon" },
] as const;

/**
 * Returns all 8 administrative divisions of Bangladesh.
 */
export function getDivisions(): readonly Division[] {
  return BANGLADESH_DIVISIONS;
}

/**
 * Returns districts filtered by division, or all 64 districts if divisionId is omitted.
 */
export function getDistricts(divisionId?: string): readonly District[] {
  if (!divisionId) return BANGLADESH_DISTRICTS;
  return BANGLADESH_DISTRICTS.filter((d) => d.divisionId === divisionId);
}

/**
 * Returns verified upazilas filtered by district, or all verified upazilas if districtId is omitted.
 */
export function getUpazilas(districtId?: string): readonly Upazila[] {
  if (!districtId) return BANGLADESH_UPAZILAS;
  return BANGLADESH_UPAZILAS.filter((u) => u.districtId === districtId);
}

/**
 * Finds a division by its stable ID.
 */
export function getDivisionById(id: string): Division | undefined {
  return BANGLADESH_DIVISIONS.find((d) => d.id === id);
}

/**
 * Finds a district by its stable ID.
 */
export function getDistrictById(id: string): District | undefined {
  return BANGLADESH_DISTRICTS.find((d) => d.id === id);
}

/**
 * Finds an upazila by its stable ID.
 */
export function getUpazilaById(id: string): Upazila | undefined {
  return BANGLADESH_UPAZILAS.find((u) => u.id === id);
}

/**
 * Formats a hierarchical location label in the specified language.
 * Output format: "[Upazila, ][District, ]Division"
 */
export function formatLocation(
  location: { divisionId: string; districtId?: string; upazilaId?: string; area?: string },
  locale: Locale = "bn"
): string {
  const parts: string[] = [];

  if (location.area) {
    parts.push(location.area.trim());
  }

  if (location.upazilaId) {
    const upazila = getUpazilaById(location.upazilaId);
    if (upazila) {
      parts.push(locale === "en" ? upazila.nameEn : upazila.nameBn);
    }
  }

  if (location.districtId) {
    const district = getDistrictById(location.districtId);
    if (district) {
      parts.push(locale === "en" ? district.nameEn : district.nameBn);
    }
  }

  const division = getDivisionById(location.divisionId);
  if (division) {
    parts.push(locale === "en" ? division.nameEn : division.nameBn);
  }

  return parts.join(", ");
}
