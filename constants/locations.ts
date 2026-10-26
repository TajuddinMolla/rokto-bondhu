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
 * Comprehensive Upazilas and Thanas for ALL 64 districts of Bangladesh (সকল ৬৪টি জেলার উপজেলা ও থানা)
 */
export const BANGLADESH_UPAZILAS: readonly Upazila[] = [
  // ==================== DHAKA DIVISION ====================
  // 1. Dhaka District
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
  { id: "badda", districtId: "dhaka", nameBn: "বাড্ডা", nameEn: "Badda" },
  { id: "khilgaon", districtId: "dhaka", nameBn: "খিলগাঁও", nameEn: "Khilgaon" },
  { id: "paltan", districtId: "dhaka", nameBn: "পল্টন", nameEn: "Paltan" },
  { id: "ramna", districtId: "dhaka", nameBn: "রমনা", nameEn: "Ramna" },
  { id: "jatrabari", districtId: "dhaka", nameBn: "যাত্রাবাড়ী", nameEn: "Jatrabari" },
  { id: "lalbagh", districtId: "dhaka", nameBn: "লালবাগ", nameEn: "Lalbagh" },

  // 2. Gazipur District
  { id: "gazipur-sadar", districtId: "gazipur", nameBn: "গাজীপুর সদর", nameEn: "Gazipur Sadar" },
  { id: "tongi", districtId: "gazipur", nameBn: "টঙ্গী", nameEn: "Tongi" },
  { id: "kaliakair", districtId: "gazipur", nameBn: "কালিয়াকৈর", nameEn: "Kaliakair" },
  { id: "kaliganj-gazipur", districtId: "gazipur", nameBn: "কালীগঞ্জ", nameEn: "Kaliganj" },
  { id: "kapasia", districtId: "gazipur", nameBn: "কাপাসিয়া", nameEn: "Kapasia" },
  { id: "sreepur-gazipur", districtId: "gazipur", nameBn: "শ্রীপুর", nameEn: "Sreepur" },

  // 3. Narayanganj District
  { id: "narayanganj-sadar", districtId: "narayanganj", nameBn: "নারায়ণগঞ্জ সদর", nameEn: "Narayanganj Sadar" },
  { id: "bandar", districtId: "narayanganj", nameBn: "বন্দর", nameEn: "Bandar" },
  { id: "rupganj", districtId: "narayanganj", nameBn: "রূপগঞ্জ", nameEn: "Rupganj" },
  { id: "sonargaon", districtId: "narayanganj", nameBn: "সোনারগাঁও", nameEn: "Sonargaon" },
  { id: "araihazar", districtId: "narayanganj", nameBn: "আড়াইহাজার", nameEn: "Araihazar" },

  // 4. Tangail District
  { id: "tangail-sadar", districtId: "tangail", nameBn: "টাঙ্গাইল সদর", nameEn: "Tangail Sadar" },
  { id: "mirzapur", districtId: "tangail", nameBn: "মির্জাপুর", nameEn: "Mirzapur" },
  { id: "ghatail", districtId: "tangail", nameBn: "ঘাটাইল", nameEn: "Ghatail" },
  { id: "madhupur", districtId: "tangail", nameBn: "মধুপুর", nameEn: "Madhupur" },
  { id: "gopalpur-tangail", districtId: "tangail", nameBn: "গোপালপুর", nameEn: "Gopalpur" },
  { id: "kalihati", districtId: "tangail", nameBn: "কালিহাতী", nameEn: "Kalihati" },
  { id: "sakhipur", districtId: "tangail", nameBn: "সখিপুর", nameEn: "Sakhipur" },
  { id: "bhuapur", districtId: "tangail", nameBn: "ভূঞাপুর", nameEn: "Bhuapur" },
  { id: "delduar", districtId: "tangail", nameBn: "দেলদুয়ার", nameEn: "Delduar" },
  { id: "nagarpur", districtId: "tangail", nameBn: "নাগরপুর", nameEn: "Nagarpur" },
  { id: "dhanbari", districtId: "tangail", nameBn: "ধনবাড়ী", nameEn: "Dhanbari" },
  { id: "basail", districtId: "tangail", nameBn: "বাসাইল", nameEn: "Basail" },

  // 5. Narsingdi District
  { id: "narsingdi-sadar", districtId: "narsingdi", nameBn: "নরসিংদী সদর", nameEn: "Narsingdi Sadar" },
  { id: "raipura", districtId: "narsingdi", nameBn: "রায়পুরা", nameEn: "Raipura" },
  { id: "shibpur", districtId: "narsingdi", nameBn: "শিবপুর", nameEn: "Shibpur" },
  { id: "belabo", districtId: "narsingdi", nameBn: "বেলাবো", nameEn: "Belabo" },
  { id: "palash", districtId: "narsingdi", nameBn: "পলাশ", nameEn: "Palash" },
  { id: "monohardi", districtId: "narsingdi", nameBn: "মনোহরদী", nameEn: "Monohardi" },

  // 6. Manikganj District
  { id: "manikganj-sadar", districtId: "manikganj", nameBn: "মানিকগঞ্জ সদর", nameEn: "Manikganj Sadar" },
  { id: "singair", districtId: "manikganj", nameBn: "সিংগাইর", nameEn: "Singair" },
  { id: "saturia", districtId: "manikganj", nameBn: "সাটুরিয়া", nameEn: "Saturia" },
  { id: "shibalaya", districtId: "manikganj", nameBn: "শিবালয়", nameEn: "Shibalaya" },
  { id: "harirampur", districtId: "manikganj", nameBn: "হরিরামপুর", nameEn: "Harirampur" },
  { id: "ghior", districtId: "manikganj", nameBn: "ঘিওর", nameEn: "Ghior" },
  { id: "daulatpur-manikganj", districtId: "manikganj", nameBn: "দৌলতপুর", nameEn: "Daulatpur" },

  // 7. Munshiganj District
  { id: "munshiganj-sadar", districtId: "munshiganj", nameBn: "মুন্সীগঞ্জ সদর", nameEn: "Munshiganj Sadar" },
  { id: "sreenagar", districtId: "munshiganj", nameBn: "শ্রীনগর", nameEn: "Sreenagar" },
  { id: "sirajdikhan", districtId: "munshiganj", nameBn: "সিরাজদিখান", nameEn: "Sirajdikhan" },
  { id: "louhajang", districtId: "munshiganj", nameBn: "লৌহজং", nameEn: "Louhajang" },
  { id: "tongibari", districtId: "munshiganj", nameBn: "টংগিবাড়ী", nameEn: "Tongibari" },
  { id: "gazaria", districtId: "munshiganj", nameBn: "গজারিয়া", nameEn: "Gazaria" },

  // 8. Faridpur District
  { id: "faridpur-sadar", districtId: "faridpur", nameBn: "ফরিদপুর সদর", nameEn: "Faridpur Sadar" },
  { id: "boalmari", districtId: "faridpur", nameBn: "বোয়ালমারী", nameEn: "Boalmari" },
  { id: "alfadanga", districtId: "faridpur", nameBn: "আলফাডাঙ্গা", nameEn: "Alfadanga" },
  { id: "madhukhali", districtId: "faridpur", nameBn: "মধুখালী", nameEn: "Madhukhali" },
  { id: "bhanga", districtId: "faridpur", nameBn: "ভাঙ্গা", nameEn: "Bhanga" },
  { id: "nagarkanda", districtId: "faridpur", nameBn: "নগরকান্দা", nameEn: "Nagarkanda" },
  { id: "charbhadrasan", districtId: "faridpur", nameBn: "চরভদ্রাসন", nameEn: "Charbhadrasan" },
  { id: "sadarpur", districtId: "faridpur", nameBn: "সদরপুর", nameEn: "Sadarpur" },
  { id: "saltha", districtId: "faridpur", nameBn: "সালথা", nameEn: "Saltha" },

  // 9. Gopalganj District
  { id: "gopalganj-sadar", districtId: "gopalganj", nameBn: "গোপালগঞ্জ সদর", nameEn: "Gopalganj Sadar" },
  { id: "kashiani", districtId: "gopalganj", nameBn: "কাশিয়ানী", nameEn: "Kashiani" },
  { id: "kotalipara", districtId: "gopalganj", nameBn: "কোটালীপাড়া", nameEn: "Kotalipara" },
  { id: "muksudpur", districtId: "gopalganj", nameBn: "মুকসুদপুর", nameEn: "Muksudpur" },
  { id: "tungipara", districtId: "gopalganj", nameBn: "টুঙ্গিপাড়া", nameEn: "Tungipara" },

  // 10. Madaripur District
  { id: "madaripur-sadar", districtId: "madaripur", nameBn: "মাদারীপুর সদর", nameEn: "Madaripur Sadar" },
  { id: "shibchar", districtId: "madaripur", nameBn: "শিবচর", nameEn: "Shibchar" },
  { id: "kalkini", districtId: "madaripur", nameBn: "কালকিনি", nameEn: "Kalkini" },
  { id: "rajoir", districtId: "madaripur", nameBn: "রাজৈর", nameEn: "Rajoir" },
  { id: "dasar", districtId: "madaripur", nameBn: "ডাসার", nameEn: "Dasar" },

  // 11. Rajbari District
  { id: "rajbari-sadar", districtId: "rajbari", nameBn: "রাজবাড়ী সদর", nameEn: "Rajbari Sadar" },
  { id: "goalanda", districtId: "rajbari", nameBn: "গোয়ালন্দ", nameEn: "Goalanda" },
  { id: "pangsha", districtId: "rajbari", nameBn: "পাংশা", nameEn: "Pangsha" },
  { id: "baliakandi", districtId: "rajbari", nameBn: "বালিয়াকান্দি", nameEn: "Baliakandi" },
  { id: "kalukhali", districtId: "rajbari", nameBn: "কালুখালী", nameEn: "Kalukhali" },

  // 12. Shariatpur District
  { id: "shariatpur-sadar", districtId: "shariatpur", nameBn: "শরীয়তপুর সদর", nameEn: "Shariatpur Sadar" },
  { id: "damudya", districtId: "shariatpur", nameBn: "ডামুড্যা", nameEn: "Damudya" },
  { id: "naria", districtId: "shariatpur", nameBn: "নড়িয়া", nameEn: "Naria" },
  { id: "jajira", districtId: "shariatpur", nameBn: "জাজিরা", nameEn: "Jajira" },
  { id: "bhedarganj", districtId: "shariatpur", nameBn: "ভেদরগঞ্জ", nameEn: "Bhedarganj" },
  { id: "gosairhat", districtId: "shariatpur", nameBn: "গোসাইরহাট", nameEn: "Gosairhat" },

  // 13. Kishoreganj District
  { id: "kishoreganj-sadar", districtId: "kishoreganj", nameBn: "কিশোরগঞ্জ সদর", nameEn: "Kishoreganj Sadar" },
  { id: "bajitpur", districtId: "kishoreganj", nameBn: "বাজিতপুর", nameEn: "Bajitpur" },
  { id: "bhairab", districtId: "kishoreganj", nameBn: "ভৈরব", nameEn: "Bhairab" },
  { id: "hossainpur", districtId: "kishoreganj", nameBn: "হোসেনপুর", nameEn: "Hossainpur" },
  { id: "itna", districtId: "kishoreganj", nameBn: "ইটনা", nameEn: "Itna" },
  { id: "karimganj", districtId: "kishoreganj", nameBn: "করিমগঞ্জ", nameEn: "Karimganj" },
  { id: "katiadi", districtId: "kishoreganj", nameBn: "কটিয়াদী", nameEn: "Katiadi" },
  { id: "kuliarchar", districtId: "kishoreganj", nameBn: "কুলিয়ারচর", nameEn: "Kuliarchar" },
  { id: "mithamain", districtId: "kishoreganj", nameBn: "মিঠামইন", nameEn: "Mithamain" },
  { id: "nikli", districtId: "kishoreganj", nameBn: "নিকলী", nameEn: "Nikli" },
  { id: "pakundia", districtId: "kishoreganj", nameBn: "পাকুন্দিয়া", nameEn: "Pakundia" },
  { id: "tarail", districtId: "kishoreganj", nameBn: "তাড়াইল", nameEn: "Tarail" },

  // ==================== CHATTOGRAM DIVISION ====================
  // 14. Chattogram District
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
  { id: "banshkhali", districtId: "chattogram", nameBn: "বাঁশখালী", nameEn: "Banshkhali" },
  { id: "chandanaish", districtId: "chattogram", nameBn: "চন্দনাইশ", nameEn: "Chandanaish" },
  { id: "fatikchhari", districtId: "chattogram", nameBn: "ফটিকছড়ি", nameEn: "Fatikchhari" },
  { id: "lohagara-chattogram", districtId: "chattogram", nameBn: "লোহাগাড়া", nameEn: "Lohagara" },
  { id: "satkania", districtId: "chattogram", nameBn: "সাতকানিয়া", nameEn: "Satkania" },
  { id: "sandwip", districtId: "chattogram", nameBn: "সন্দ্বীপ", nameEn: "Sandwip" },
  { id: "karnaphuli", districtId: "chattogram", nameBn: "কর্ণফুলী", nameEn: "Karnaphuli" },

  // 15. Cox's Bazar District
  { id: "coxs-bazar-sadar", districtId: "coxs-bazar", nameBn: "কক্সবাজার সদর", nameEn: "Cox's Bazar Sadar" },
  { id: "chakaria", districtId: "coxs-bazar", nameBn: "চকোরিয়া", nameEn: "Chakaria" },
  { id: "teknaf", districtId: "coxs-bazar", nameBn: "টেকনাফ", nameEn: "Teknaf" },
  { id: "ramu", districtId: "coxs-bazar", nameBn: "রামু", nameEn: "Ramu" },
  { id: "ukhiya", districtId: "coxs-bazar", nameBn: "উখিয়া", nameEn: "Ukhiya" },
  { id: "pekua", districtId: "coxs-bazar", nameBn: "পেকুয়া", nameEn: "Pekua" },
  { id: "kutubdia", districtId: "coxs-bazar", nameBn: "কুতুবদিয়া", nameEn: "Kutubdia" },
  { id: "moheshkhali", districtId: "coxs-bazar", nameBn: "মহেশখালী", nameEn: "Moheshkhali" },

  // 16. Cumilla District
  { id: "cumilla-adarsha-sadar", districtId: "cumilla", nameBn: "কুমিল্লা আদর্শ সদর", nameEn: "Cumilla Adarsha Sadar" },
  { id: "cumilla-sadar-dakshin", districtId: "cumilla", nameBn: "কুমিল্লা সদর দক্ষিণ", nameEn: "Cumilla Sadar Dakshin" },
  { id: "barura", districtId: "cumilla", nameBn: "বরুড়া", nameEn: "Barura" },
  { id: "brahmanpara", districtId: "cumilla", nameBn: "ব্রাহ্মণপাড়া", nameEn: "Brahmanpara" },
  { id: "burichang", districtId: "cumilla", nameBn: "বুড়িচং", nameEn: "Burichang" },
  { id: "chandina", districtId: "cumilla", nameBn: "চান্দিনা", nameEn: "Chandina" },
  { id: "chauddagram", districtId: "cumilla", nameBn: "চৌদ্দগ্রাম", nameEn: "Chauddagram" },
  { id: "daudkandi", districtId: "cumilla", nameBn: "দাউদকান্দি", nameEn: "Daudkandi" },
  { id: "debidwar", districtId: "cumilla", nameBn: "দেবিদ্বার", nameEn: "Debidwar" },
  { id: "homna", districtId: "cumilla", nameBn: "হোমনা", nameEn: "Homna" },
  { id: "laksam", districtId: "cumilla", nameBn: "লাকসাম", nameEn: "Laksam" },
  { id: "lalmai", districtId: "cumilla", nameBn: "লালমাই", nameEn: "Lalmai" },
  { id: "meghna", districtId: "cumilla", nameBn: "মেঘনা", nameEn: "Meghna" },
  { id: "monohargonj", districtId: "cumilla", nameBn: "মনোহরগঞ্জ", nameEn: "Monohargonj" },
  { id: "muradnagar", districtId: "cumilla", nameBn: "মুরাদনগর", nameEn: "Muradnagar" },
  { id: "nangalkot", districtId: "cumilla", nameBn: "নাঙ্গলকোট", nameEn: "Nangalkot" },
  { id: "titas", districtId: "cumilla", nameBn: "তিতাস", nameEn: "Titas" },

  // 17. Feni District
  { id: "feni-sadar", districtId: "feni", nameBn: "ফেনী সদর", nameEn: "Feni Sadar" },
  { id: "chhagalnaiya", districtId: "feni", nameBn: "ছাগলনাইয়া", nameEn: "Chhagalnaiya" },
  { id: "daganbhuiyan", districtId: "feni", nameBn: "দাগনভূঞা", nameEn: "Daganbhuiyan" },
  { id: "parshuram", districtId: "feni", nameBn: "পরশুরাম", nameEn: "Parshuram" },
  { id: "fulgazi", districtId: "feni", nameBn: "ফুলগাজী", nameEn: "Fulgazi" },
  { id: "sonagazi", districtId: "feni", nameBn: "সোনাগাজী", nameEn: "Sonagazi" },

  // 18. Brahmanbaria District
  { id: "brahmanbaria-sadar", districtId: "brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া সদর", nameEn: "Brahmanbaria Sadar" },
  { id: "ashuganj", districtId: "brahmanbaria", nameBn: "আশুগঞ্জ", nameEn: "Ashuganj" },
  { id: "bancharampur", districtId: "brahmanbaria", nameBn: "বাঞ্ছারামপুর", nameEn: "Bancharampur" },
  { id: "kasba", districtId: "brahmanbaria", nameBn: "কসবা", nameEn: "Kasba" },
  { id: "nabinagar", districtId: "brahmanbaria", nameBn: "নবীনগর", nameEn: "Nabinagar" },
  { id: "nasirnagar", districtId: "brahmanbaria", nameBn: "নাসিরনগর", nameEn: "Nasirnagar" },
  { id: "sarail", districtId: "brahmanbaria", nameBn: "সরাইল", nameEn: "Sarail" },
  { id: "akhaura", districtId: "brahmanbaria", nameBn: "আখাউড়া", nameEn: "Akhaura" },
  { id: "bijoynagar", districtId: "brahmanbaria", nameBn: "বিজয়নগর", nameEn: "Bijoynagar" },

  // 19. Noakhali District
  { id: "noakhali-sadar", districtId: "noakhali", nameBn: "নোয়াখালী সদর", nameEn: "Noakhali Sadar" },
  { id: "begumganj", districtId: "noakhali", nameBn: "বেগমগঞ্জ", nameEn: "Begumganj" },
  { id: "chatkhil", districtId: "noakhali", nameBn: "চাটখিল", nameEn: "Chatkhil" },
  { id: "companiganj-noakhali", districtId: "noakhali", nameBn: "কোম্পানীগঞ্জ", nameEn: "Companiganj" },
  { id: "hatiya", districtId: "noakhali", nameBn: "হাতিয়া", nameEn: "Hatiya" },
  { id: "senbagh", districtId: "noakhali", nameBn: "সেনবাগ", nameEn: "Senbagh" },
  { id: "sonaimuri", districtId: "noakhali", nameBn: "সোনাইমুড়ী", nameEn: "Sonaimuri" },
  { id: "subarnachar", districtId: "noakhali", nameBn: "সুবর্ণচর", nameEn: "Subarnachar" },
  { id: "kabirhat", districtId: "noakhali", nameBn: "কবিরহাট", nameEn: "Kabirhat" },

  // 20. Chandpur District
  { id: "chandpur-sadar", districtId: "chandpur", nameBn: "চাঁদপুর সদর", nameEn: "Chandpur Sadar" },
  { id: "faridganj", districtId: "chandpur", nameBn: "ফরিদগঞ্জ", nameEn: "Faridganj" },
  { id: "haimchar", districtId: "chandpur", nameBn: "হাইমচর", nameEn: "Haimchar" },
  { id: "haziganj", districtId: "chandpur", nameBn: "হাজীগঞ্জ", nameEn: "Haziganj" },
  { id: "kachua-chandpur", districtId: "chandpur", nameBn: "কচুয়া", nameEn: "Kachua" },
  { id: "matlab-dakshin", districtId: "chandpur", nameBn: "মতলব দক্ষিণ", nameEn: "Matlab Dakshin" },
  { id: "matlab-uttar", districtId: "chandpur", nameBn: "মতলব উত্তর", nameEn: "Matlab Uttar" },
  { id: "shahrasti", districtId: "chandpur", nameBn: "শাহরাস্তি", nameEn: "Shahrasti" },

  // 21. Lakshmipur District
  { id: "lakshmipur-sadar", districtId: "lakshmipur", nameBn: "লক্ষ্মীপুর সদর", nameEn: "Lakshmipur Sadar" },
  { id: "raipur", districtId: "lakshmipur", nameBn: "রায়পুর", nameEn: "Raipur" },
  { id: "ramganj", districtId: "lakshmipur", nameBn: "রামগঞ্জ", nameEn: "Ramganj" },
  { id: "ramgati", districtId: "lakshmipur", nameBn: "রামগতি", nameEn: "Ramgati" },
  { id: "kamalnagar", districtId: "lakshmipur", nameBn: "কমলনগর", nameEn: "Kamalnagar" },

  // 22. Rangamati District
  { id: "rangamati-sadar", districtId: "rangamati", nameBn: "রাঙ্গামাটি সদর", nameEn: "Rangamati Sadar" },
  { id: "baghaichhari", districtId: "rangamati", nameBn: "বাঘাইছড়ি", nameEn: "Baghaichhari" },
  { id: "barkal", districtId: "rangamati", nameBn: "বরকল", nameEn: "Barkal" },
  { id: "belaichhari", districtId: "rangamati", nameBn: "বিলাইছড়ি", nameEn: "Belaichhari" },
  { id: "juraichhari", districtId: "rangamati", nameBn: "জুরাইছড়ি", nameEn: "Juraichhari" },
  { id: "kaptai", districtId: "rangamati", nameBn: "কাপ্তাই", nameEn: "Kaptai" },
  { id: "kawkhali-rangamati", districtId: "rangamati", nameBn: "কাউখালী", nameEn: "Kawkhali" },
  { id: "langadu", districtId: "rangamati", nameBn: "লংগদু", nameEn: "Langadu" },
  { id: "naniarchar", districtId: "rangamati", nameBn: "নানিয়ারচর", nameEn: "Naniarchar" },
  { id: "rajasthali", districtId: "rangamati", nameBn: "রাজস্থলী", nameEn: "Rajasthali" },

  // 23. Bandarban District
  { id: "bandarban-sadar", districtId: "bandarban", nameBn: "বান্দরবান সদর", nameEn: "Bandarban Sadar" },
  { id: "alikadam", districtId: "bandarban", nameBn: "আলীকদম", nameEn: "Alikadam" },
  { id: "naikhyongchhari", districtId: "bandarban", nameBn: "নাইক্ষ্যংছড়ি", nameEn: "Naikhyongchhari" },
  { id: "rowangchhari", districtId: "bandarban", nameBn: "রোয়াংছড়ি", nameEn: "Rowangchhari" },
  { id: "ruma", districtId: "bandarban", nameBn: "রুমা", nameEn: "Ruma" },
  { id: "thanchi", districtId: "bandarban", nameBn: "থানচি", nameEn: "Thanchi" },
  { id: "lama", districtId: "bandarban", nameBn: "লামা", nameEn: "Lama" },

  // 24. Khagrachhari District
  { id: "khagrachhari-sadar", districtId: "khagrachhari", nameBn: "খাগড়াছড়ি সদর", nameEn: "Khagrachhari Sadar" },
  { id: "dighinala", districtId: "khagrachhari", nameBn: "দিঘীনালা", nameEn: "Dighinala" },
  { id: "lakshmichhari", districtId: "khagrachhari", nameBn: "লক্ষ্মীছড়ি", nameEn: "Lakshmichhari" },
  { id: "mahalchhari", districtId: "khagrachhari", nameBn: "মহালছড়ি", nameEn: "Mahalchhari" },
  { id: "manikchhari", districtId: "khagrachhari", nameBn: "মানিকছড়ি", nameEn: "Manikchhari" },
  { id: "matiranga", districtId: "khagrachhari", nameBn: "মাটিরাঙ্গা", nameEn: "Matiranga" },
  { id: "panchhari", districtId: "khagrachhari", nameBn: "পানছড়ি", nameEn: "Panchhari" },
  { id: "ramgarh", districtId: "khagrachhari", nameBn: "রামগড়", nameEn: "Ramgarh" },

  // ==================== RAJSHAHI DIVISION ====================
  // 25. Rajshahi District
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
  { id: "bagha", districtId: "rajshahi", nameBn: "বাঘা", nameEn: "Bagha" },
  { id: "mohanpur", districtId: "rajshahi", nameBn: "মোহনপুর", nameEn: "Mohanpur" },

  // 26. Bogura District
  { id: "bogura-sadar", districtId: "bogura", nameBn: "বগুড়া সদর", nameEn: "Bogura Sadar" },
  { id: "adamdighi", districtId: "bogura", nameBn: "আদমদিঘী", nameEn: "Adamdighi" },
  { id: "dhunat", districtId: "bogura", nameBn: "ধুনট", nameEn: "Dhunat" },
  { id: "dhupchanchia", districtId: "bogura", nameBn: "দুপচাঁচিয়া", nameEn: "Dhupchanchia" },
  { id: "gabtali", districtId: "bogura", nameBn: "গাবতলী", nameEn: "Gabtali" },
  { id: "kahaloo", districtId: "bogura", nameBn: "কাহালু", nameEn: "Kahaloo" },
  { id: "nandigram", districtId: "bogura", nameBn: "নন্দীগ্রাম", nameEn: "Nandigram" },
  { id: "sariakandi", districtId: "bogura", nameBn: "সারিয়াকান্দি", nameEn: "Sariakandi" },
  { id: "shajahanpur", districtId: "bogura", nameBn: "শাজাহানপুর", nameEn: "Shajahanpur" },
  { id: "sherpur-bogura", districtId: "bogura", nameBn: "শেরপুর", nameEn: "Sherpur" },
  { id: "shibganj-bogura", districtId: "bogura", nameBn: "শিবগঞ্জ", nameEn: "Shibganj" },
  { id: "sonatola", districtId: "bogura", nameBn: "সোনাতলা", nameEn: "Sonatola" },

  // 27. Pabna District
  { id: "pabna-sadar", districtId: "pabna", nameBn: "পাবনা সদর", nameEn: "Pabna Sadar" },
  { id: "atgharia", districtId: "pabna", nameBn: "আটঘরিয়া", nameEn: "Atgharia" },
  { id: "bera", districtId: "pabna", nameBn: "বেড়া", nameEn: "Bera" },
  { id: "bhangura", districtId: "pabna", nameBn: "ভাঙ্গুড়া", nameEn: "Bhangura" },
  { id: "chatmohar", districtId: "pabna", nameBn: "চাটমোহর", nameEn: "Chatmohar" },
  { id: "faridpur-pabna", districtId: "pabna", nameBn: "ফরিদপুর", nameEn: "Faridpur" },
  { id: "ishwardi", districtId: "pabna", nameBn: "ঈশ্বরদী", nameEn: "Ishwardi" },
  { id: "santhia", districtId: "pabna", nameBn: "সাঁথিয়া", nameEn: "Santhia" },
  { id: "sujanagar", districtId: "pabna", nameBn: "সুজানগর", nameEn: "Sujanagar" },

  // 28. Sirajganj District
  { id: "sirajganj-sadar", districtId: "sirajganj", nameBn: "সিরাজগঞ্জ সদর", nameEn: "Sirajganj Sadar" },
  { id: "belkuchi", districtId: "sirajganj", nameBn: "বেলকুচি", nameEn: "Belkuchi" },
  { id: "chauhali", districtId: "sirajganj", nameBn: "চৌহালী", nameEn: "Chauhali" },
  { id: "kamarkhanda", districtId: "sirajganj", nameBn: "কামারখন্দ", nameEn: "Kamarkhanda" },
  { id: "kazipur", districtId: "sirajganj", nameBn: "কাজীপুর", nameEn: "Kazipur" },
  { id: "raiganj", districtId: "sirajganj", nameBn: "রায়গঞ্জ", nameEn: "Raiganj" },
  { id: "shahjadpur", districtId: "sirajganj", nameBn: "শাহজাদপুর", nameEn: "Shahjadpur" },
  { id: "tarash", districtId: "sirajganj", nameBn: "তাড়াশ", nameEn: "Tarash" },
  { id: "ullapara", districtId: "sirajganj", nameBn: "উল্লাপাড়া", nameEn: "Ullapara" },

  // 29. Naogaon District
  { id: "naogaon-sadar", districtId: "naogaon", nameBn: "নওগাঁ সদর", nameEn: "Naogaon Sadar" },
  { id: "atrai", districtId: "naogaon", nameBn: "আত্রাই", nameEn: "Atrai" },
  { id: "badalgachhi", districtId: "naogaon", nameBn: "বদলগাছী", nameEn: "Badalgachhi" },
  { id: "dhamoirhat", districtId: "naogaon", nameBn: "ধামইরহাট", nameEn: "Dhamoirhat" },
  { id: "manda", districtId: "naogaon", nameBn: "মান্দা", nameEn: "Manda" },
  { id: "mohadevpur", districtId: "naogaon", nameBn: "মহাদেবপুর", nameEn: "Mohadevpur" },
  { id: "niamatpur", districtId: "naogaon", nameBn: "নিয়ামতপুর", nameEn: "Niamatpur" },
  { id: "patnitala", districtId: "naogaon", nameBn: "পত্নীতলা", nameEn: "Patnitala" },
  { id: "porsha", districtId: "naogaon", nameBn: "পোরশা", nameEn: "Porsha" },
  { id: "raninagar", districtId: "naogaon", nameBn: "রানীনগর", nameEn: "Raninagar" },
  { id: "sapahar", districtId: "naogaon", nameBn: "সাপাহার", nameEn: "Sapahar" },

  // 30. Natore District
  { id: "natore-sadar", districtId: "natore", nameBn: "নাটোর সদর", nameEn: "Natore Sadar" },
  { id: "bagatipara", districtId: "natore", nameBn: "বাগাতিপাড়া", nameEn: "Bagatipara" },
  { id: "baraigram", districtId: "natore", nameBn: "বড়াইগ্রাম", nameEn: "Baraigram" },
  { id: "gurudaspur", districtId: "natore", nameBn: "গুরুদাসপুর", nameEn: "Gurudaspur" },
  { id: "lalpur", districtId: "natore", nameBn: "লালপুর", nameEn: "Lalpur" },
  { id: "singra", districtId: "natore", nameBn: "সিংড়া", nameEn: "Singra" },
  { id: "naldanga", districtId: "natore", nameBn: "নলডাঙ্গা", nameEn: "Naldanga" },

  // 31. Chapainawabganj District
  { id: "chapainawabganj-sadar", districtId: "chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ সদর", nameEn: "Chapainawabganj Sadar" },
  { id: "bholahat", districtId: "chapainawabganj", nameBn: "ভোলাহাট", nameEn: "Bholahat" },
  { id: "gomastapur", districtId: "chapainawabganj", nameBn: "গোমস্তাপুর", nameEn: "Gomastapur" },
  { id: "nachole", districtId: "chapainawabganj", nameBn: "নাচোল", nameEn: "Nachole" },
  { id: "shibganj-chapainawabganj", districtId: "chapainawabganj", nameBn: "শিবগঞ্জ", nameEn: "Shibganj" },

  // 32. Joypurhat District
  { id: "joypurhat-sadar", districtId: "joypurhat", nameBn: "জয়পুরহাট সদর", nameEn: "Joypurhat Sadar" },
  { id: "akkelpur", districtId: "joypurhat", nameBn: "আক্কেলপুর", nameEn: "Akkelpur" },
  { id: "kalai", districtId: "joypurhat", nameBn: "কালাই", nameEn: "Kalai" },
  { id: "khetlal", districtId: "joypurhat", nameBn: "ক্ষেতলাল", nameEn: "Khetlal" },
  { id: "panchbibi", districtId: "joypurhat", nameBn: "পাঁচবিবি", nameEn: "Panchbibi" },

  // ==================== KHULNA DIVISION ====================
  // 33. Khulna District
  { id: "khulna-sadar", districtId: "khulna", nameBn: "খুলনা সদর", nameEn: "Khulna Sadar" },
  { id: "sonadanga", districtId: "khulna", nameBn: "সোনাডাঙ্গা", nameEn: "Sonadanga" },
  { id: "khalishpur", districtId: "khulna", nameBn: "খালিশপুর", nameEn: "Khalishpur" },
  { id: "daulatpur-khulna", districtId: "khulna", nameBn: "দৌলতপুর", nameEn: "Daulatpur" },
  { id: "rupsha", districtId: "khulna", nameBn: "রূপসা", nameEn: "Rupsha" },
  { id: "dumuria", districtId: "khulna", nameBn: "ডুমুরিয়া", nameEn: "Dumuria" },
  { id: "batiaghata", districtId: "khulna", nameBn: "বটিয়াঘাটা", nameEn: "Batiaghata" },
  { id: "dacope", districtId: "khulna", nameBn: "দাকোপ", nameEn: "Dacope" },
  { id: "paikgachha", districtId: "khulna", nameBn: "পাইকগাছা", nameEn: "Paikgachha" },
  { id: "phultala", districtId: "khulna", nameBn: "ফুলতলা", nameEn: "Phultala" },
  { id: "dighalia", districtId: "khulna", nameBn: "দিঘলিয়া", nameEn: "Dighalia" },
  { id: "terokhada", districtId: "khulna", nameBn: "তেরখাদা", nameEn: "Terokhada" },
  { id: "koyra", districtId: "khulna", nameBn: "কয়রা", nameEn: "Koyra" },

  // 34. Jashore District
  { id: "jashore-sadar", districtId: "jashore", nameBn: "যশোর সদর", nameEn: "Jashore Sadar" },
  { id: "abhaynagar", districtId: "jashore", nameBn: "অভয়নগর", nameEn: "Abhaynagar" },
  { id: "bagherpara", districtId: "jashore", nameBn: "বাঘারপাড়া", nameEn: "Bagherpara" },
  { id: "chaugachha", districtId: "jashore", nameBn: "চৌগাছা", nameEn: "Chaugachha" },
  { id: "jhikargachha", districtId: "jashore", nameBn: "ঝিকরগাছা", nameEn: "Jhikargachha" },
  { id: "keshabpur", districtId: "jashore", nameBn: "কেশবপুর", nameEn: "Keshabpur" },
  { id: "manirampur", districtId: "jashore", nameBn: "মণিরামপুর", nameEn: "Manirampur" },
  { id: "sharsha", districtId: "jashore", nameBn: "শার্শা", nameEn: "Sharsha" },

  // 35. Satkhira District
  { id: "satkhira-sadar", districtId: "satkhira", nameBn: "সাতক্ষীরা সদর", nameEn: "Satkhira Sadar" },
  { id: "assasuni", districtId: "satkhira", nameBn: "আশাশুনি", nameEn: "Assasuni" },
  { id: "debhat", districtId: "satkhira", nameBn: "দেবহাটা", nameEn: "Debhata" },
  { id: "kalaroa", districtId: "satkhira", nameBn: "কলারোয়া", nameEn: "Kalaroa" },
  { id: "kaliganj-satkhira", districtId: "satkhira", nameBn: "কালীগঞ্জ", nameEn: "Kaliganj" },
  { id: "shyamnagar", districtId: "satkhira", nameBn: "শ্যামনগর", nameEn: "Shyamnagar" },
  { id: "tala", districtId: "satkhira", nameBn: "তালা", nameEn: "Tala" },

  // 36. Kushtia District
  { id: "kushtia-sadar", districtId: "kushtia", nameBn: "কুষ্টিয়া সদর", nameEn: "Kushtia Sadar" },
  { id: "bheramara", districtId: "kushtia", nameBn: "ভেড়ামারা", nameEn: "Bheramara" },
  { id: "daulatpur-kushtia", districtId: "kushtia", nameBn: "দৌলতপুর", nameEn: "Daulatpur" },
  { id: "khoksa", districtId: "kushtia", nameBn: "খোকসা", nameEn: "Khoksa" },
  { id: "kumarkhali", districtId: "kushtia", nameBn: "কুমারখালী", nameEn: "Kumarkhali" },
  { id: "mirpur-kushtia", districtId: "kushtia", nameBn: "মিরপুর", nameEn: "Mirpur" },

  // 37. Bagerhat District
  { id: "bagerhat-sadar", districtId: "bagerhat", nameBn: "বাগেরহাট সদর", nameEn: "Bagerhat Sadar" },
  { id: "chitalmari", districtId: "bagerhat", nameBn: "চিতলমারী", nameEn: "Chitalmari" },
  { id: "fakirhat", districtId: "bagerhat", nameBn: "ফকিরহাট", nameEn: "Fakirhat" },
  { id: "kachua-bagerhat", districtId: "bagerhat", nameBn: "কচুয়া", nameEn: "Kachua" },
  { id: "mollahat", districtId: "bagerhat", nameBn: "মোল্লাহাট", nameEn: "Mollahat" },
  { id: "mongla", districtId: "bagerhat", nameBn: "মংলা", nameEn: "Mongla" },
  { id: "morrelganj", districtId: "bagerhat", nameBn: "মোরেলগঞ্জ", nameEn: "Morrelganj" },
  { id: "rampal", districtId: "bagerhat", nameBn: "রামপাল", nameEn: "Rampal" },
  { id: "sarankhola", districtId: "bagerhat", nameBn: "শরণখোলা", nameEn: "Sarankhola" },

  // 38. Jhenaidah District
  { id: "jhenaidah-sadar", districtId: "jhenaidah", nameBn: "ঝিনাইদহ সদর", nameEn: "Jhenaidah Sadar" },
  { id: "harinakundu", districtId: "jhenaidah", nameBn: "হরিণাকুণ্ডু", nameEn: "Harinakundu" },
  { id: "kaliganj-jhenaidah", districtId: "jhenaidah", nameBn: "কালীগঞ্জ", nameEn: "Kaliganj" },
  { id: "kotchandpur", districtId: "jhenaidah", nameBn: "কোটচাঁদপুর", nameEn: "Kotchandpur" },
  { id: "maheshpur", districtId: "jhenaidah", nameBn: "মহেশপুর", nameEn: "Maheshpur" },
  { id: "shailkupa", districtId: "jhenaidah", nameBn: "শৈলকুপা", nameEn: "Shailkupa" },

  // 39. Chuadanga District
  { id: "chuadanga-sadar", districtId: "chuadanga", nameBn: "চুয়াডাঙ্গা সদর", nameEn: "Chuadanga Sadar" },
  { id: "alamdanga", districtId: "chuadanga", nameBn: "আলমডাঙ্গা", nameEn: "Alamdanga" },
  { id: "damurhuda", districtId: "chuadanga", nameBn: "দামুড়হুদা", nameEn: "Damurhuda" },
  { id: "jibannagar", districtId: "chuadanga", nameBn: "জীবননগর", nameEn: "Jibannagar" },

  // 40. Magura District
  { id: "magura-sadar", districtId: "magura", nameBn: "মাগুরা সদর", nameEn: "Magura Sadar" },
  { id: "mohammadpur-magura", districtId: "magura", nameBn: "মোহাম্মদপুর", nameEn: "Mohammadpur" },
  { id: "shalikha", districtId: "magura", nameBn: "শালিখা", nameEn: "Shalikha" },
  { id: "sreepur-magura", districtId: "magura", nameBn: "শ্রীপুর", nameEn: "Sreepur" },

  // 41. Meherpur District
  { id: "meherpur-sadar", districtId: "meherpur", nameBn: "মেহেরপুর সদর", nameEn: "Meherpur Sadar" },
  { id: "gangni", districtId: "meherpur", nameBn: "গাংনী", nameEn: "Gangni" },
  { id: "mujibnagar", districtId: "meherpur", nameBn: "মুজিবনগর", nameEn: "Mujibnagar" },

  // 42. Narail District
  { id: "narail-sadar", districtId: "narail", nameBn: "নড়াইল সদর", nameEn: "Narail Sadar" },
  { id: "kalia", districtId: "narail", nameBn: "কালিয়া", nameEn: "Kalia" },
  { id: "lohagara-narail", districtId: "narail", nameBn: "লোহাগড়া", nameEn: "Lohagara" },

  // ==================== BARISHAL DIVISION ====================
  // 43. Barishal District
  { id: "barishal-sadar", districtId: "barishal", nameBn: "বরিশাল সদর", nameEn: "Barishal Sadar" },
  { id: "babuganj", districtId: "barishal", nameBn: "বাবুগঞ্জ", nameEn: "Babuganj" },
  { id: "bakerganj", districtId: "barishal", nameBn: "বাকেরগঞ্জ", nameEn: "Bakerganj" },
  { id: "banaripara", districtId: "barishal", nameBn: "বানারীপাড়া", nameEn: "Banaripara" },
  { id: "gaurnadi", districtId: "barishal", nameBn: "গৌরনদী", nameEn: "Gaurnadi" },
  { id: "hizla", districtId: "barishal", nameBn: "হিজলা", nameEn: "Hizla" },
  { id: "mehendiganj", districtId: "barishal", nameBn: "মেহেন্দিগঞ্জ", nameEn: "Mehendiganj" },
  { id: "muladi", districtId: "barishal", nameBn: "মুলাদী", nameEn: "Muladi" },
  { id: "wazirpur", districtId: "barishal", nameBn: "উজিরপুর", nameEn: "Wazirpur" },
  { id: "agailjhara", districtId: "barishal", nameBn: "আগৈলঝাড়া", nameEn: "Agailjhara" },

  // 44. Patuakhali District
  { id: "patuakhali-sadar", districtId: "patuakhali", nameBn: "পটুয়াখালী সদর", nameEn: "Patuakhali Sadar" },
  { id: "bauphal", districtId: "patuakhali", nameBn: "বাউফল", nameEn: "Bauphal" },
  { id: "dashmina", districtId: "patuakhali", nameBn: "দশমিনা", nameEn: "Dashmina" },
  { id: "galachipa", districtId: "patuakhali", nameBn: "গলাচিপা", nameEn: "Galachipa" },
  { id: "kalapara", districtId: "patuakhali", nameBn: "কলাপাড়া", nameEn: "Kalapara" },
  { id: "mirzaganj", districtId: "patuakhali", nameBn: "মির্জাগঞ্জ", nameEn: "Mirzaganj" },
  { id: "rangabali", districtId: "patuakhali", nameBn: "রাঙ্গাবালী", nameEn: "Rangabali" },
  { id: "dumki", districtId: "patuakhali", nameBn: "দুমকি", nameEn: "Dumki" },

  // 45. Bhola District
  { id: "bhola-sadar", districtId: "bhola", nameBn: "ভোলা সদর", nameEn: "Bhola Sadar" },
  { id: "burhanuddin", districtId: "bhola", nameBn: "বোরহানউদ্দিন", nameEn: "Burhanuddin" },
  { id: "char-fasson", districtId: "bhola", nameBn: "চরফ্যাশন", nameEn: "Char Fasson" },
  { id: "daulatkhan", districtId: "bhola", nameBn: "দৌলতখান", nameEn: "Daulatkhan" },
  { id: "lalmohan", districtId: "bhola", nameBn: "লালমোহন", nameEn: "Lalmohan" },
  { id: "manpura", districtId: "bhola", nameBn: "মনপুরা", nameEn: "Manpura" },
  { id: "tazumuddin", districtId: "bhola", nameBn: "তজুমদ্দিন", nameEn: "Tazumuddin" },

  // 46. Pirojpur District
  { id: "pirojpur-sadar", districtId: "pirojpur", nameBn: "পিরোজপুর সদর", nameEn: "Pirojpur Sadar" },
  { id: "bhandaria", districtId: "pirojpur", nameBn: "ভাণ্ডারিয়া", nameEn: "Bhandaria" },
  { id: "kawkhali-pirojpur", districtId: "pirojpur", nameBn: "কাউখালী", nameEn: "Kawkhali" },
  { id: "mathbaria", districtId: "pirojpur", nameBn: "মঠবাড়িয়া", nameEn: "Mathbaria" },
  { id: "nazirpur", districtId: "pirojpur", nameBn: "নাজিরপুর", nameEn: "Nazirpur" },
  { id: "nesarabad", districtId: "pirojpur", nameBn: "নেছারাবাদ", nameEn: "Nesarabad" },
  { id: "indurkani", districtId: "pirojpur", nameBn: "ইন্দুরকানী", nameEn: "Indurkani" },

  // 47. Barguna District
  { id: "barguna-sadar", districtId: "barguna", nameBn: "বরগুনা সদর", nameEn: "Barguna Sadar" },
  { id: "amtali", districtId: "barguna", nameBn: "আমতলী", nameEn: "Amtali" },
  { id: "bamna", districtId: "barguna", nameBn: "বামনা", nameEn: "Bamna" },
  { id: "betagi", districtId: "barguna", nameBn: "বেতাগী", nameEn: "Betagi" },
  { id: "patharghata", districtId: "barguna", nameBn: "পাথরঘাটা", nameEn: "Patharghata" },
  { id: "taltali", districtId: "barguna", nameBn: "তালতলী", nameEn: "Taltali" },

  // 48. Jhalokati District
  { id: "jhalokati-sadar", districtId: "jhalokati", nameBn: "ঝালকাঠি সদর", nameEn: "Jhalokati Sadar" },
  { id: "kathalia", districtId: "jhalokati", nameBn: "কাঠালিয়া", nameEn: "Kathalia" },
  { id: "nalchhiti", districtId: "jhalokati", nameBn: "নলছিটি", nameEn: "Nalchhiti" },
  { id: "rajapur", districtId: "jhalokati", nameBn: "রাজাপুর", nameEn: "Rajapur" },

  // ==================== SYLHET DIVISION ====================
  // 49. Sylhet District
  { id: "sylhet-sadar", districtId: "sylhet", nameBn: "সিলেট সদর", nameEn: "Sylhet Sadar" },
  { id: "south-surma", districtId: "sylhet", nameBn: "দক্ষিণ সুরমা", nameEn: "South Surma" },
  { id: "beanibazar", districtId: "sylhet", nameBn: "বিয়ানীবাজার", nameEn: "Beanibazar" },
  { id: "golapganj", districtId: "sylhet", nameBn: "গোলাপগঞ্জ", nameEn: "Golapganj" },
  { id: "biswanath", districtId: "sylhet", nameBn: "বিশ্বনাথ", nameEn: "Biswanath" },
  { id: "fenchuganj", districtId: "sylhet", nameBn: "ফেঞ্চুগঞ্জ", nameEn: "Fenchuganj" },
  { id: "balaganj", districtId: "sylhet", nameBn: "বালাগঞ্জ", nameEn: "Balaganj" },
  { id: "gowainghat", districtId: "sylhet", nameBn: "গোয়াইনঘাট", nameEn: "Gowainghat" },
  { id: "osmani-nagar", districtId: "sylhet", nameBn: "ওসমানী নগর", nameEn: "Osmani Nagar" },
  { id: "jaintiapur", districtId: "sylhet", nameBn: "জৈন্তাপুর", nameEn: "Jaintiapur" },
  { id: "kanaighat", districtId: "sylhet", nameBn: "কানাইঘাট", nameEn: "Kanaighat" },
  { id: "zakiganj", districtId: "sylhet", nameBn: "জকিগঞ্জ", nameEn: "Zakiganj" },
  { id: "companiganj-sylhet", districtId: "sylhet", nameBn: "কোম্পানীগঞ্জ", nameEn: "Companiganj" },

  // 50. Moulvibazar District
  { id: "moulvibazar-sadar", districtId: "moulvibazar", nameBn: "মৌলভীবাজার সদর", nameEn: "Moulvibazar Sadar" },
  { id: "barlekha", districtId: "moulvibazar", nameBn: "বড়লেখা", nameEn: "Barlekha" },
  { id: "juri", districtId: "moulvibazar", nameBn: "জুড়ী", nameEn: "Juri" },
  { id: "kamalganj", districtId: "moulvibazar", nameBn: "কমলগঞ্জ", nameEn: "Kamalganj" },
  { id: "kulaura", districtId: "moulvibazar", nameBn: "কুলাউড়া", nameEn: "Kulaura" },
  { id: "rajnagar", districtId: "moulvibazar", nameBn: "রাজনগর", nameEn: "Rajnagar" },
  { id: "sreemangal", districtId: "moulvibazar", nameBn: "শ্রীমঙ্গল", nameEn: "Sreemangal" },

  // 51. Habiganj District
  { id: "habiganj-sadar", districtId: "habiganj", nameBn: "হবিগঞ্জ সদর", nameEn: "Habiganj Sadar" },
  { id: "ajmiriganj", districtId: "habiganj", nameBn: "আজমিরীগঞ্জ", nameEn: "Ajmiriganj" },
  { id: "bahubal", districtId: "habiganj", nameBn: "বাহুবল", nameEn: "Bahubal" },
  { id: "baniyachong", districtId: "habiganj", nameBn: "বানিয়াচং", nameEn: "Baniyachong" },
  { id: "chunarughat", districtId: "habiganj", nameBn: "চুনারুঘাট", nameEn: "Chunarughat" },
  { id: "lakhai", districtId: "habiganj", nameBn: "লাখাই", nameEn: "Lakhai" },
  { id: "madhabpur", districtId: "habiganj", nameBn: "মাধবপুর", nameEn: "Madhabpur" },
  { id: "nabiganj", districtId: "habiganj", nameBn: "নবীগঞ্জ", nameEn: "Nabiganj" },
  { id: "sayestaganj", districtId: "habiganj", nameBn: "শায়েস্তাগঞ্জ", nameEn: "Sayestaganj" },

  // 52. Sunamganj District
  { id: "sunamganj-sadar", districtId: "sunamganj", nameBn: "সুনামগঞ্জ সদর", nameEn: "Sunamganj Sadar" },
  { id: "bishwamvarpur", districtId: "sunamganj", nameBn: "বিশ্বম্ভরপুর", nameEn: "Bishwamvarpur" },
  { id: "chhatak", districtId: "sunamganj", nameBn: "ছাতক", nameEn: "Chhatak" },
  { id: "derai", districtId: "sunamganj", nameBn: "দিরাই", nameEn: "Derai" },
  { id: "dharamapasha", districtId: "sunamganj", nameBn: "ধর্মপাশা", nameEn: "Dharamapasha" },
  { id: "dowarabazar", districtId: "sunamganj", nameBn: "দোয়ারাবাজার", nameEn: "Dowarabazar" },
  { id: "jagannathpur", districtId: "sunamganj", nameBn: "জগন্নাথপুর", nameEn: "Jagannathpur" },
  { id: "jamalganj", districtId: "sunamganj", nameBn: "জামালগঞ্জ", nameEn: "Jamalganj" },
  { id: "sullah", districtId: "sunamganj", nameBn: "শাল্লা", nameEn: "Sullah" },
  { id: "tahirpur", districtId: "sunamganj", nameBn: "তাহিরপুর", nameEn: "Tahirpur" },
  { id: "shantiganj", districtId: "sunamganj", nameBn: "শান্তিগঞ্জ", nameEn: "Shantiganj" },

  // ==================== RANGPUR DIVISION ====================
  // 53. Rangpur District
  { id: "rangpur-sadar", districtId: "rangpur", nameBn: "রংপুর সদর", nameEn: "Rangpur Sadar" },
  { id: "badarganj", districtId: "rangpur", nameBn: "বদরগঞ্জ", nameEn: "Badarganj" },
  { id: "mithapukur", districtId: "rangpur", nameBn: "মিঠাপুকুর", nameEn: "Mithapukur" },
  { id: "pirganj-rangpur", districtId: "rangpur", nameBn: "পীরগঞ্জ", nameEn: "Pirganj" },
  { id: "kaunia", districtId: "rangpur", nameBn: "কাউনিয়া", nameEn: "Kaunia" },
  { id: "gangachhara", districtId: "rangpur", nameBn: "গংগাচড়া", nameEn: "Gangachhara" },
  { id: "pirgachha", districtId: "rangpur", nameBn: "পীরগাছা", nameEn: "Pirgachha" },
  { id: "taraganj", districtId: "rangpur", nameBn: "তারাগঞ্জ", nameEn: "Taraganj" },

  // 54. Dinajpur District
  { id: "dinajpur-sadar", districtId: "dinajpur", nameBn: "দিনাজপুর সদর", nameEn: "Dinajpur Sadar" },
  { id: "birampur", districtId: "dinajpur", nameBn: "বিরামপুর", nameEn: "Birampur" },
  { id: "birganj", districtId: "dinajpur", nameBn: "বীরগঞ্জ", nameEn: "Birganj" },
  { id: "birol", districtId: "dinajpur", nameBn: "বিরল", nameEn: "Birol" },
  { id: "bochaganj", districtId: "dinajpur", nameBn: "বোচাগঞ্জ", nameEn: "Bochaganj" },
  { id: "chirirbandar", districtId: "dinajpur", nameBn: "চিরিরবন্দর", nameEn: "Chirirbandar" },
  { id: "phulbari-dinajpur", districtId: "dinajpur", nameBn: "ফুলবাড়ী", nameEn: "Phulbari" },
  { id: "ghoraghat", districtId: "dinajpur", nameBn: "ঘোড়াঘাট", nameEn: "Ghoraghat" },
  { id: "hakimpur", districtId: "dinajpur", nameBn: "হাকিমপুর", nameEn: "Hakimpur" },
  { id: "kaharole", districtId: "dinajpur", nameBn: "কাহারোল", nameEn: "Kaharole" },
  { id: "khansama", districtId: "dinajpur", nameBn: "খানসামা", nameEn: "Khansama" },
  { id: "nawabganj-dinajpur", districtId: "dinajpur", nameBn: "নবাবগঞ্জ", nameEn: "Nawabganj" },
  { id: "parbatipur", districtId: "dinajpur", nameBn: "পার্বতীপুর", nameEn: "Parbatipur" },

  // 55. Kurigram District
  { id: "kurigram-sadar", districtId: "kurigram", nameBn: "কুড়িগ্রাম সদর", nameEn: "Kurigram Sadar" },
  { id: "bhurungamari", districtId: "kurigram", nameBn: "ভুরুঙ্গামারী", nameEn: "Bhurungamari" },
  { id: "char-rajibpur", districtId: "kurigram", nameBn: "চর রাজিবপুর", nameEn: "Char Rajibpur" },
  { id: "chilmari", districtId: "kurigram", nameBn: "চিলমারী", nameEn: "Chilmari" },
  { id: "phulbari-kurigram", districtId: "kurigram", nameBn: "ফুলবাড়ী", nameEn: "Phulbari" },
  { id: "nageshwari", districtId: "kurigram", nameBn: "নাগেশ্বরী", nameEn: "Nageshwari" },
  { id: "rajarhat", districtId: "kurigram", nameBn: "রাজারহাট", nameEn: "Rajarhat" },
  { id: "rourmari", districtId: "kurigram", nameBn: "রৌমারী", nameEn: "Rourmari" },
  { id: "ulipur", districtId: "kurigram", nameBn: "উলিপুর", nameEn: "Ulipur" },

  // 56. Gaibandha District
  { id: "gaibandha-sadar", districtId: "gaibandha", nameBn: "গাইবান্ধা সদর", nameEn: "Gaibandha Sadar" },
  { id: "fulchhari", districtId: "gaibandha", nameBn: "ফুলছড়ি", nameEn: "Fulchhari" },
  { id: "gobindaganj", districtId: "gaibandha", nameBn: "গোবিন্দগঞ্জ", nameEn: "Gobindaganj" },
  { id: "palashbari", districtId: "gaibandha", nameBn: "পলাশবাড়ী", nameEn: "Palashbari" },
  { id: "sadullapur", districtId: "gaibandha", nameBn: "সাদুল্লাপুর", nameEn: "Sadullapur" },
  { id: "sughatta", districtId: "gaibandha", nameBn: "সাঘাটা", nameEn: "Sughatta" },
  { id: "sundarganj", districtId: "gaibandha", nameBn: "সুন্দরগঞ্জ", nameEn: "Sundarganj" },

  // 57. Nilphamari District
  { id: "nilphamari-sadar", districtId: "nilphamari", nameBn: "নীলফামারী সদর", nameEn: "Nilphamari Sadar" },
  { id: "dimla", districtId: "nilphamari", nameBn: "ডিমলা", nameEn: "Dimla" },
  { id: "domar", districtId: "nilphamari", nameBn: "ডোমার", nameEn: "Domar" },
  { id: "jaldhaka", districtId: "nilphamari", nameBn: "জলঢাকা", nameEn: "Jaldhaka" },
  { id: "kishoreganj-nilphamari", districtId: "nilphamari", nameBn: "কিশোরগঞ্জ", nameEn: "Kishoreganj" },
  { id: "saidpur", districtId: "nilphamari", nameBn: "সৈয়দপুর", nameEn: "Saidpur" },

  // 58. Lalmonirhat District
  { id: "lalmonirhat-sadar", districtId: "lalmonirhat", nameBn: "লালমনিরহাট সদর", nameEn: "Lalmonirhat Sadar" },
  { id: "aditmari", districtId: "lalmonirhat", nameBn: "আদিতমারী", nameEn: "Aditmari" },
  { id: "hatibandha", districtId: "lalmonirhat", nameBn: "হাতীবান্ধা", nameEn: "Hatibandha" },
  { id: "kaliganj-lalmonirhat", districtId: "lalmonirhat", nameBn: "কালীগঞ্জ", nameEn: "Kaliganj" },
  { id: "patgram", districtId: "lalmonirhat", nameBn: "পাটগ্রাম", nameEn: "Patgram" },

  // 59. Thakurgaon District
  { id: "thakurgaon-sadar", districtId: "thakurgaon", nameBn: "ঠাকুরগাঁও সদর", nameEn: "Thakurgaon Sadar" },
  { id: "baliadangi", districtId: "thakurgaon", nameBn: "বালিয়াডাঙ্গী", nameEn: "Baliadangi" },
  { id: "haripur", districtId: "thakurgaon", nameBn: "হরিপুর", nameEn: "Haripur" },
  { id: "pirganj-thakurgaon", districtId: "thakurgaon", nameBn: "পীরগঞ্জ", nameEn: "Pirganj" },
  { id: "ranisankail", districtId: "thakurgaon", nameBn: "রাণীশংকৈল", nameEn: "Ranisankail" },

  // 60. Panchagarh District
  { id: "panchagarh-sadar", districtId: "panchagarh", nameBn: "পঞ্চগড় সদর", nameEn: "Panchagarh Sadar" },
  { id: "atwari", districtId: "panchagarh", nameBn: "আটোয়ারী", nameEn: "Atwari" },
  { id: "boda", districtId: "panchagarh", nameBn: "বোদা", nameEn: "Boda" },
  { id: "debiganj", districtId: "panchagarh", nameBn: "দেবীগঞ্জ", nameEn: "Debiganj" },
  { id: "tetulia", districtId: "panchagarh", nameBn: "তেঁতুলিয়া", nameEn: "Tetulia" },

  // ==================== MYMENSINGH DIVISION ====================
  // 61. Mymensingh District
  { id: "mymensingh-sadar", districtId: "mymensingh", nameBn: "ময়মনসিংহ সদর", nameEn: "Mymensingh Sadar" },
  { id: "muktagachha", districtId: "mymensingh", nameBn: "মুক্তাগাছা", nameEn: "Muktagachha" },
  { id: "trishal", districtId: "mymensingh", nameBn: "ত্রিশাল", nameEn: "Trishal" },
  { id: "bhaluka", districtId: "mymensingh", nameBn: "ভালুকা", nameEn: "Bhaluka" },
  { id: "gaffargaon", districtId: "mymensingh", nameBn: "গফরগাঁও", nameEn: "Gaffargaon" },
  { id: "dhobaura", districtId: "mymensingh", nameBn: "ধোবাউড়া", nameEn: "Dhobaura" },
  { id: "fulbaria", districtId: "mymensingh", nameBn: "ফুলবাড়িয়া", nameEn: "Fulbaria" },
  { id: "haluaghat", districtId: "mymensingh", nameBn: "হালুয়াঘাট", nameEn: "Haluaghat" },
  { id: "ishwarganj", districtId: "mymensingh", nameBn: "ঈশ্বরগঞ্জ", nameEn: "Ishwarganj" },
  { id: "nandail", districtId: "mymensingh", nameBn: "নান্দাইল", nameEn: "Nandail" },
  { id: "phulpur", districtId: "mymensingh", nameBn: "ফুলপুর", nameEn: "Phulpur" },
  { id: "tara-khanda", districtId: "mymensingh", nameBn: "তারাকান্দা", nameEn: "Tara Khanda" },

  // 62. Jamalpur District
  { id: "jamalpur-sadar", districtId: "jamalpur", nameBn: "জামালপুর সদর", nameEn: "Jamalpur Sadar" },
  { id: "bakshiganj", districtId: "jamalpur", nameBn: "বকশীগঞ্জ", nameEn: "Bakshiganj" },
  { id: "dewanganj", districtId: "jamalpur", nameBn: "দেওয়ানগঞ্জ", nameEn: "Dewanganj" },
  { id: "islampur", districtId: "jamalpur", nameBn: "ইসলামপুর", nameEn: "Islampur" },
  { id: "madarganj", districtId: "jamalpur", nameBn: "মাদারগঞ্জ", nameEn: "Madarganj" },
  { id: "melandaha", districtId: "jamalpur", nameBn: "মেলান্দহ", nameEn: "Melandaha" },
  { id: "sarishabari", districtId: "jamalpur", nameBn: "সরিষাবাড়ী", nameEn: "Sarishabari" },

  // 63. Netrokona District
  { id: "netrokona-sadar", districtId: "netrokona", nameBn: "নেত্রকোণা সদর", nameEn: "Netrokona Sadar" },
  { id: "atpara", districtId: "netrokona", nameBn: "আটপাড়া", nameEn: "Atpara" },
  { id: "barhatta", districtId: "netrokona", nameBn: "বারহাট্টা", nameEn: "Barhatta" },
  { id: "durgapur-netrokona", districtId: "netrokona", nameBn: "দুর্গাপুর", nameEn: "Durgapur" },
  { id: "kalmakanda", districtId: "netrokona", nameBn: "কলমাকান্দা", nameEn: "Kalmakanda" },
  { id: "kendua", districtId: "netrokona", nameBn: "কেন্দুয়া", nameEn: "Kendua" },
  { id: "madan", districtId: "netrokona", nameBn: "মদন", nameEn: "Madan" },
  { id: "mohanganj", districtId: "netrokona", nameBn: "মোহনগঞ্জ", nameEn: "Mohanganj" },
  { id: "purbadhala", districtId: "netrokona", nameBn: "পূর্বধলা", nameEn: "Purbadhala" },
  { id: "khaliajuri", districtId: "netrokona", nameBn: "খালিয়াজুরী", nameEn: "Khaliajuri" },

  // 64. Sherpur District
  { id: "sherpur-sadar", districtId: "sherpur", nameBn: "শেরপুর সদর", nameEn: "Sherpur Sadar" },
  { id: "jhenaigati", districtId: "sherpur", nameBn: "ঝিনাইগাতী", nameEn: "Jhenaigati" },
  { id: "nakla", districtId: "sherpur", nameBn: "নকলা", nameEn: "Nakla" },
  { id: "nolitabari", districtId: "sherpur", nameBn: "নালিতাবাড়ী", nameEn: "Nolitabari" },
  { id: "sreebardi", districtId: "sherpur", nameBn: "শ্রীবরদী", nameEn: "Sreebardi" },
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
