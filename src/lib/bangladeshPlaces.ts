export interface CuratedPlace {
  id: string;
  name: string;
  bnName?: string;
  area: string;
  city: string;
  lat: number;
  lon: number;
  category: "bus_terminal" | "metro_station" | "railway" | "airport" | "landmark" | "area" | "commercial" | "university" | "hospital";
  tags: string[];
}

export const BANGLADESH_PLACES: CuratedPlace[] = [
  // --- A ---
  {
    id: "abdullahpur-bus-stand",
    name: "Abdullahpur Bus Stand",
    bnName: "আব্দুল্লাহপুর বাস স্ট্যান্ড",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8826,
    lon: 90.3986,
    category: "bus_terminal",
    tags: ["abdullahpur", "uttara", "bus", "stand", "terminal", "gazipur highway", "tongi bridge", "a", "ab", "abd"]
  },
  {
    id: "abdullahpur-chowrasta",
    name: "Abdullahpur Chowrasta",
    bnName: "আব্দুল্লাহপুর চৌরাস্তা",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8845,
    lon: 90.3992,
    category: "landmark",
    tags: ["abdullahpur", "chowrasta", "uttara", "intersection", "a", "ab", "abd"]
  },
  {
    id: "agargaon-metro-station",
    name: "Agargaon Metro Station (MRT Line 6)",
    bnName: "আগারগাঁও মেট্রো স্টেশন",
    area: "Agargaon",
    city: "Dhaka",
    lat: 23.7785,
    lon: 90.3773,
    category: "metro_station",
    tags: ["agargaon", "metro", "mrt", "passport office", "idb", "bhaban", "a", "ag"]
  },
  {
    id: "agargaon-bus-stop",
    name: "Agargaon Bus Stand / IDB Bhaban",
    bnName: "আগারগাঁও বাস স্ট্যান্ড / আইডিবি",
    area: "Agargaon",
    city: "Dhaka",
    lat: 23.7770,
    lon: 90.3800,
    category: "bus_terminal",
    tags: ["agargaon", "idb", "bcs", "computer city", "bus stop", "a", "ag"]
  },
  {
    id: "airport-railway-station",
    name: "Dhaka Airport Railway Station",
    bnName: "বিমানবন্দর রেলওয়ে স্টেশন",
    area: "Airport",
    city: "Dhaka",
    lat: 23.8518,
    lon: 90.4080,
    category: "railway",
    tags: ["airport", "railway", "train", "station", "bimandar", "a", "ai", "air"]
  },
  {
    id: "hazrat-shahjalal-airport",
    name: "Hazrat Shahjalal International Airport (Terminal 1 & 2)",
    bnName: "হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর",
    area: "Kurmitola",
    city: "Dhaka",
    lat: 23.8433,
    lon: 90.3978,
    category: "airport",
    tags: ["airport", "shahjalal", "terminal", "flight", "kurmitola", "international", "a", "ai", "air"]
  },
  {
    id: "azampur-bus-stand",
    name: "Azampur Bus Stand (Uttara Sector 3 & 6)",
    bnName: "আজমপুর বাস স্ট্যান্ড (উত্তরা)",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8685,
    lon: 90.3995,
    category: "bus_terminal",
    tags: ["azampur", "azam", "az", "uttara", "sector 3", "sector 6", "rajlakshmi", "bus stand", "dhaka mymensingh highway", "a"]
  },
  {
    id: "azimpur-bus-stand",
    name: "Azimpur Bus Stand",
    bnName: "আজিমপুর বাস স্ট্যান্ড",
    area: "Azimpur",
    city: "Dhaka",
    lat: 23.7298,
    lon: 90.3854,
    category: "bus_terminal",
    tags: ["azimpur", "bus stand", "eden college", "chapra masjid", "graveyard", "a", "az"]
  },
  {
    id: "arambagh-bus-counter",
    name: "Arambagh Inter-District Bus Counter",
    bnName: "আরামবাগ বাস কাউন্টার",
    area: "Motijheel",
    city: "Dhaka",
    lat: 23.7315,
    lon: 90.4190,
    category: "bus_terminal",
    tags: ["arambagh", "motijheel", "green line", "shohagh", "bus counter", "a", "ar"]
  },
  {
    id: "ashulia-bus-stand",
    name: "Ashulia Beribadh / Fantasy Kingdom",
    bnName: "আশুলিয়া বেড়িবাঁধ",
    area: "Ashulia",
    city: "Dhaka",
    lat: 23.9010,
    lon: 90.3255,
    category: "landmark",
    tags: ["ashulia", "beribadh", "smarak", "fantasy kingdom", "savar", "a", "as"]
  },
  {
    id: "asmat-ali-khan-bridge",
    name: "Aminbazar Bridge & Bus Stand",
    bnName: "আমিনবাজার বাস স্ট্যান্ড",
    area: "Gabtoli / Aminbazar",
    city: "Dhaka",
    lat: 23.7840,
    lon: 90.3340,
    category: "bus_terminal",
    tags: ["aminbazar", "gabtoli", "bridge", "entry point", "a", "am"]
  },
  {
    id: "aftabnagar-main-gate",
    name: "Aftabnagar Main Gate / East West University",
    bnName: "আফতাবনগর মেইন গেট / ইস্ট ওয়েস্ট বিশ্ববিদ্যালয়",
    area: "Aftabnagar",
    city: "Dhaka",
    lat: 23.7680,
    lon: 90.4260,
    category: "university",
    tags: ["aftabnagar", "east west", "ewu", "merul badda", "rampura", "a", "af"]
  },
  {
    id: "adabor-thana-stand",
    name: "Adabor Baytul Aman / Ring Road",
    bnName: "আদাবর বায়তুল আমান / রিং রোড",
    area: "Adabor / Mohammadpur",
    city: "Dhaka",
    lat: 23.7710,
    lon: 90.3580,
    category: "area",
    tags: ["adabor", "shyamoli", "ring road", "mohammadpur", "a", "ad"]
  },

  // --- B ---
  {
    id: "banani-bus-stop",
    name: "Banani Kakoli Bus Stop & Rail Crossing",
    bnName: "বনানী কাকলী বাস স্টপ",
    area: "Banani",
    city: "Dhaka",
    lat: 23.7937,
    lon: 90.4046,
    category: "bus_terminal",
    tags: ["banani", "kakoli", "kemal ataturk", "rail crossing", "chairman bari", "b", "ba", "ban"]
  },
  {
    id: "badda-link-road",
    name: "Badda Link Road / Middle Badda",
    bnName: "বাড্ডা লিংক রোড / মধ্য বাড্ডা",
    area: "Badda",
    city: "Dhaka",
    lat: 23.7808,
    lon: 90.4266,
    category: "bus_terminal",
    tags: ["badda", "link road", "middle badda", "north badda", "gulshan-1 link", "b", "ba", "bad"]
  },
  {
    id: "baridhara-notun-bazar",
    name: "Notun Bazar Bus Stop / Baridhara",
    bnName: "নতুন বাজার বাস স্ট্যান্ড / বারিধারা",
    area: "Baridhara / Vatara",
    city: "Dhaka",
    lat: 23.7979,
    lon: 90.4243,
    category: "bus_terminal",
    tags: ["notun bazar", "baridhara", "vatara", "gulshan 2 link", "madani avenue", "b", "bar"]
  },
  {
    id: "bashundhara-main-gate",
    name: "Bashundhara R/A Main Gate / Jamuna Future Park",
    bnName: "বসুন্ধরা আবাসিক মেইন গেট / যমুনা ফিউচার পার্ক",
    area: "Bashundhara",
    city: "Dhaka",
    lat: 23.8142,
    lon: 90.4225,
    category: "landmark",
    tags: ["bashundhara", "jamuna future park", "jfp", "north south university", "nsu", "aiub", "iub", "kuril", "b", "bas"]
  },
  {
    id: "bijoy-sarani-metro-station",
    name: "Bijoy Sarani Metro Station & Military Museum",
    bnName: "বিজয় সরণি মেট্রো স্টেশন",
    area: "Tejgaon",
    city: "Dhaka",
    lat: 23.7656,
    lon: 90.3878,
    category: "metro_station",
    tags: ["bijoy sarani", "metro", "mrt", "novo theatre", "military museum", "b", "bi"]
  },
  {
    id: "banglamotor-mor",
    name: "Banglamotor Mor & Bus Stand",
    bnName: "বাংলা মোটর মোড়",
    area: "Banglamotor",
    city: "Dhaka",
    lat: 23.7460,
    lon: 90.3939,
    category: "landmark",
    tags: ["banglamotor", "sonar gaon", "kawran bazar", "shahbagh link", "b", "ba"]
  },

  // --- C ---
  {
    id: "chittagong-gEC-circle",
    name: "GEC Circle / Dampara Bus Stand",
    bnName: "জিইসি মোড় / দামপাড়া বাস স্ট্যান্ড",
    area: "GEC",
    city: "Chattogram",
    lat: 22.3592,
    lon: 91.8219,
    category: "bus_terminal",
    tags: ["chittagong", "chattogram", "gec", "dampara", "agrabad", "c", "ch"]
  },
  {
    id: "chawkbazar-dhaka",
    name: "Chawkbazar Shahi Masjid & Mor",
    bnName: "চকবাজার শাহী মসজিদ মোড়",
    area: "Old Dhaka",
    city: "Dhaka",
    lat: 23.7163,
    lon: 90.3956,
    category: "landmark",
    tags: ["chawkbazar", "old dhaka", "puran dhaka", "lalbagh", "c", "ch"]
  },
  {
    id: "coxsbazar-kolatoli",
    name: "Kolatoli Beach Bus Counter Point",
    bnName: "কলাতলী বিচ বাস কাউন্টার",
    area: "Kolatoli",
    city: "Cox's Bazar",
    lat: 21.4173,
    lon: 91.9840,
    category: "bus_terminal",
    tags: ["cox's bazar", "coxsbazar", "kolatoli", "sugandha", "sea beach", "c", "co"]
  },

  // --- D ---
  {
    id: "dhanmondi-32",
    name: "Dhanmondi 32 Bus Stand / Sukrabad",
    bnName: "ধানমন্ডি ৩২ বাস স্ট্যান্ড / শুক্রাবাদ",
    area: "Dhanmondi",
    city: "Dhaka",
    lat: 23.7512,
    lon: 90.3780,
    category: "bus_terminal",
    tags: ["dhanmondi", "32", "sukrabad", "mirpur road", "russell square", "d", "dh"]
  },
  {
    id: "dhanmondi-27",
    name: "Dhanmondi 27 / Rapa Plaza",
    bnName: "ধানমন্ডি ২৭ / রাপা প্লাজা",
    area: "Dhanmondi",
    city: "Dhaka",
    lat: 23.7548,
    lon: 90.3705,
    category: "landmark",
    tags: ["dhanmondi", "27", "rapa plaza", "shankar", "lalmatia link", "d", "dh"]
  },
  {
    id: "dhanmondi-lake-rabindra-sarobar",
    name: "Rabindra Sarobar / Dhanmondi 8/A",
    bnName: "রবীন্দ্র সরোবর / ধানমন্ডি ৮/এ",
    area: "Dhanmondi",
    city: "Dhaka",
    lat: 23.7438,
    lon: 90.3742,
    category: "landmark",
    tags: ["dhanmondi", "lake", "rabindra sarobar", "8a", "d", "dh"]
  },
  {
    id: "dhaka-medical-college",
    name: "Dhaka Medical College Hospital (DMCH)",
    bnName: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    area: "Bakshibazar",
    city: "Dhaka",
    lat: 23.7258,
    lon: 90.3976,
    category: "hospital",
    tags: ["dmch", "dhaka medical", "shahbagh", "curzon hall", "du", "d", "dh"]
  },
  {
    id: "dhaka-university-tsc",
    name: "Dhaka University TSC & Metro Station",
    bnName: "ঢাকা বিশ্ববিদ্যালয় টিএসসি / মেট্রো স্টেশন",
    area: "Dhaka University",
    city: "Dhaka",
    lat: 23.7328,
    lon: 90.3957,
    category: "metro_station",
    tags: ["tsc", "dhaka university", "du", "shohid minar", "metro", "d", "dh"]
  },

  // --- E ---
  {
    id: "ecb-chattar",
    name: "ECB Chattar & Flyover",
    bnName: "ইসিবি চত্বর ও ফ্লাইওভার",
    area: "Matikata / Mirpur DOHS",
    city: "Dhaka",
    lat: 23.8242,
    lon: 90.3920,
    category: "bus_terminal",
    tags: ["ecb", "chattar", "matikata", "mirpur dohs", "kalshi flyover", "cantonment", "e"]
  },
  {
    id: "elephant-road-bata-signal",
    name: "Elephant Road / Bata Signal",
    bnName: "এলিফ্যান্ট রোড / বাটা সিগন্যাল",
    area: "Elephant Road",
    city: "Dhaka",
    lat: 23.7397,
    lon: 90.3878,
    category: "commercial",
    tags: ["elephant road", "bata signal", "multiplan", "science lab link", "e", "el"]
  },

  // --- F ---
  {
    id: "farmgate-bus-stand",
    name: "Farmgate Bus Stand & Metro Station",
    bnName: "ফার্মগেট বাস স্ট্যান্ড ও মেট্রো স্টেশন",
    area: "Farmgate",
    city: "Dhaka",
    lat: 23.7570,
    lon: 90.3895,
    category: "metro_station",
    tags: ["farmgate", "metro", "ananda cinema", "khamarbari", "green road", "f", "fa"]
  },

  // --- G ---
  {
    id: "gabtoli-bus-terminal",
    name: "Gabtoli Inter-District Bus Terminal",
    bnName: "গাবতলী আন্তঃজেলা বাস টার্মিনাল",
    area: "Gabtoli",
    city: "Dhaka",
    lat: 23.7828,
    lon: 90.3475,
    category: "bus_terminal",
    tags: ["gabtoli", "bus terminal", "inter district", "kallyanpur", "g", "ga"]
  },
  {
    id: "gulshan-1-circle",
    name: "Gulshan 1 Circle & DCC Market",
    bnName: "গুলশান ১ সার্কেল",
    area: "Gulshan 1",
    city: "Dhaka",
    lat: 23.7788,
    lon: 90.4168,
    category: "commercial",
    tags: ["gulshan 1", "circle", "dcc market", "niketan link", "badda link", "g", "gu"]
  },
  {
    id: "gulshan-2-circle",
    name: "Gulshan 2 Circle",
    bnName: "গুলশান ২ সার্কেল",
    area: "Gulshan 2",
    city: "Dhaka",
    lat: 23.7925,
    lon: 90.4150,
    category: "commercial",
    tags: ["gulshan 2", "circle", "unimart", "diplomatic zone", "banani 11", "g", "gu"]
  },
  {
    id: "gazipur-chowrasta",
    name: "Gazipur Chowrasta & Bus Terminal",
    bnName: "গাজীপুর চৌরাস্তা বাস টার্মিনাল",
    area: "Chowrasta",
    city: "Gazipur",
    lat: 23.9985,
    lon: 90.3842,
    category: "bus_terminal",
    tags: ["gazipur", "chowrasta", "chandana", "joydebpur", "g", "ga"]
  },

  // --- J ---
  {
    id: "jatrabari-bus-stand",
    name: "Jatrabari Bus Stand & Mayor Hanif Flyover",
    bnName: "যাত্রাবাড়ী বাস স্ট্যান্ড",
    area: "Jatrabari",
    city: "Dhaka",
    lat: 23.7083,
    lon: 90.4350,
    category: "bus_terminal",
    tags: ["jatrabari", "flyover", "chittagong road", "dholairpar", "sayedabad link", "j", "ja"]
  },
  {
    id: "jagannath-university",
    name: "Jagannath University & Sadarghat",
    bnName: "জগন্নাথ বিশ্ববিদ্যালয় ও সদরঘাট",
    area: "Old Dhaka",
    city: "Dhaka",
    lat: 23.7107,
    lon: 90.4116,
    category: "university",
    tags: ["jnu", "jagannath university", "sadarghat", "victoria park", "j", "ja"]
  },

  // --- K ---
  {
    id: "kamalapur-railway-station",
    name: "Kamalapur Central Railway Station",
    bnName: "কমলাপুর কেন্দ্রীয় রেলওয়ে স্টেশন",
    area: "Kamalapur",
    city: "Dhaka",
    lat: 23.7317,
    lon: 90.4262,
    category: "railway",
    tags: ["kamalapur", "train station", "railway", "central station", "motijheel", "k", "ka"]
  },
  {
    id: "kawran-bazar",
    name: "Kawran Bazar / Karwan Bazar Metro Station",
    bnName: "কাওরান বাজার মেট্রো স্টেশন",
    area: "Kawran Bazar",
    city: "Dhaka",
    lat: 23.7513,
    lon: 90.3934,
    category: "metro_station",
    tags: ["kawran bazar", "karwan bazar", "pan pacific sonar gaon", "tcs", "metro", "k", "ka"]
  },
  {
    id: "kallyanpur-bus-stand",
    name: "Kallyanpur Bus Stand / Gabtoli Link",
    bnName: "কল্যাণপুর বাস স্ট্যান্ড",
    area: "Kallyanpur",
    city: "Dhaka",
    lat: 23.7797,
    lon: 90.3602,
    category: "bus_terminal",
    tags: ["kallyanpur", "bus stand", "shyamoli", "darussalam", "k", "ka"]
  },
  {
    id: "kakrail-mor",
    name: "Kakrail Mor & Circuit House Road",
    bnName: "কাকরাইল মোড়",
    area: "Kakrail",
    city: "Dhaka",
    lat: 23.7389,
    lon: 90.4075,
    category: "landmark",
    tags: ["kakrail", "mor", "shantinagar", "ramna park", "moghbazar link", "k", "ka"]
  },
  {
    id: "khilkhet-bus-stop",
    name: "Khilkhet Bus Stop & Foot Overbridge",
    bnName: "খিলক্ষেত বাস স্টপ",
    area: "Khilkhet",
    city: "Dhaka",
    lat: 23.8298,
    lon: 90.4206,
    category: "bus_terminal",
    tags: ["khilkhet", "overbridge", "nikunja", "airport road", "kuril link", "k", "kh"]
  },
  {
    id: "kuril-biswa-road",
    name: "Kuril Biswa Road & Flyover",
    bnName: "কুড়িল বিশ্বরোড ও ফ্লাইওভার",
    area: "Kuril",
    city: "Dhaka",
    lat: 23.8202,
    lon: 90.4215,
    category: "bus_terminal",
    tags: ["kuril", "biswa road", "flyover", "purbachal 300 feet", "bashundhara gate", "k", "ku"]
  },

  // --- L ---
  {
    id: "lalbagh-fort",
    name: "Lalbagh Fort (Lalbagh Kella)",
    bnName: "লালবাগ কেল্লা",
    area: "Lalbagh",
    city: "Dhaka",
    lat: 23.7188,
    lon: 90.3881,
    category: "landmark",
    tags: ["lalbagh fort", "kella", "puran dhaka", "historic", "l", "la"]
  },

  // --- M ---
  {
    id: "mirpur-10-roundabout",
    name: "Mirpur 10 Roundabout & Metro Station",
    bnName: "মিরপুর ১০ গোলচত্বর ও মেট্রো স্টেশন",
    area: "Mirpur 10",
    city: "Dhaka",
    lat: 23.8070,
    lon: 90.3685,
    category: "metro_station",
    tags: ["mirpur 10", "metro", "roundabout", "golchottor", "fire service", "m", "mi"]
  },
  {
    id: "mirpur-1-bus-stand",
    name: "Mirpur 1 Bus Stand & Muktijoddha Market",
    bnName: "মিরপুর ১ বাস স্ট্যান্ড",
    area: "Mirpur 1",
    city: "Dhaka",
    lat: 23.7958,
    lon: 90.3533,
    category: "bus_terminal",
    tags: ["mirpur 1", "bus stand", "sony cinema", "muktijoddha market", "m", "mi"]
  },
  {
    id: "mirpur-11-metro-station",
    name: "Mirpur 11 Metro Station",
    bnName: "মিরপুর ১১ মেট্রো স্টেশন",
    area: "Mirpur 11",
    city: "Dhaka",
    lat: 23.8184,
    lon: 90.3670,
    category: "metro_station",
    tags: ["mirpur 11", "metro", "purobi cinema", "pallabi link", "m", "mi"]
  },
  {
    id: "mirpur-12-bus-stand",
    name: "Mirpur 12 Bus Stand & Metro Terminal",
    bnName: "মিরপুর ১২ বাস স্ট্যান্ড",
    area: "Mirpur 12",
    city: "Dhaka",
    lat: 23.8285,
    lon: 90.3644,
    category: "bus_terminal",
    tags: ["mirpur 12", "metro", "terminal", "dohs link", "m", "mi"]
  },
  {
    id: "mohakhali-bus-terminal",
    name: "Mohakhali Inter-District Bus Terminal",
    bnName: "মহাখালী আন্তঃজেলা বাস টার্মিনাল",
    area: "Mohakhali",
    city: "Dhaka",
    lat: 23.7776,
    lon: 90.4005,
    category: "bus_terminal",
    tags: ["mohakhali", "bus terminal", "wireless gate", "icddrb", "tb gate", "m", "mo"]
  },
  {
    id: "mohakhali-raowa-club",
    name: "Mohakhali DOHS / RAOWA Club",
    bnName: "মহাখালী ডিওএইচএস / রাওয়া ক্লাব",
    area: "Mohakhali",
    city: "Dhaka",
    lat: 23.7820,
    lon: 90.3955,
    category: "landmark",
    tags: ["mohakhali", "dohs", "raowa club", "jahangir gate", "m", "mo"]
  },
  {
    id: "motijheel-shapla-chattar",
    name: "Motijheel Shapla Chattar & Metro Terminal",
    bnName: "মতিঝিল শাপলা চত্বর ও মেট্রো স্টেশন",
    area: "Motijheel",
    city: "Dhaka",
    lat: 23.7291,
    lon: 90.4180,
    category: "metro_station",
    tags: ["motijheel", "shapla chattar", "metro", "bangladesh bank", "commercial area", "m", "mo"]
  },
  {
    id: "mohammadpur-bus-stand",
    name: "Mohammadpur Bus Stand & Town Hall",
    bnName: "মোহাম্মদপুর বাস স্ট্যান্ড ও টাউন হল",
    area: "Mohammadpur",
    city: "Dhaka",
    lat: 23.7582,
    lon: 90.3606,
    category: "bus_terminal",
    tags: ["mohammadpur", "bus stand", "town hall", "krishi market", "nurjahan road", "m", "mo"]
  },
  {
    id: "mohammadpur-beribadh-tin-rasta",
    name: "Mohammadpur Beribadh / Tin Rasta",
    bnName: "মোহাম্মদপুর বেড়িবাঁধ / তিন রাস্তা মোড়",
    area: "Mohammadpur",
    city: "Dhaka",
    lat: 23.7540,
    lon: 90.3470,
    category: "landmark",
    tags: ["mohammadpur", "beribadh", "tin rasta", "bosila bridge link", "m", "mo"]
  },
  {
    id: "moghbazar-chourasta",
    name: "Moghbazar Chowrasta & Wireless Mor",
    bnName: "মগবাজার চৌরাস্তা ও ওয়ারলেস মোড়",
    area: "Moghbazar",
    city: "Dhaka",
    lat: 23.7495,
    lon: 90.4075,
    category: "bus_terminal",
    tags: ["moghbazar", "chowrasta", "wireless", "flyover", "holly family", "m", "mo"]
  },
  {
    id: "malibagh-rail-gate",
    name: "Malibagh Rail Gate & Chowdhury Para",
    bnName: "মালিবাগ রেলগেট",
    area: "Malibagh",
    city: "Dhaka",
    lat: 23.7510,
    lon: 90.4172,
    category: "landmark",
    tags: ["malibagh", "rail gate", "chowdhury para", "dider", "shantinagar", "m", "ma"]
  },

  // --- N ---
  {
    id: "new-market-nilkhet",
    name: "Dhaka New Market & Nilkhet Book Market",
    bnName: "ঢাকা নিউ মার্কেট ও নীলক্ষেত",
    area: "New Market",
    city: "Dhaka",
    lat: 23.7335,
    lon: 90.3842,
    category: "commercial",
    tags: ["new market", "nilkhet", "balaka cinema", "gawsia", "chandni chowk", "n", "ne"]
  },
  {
    id: "narayanganj-chasara",
    name: "Chasara Bus Stand & Railway Station",
    bnName: "চাষাড়া বাস স্ট্যান্ড",
    area: "Chasara",
    city: "Narayanganj",
    lat: 23.6238,
    lon: 90.4990,
    category: "bus_terminal",
    tags: ["narayanganj", "chasara", "shibbari", "railway", "n", "na"]
  },

  // --- P ---
  {
    id: "paltan-mor",
    name: "Purana Paltan Mor & Baitul Mukarram",
    bnName: "পুরানা পল্টন মোড় ও বায়তুল মোকাররম",
    area: "Paltan",
    city: "Dhaka",
    lat: 23.7305,
    lon: 90.4132,
    category: "landmark",
    tags: ["paltan", "purana paltan", "baitul mukarram", "national stadium", "press club", "p", "pa"]
  },
  {
    id: "pallabi-metro-station",
    name: "Pallabi Metro Station",
    bnName: "পল্লবী মেট্রো স্টেশন",
    area: "Pallabi",
    city: "Dhaka",
    lat: 23.8247,
    lon: 90.3647,
    category: "metro_station",
    tags: ["pallabi", "metro", "mirpur 12 link", "mrt", "p", "pa"]
  },
  {
    id: "purbachal-300-feet",
    name: "Purbachal 300 Feet Express Highway",
    bnName: "পূর্বাচল ৩০০ ফিট এক্সপ্রেসওয়ে",
    area: "Purbachal",
    city: "Dhaka",
    lat: 23.8270,
    lon: 90.4560,
    category: "landmark",
    tags: ["purbachal", "300 feet", "expressway", "chef table", "neelgonj", "p", "pu"]
  },

  // --- R ---
  {
    id: "rampura-bridge",
    name: "Rampura Bridge & TV Bhaban",
    bnName: "রামপুরা ব্রিজ ও বিটিভি ভবন",
    area: "Rampura",
    city: "Dhaka",
    lat: 23.7628,
    lon: 90.4222,
    category: "bus_terminal",
    tags: ["rampura", "bridge", "btv", "hatirjheel link", "banasree link", "r", "ra"]
  },
  {
    id: "rajlakshmi-uttara",
    name: "Rajlakshmi Complex & Bus Stand (Uttara Sector 3)",
    bnName: "রাজলক্ষ্মী বাস স্ট্যান্ড / সেক্টর ৩",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8647,
    lon: 90.3995,
    category: "bus_terminal",
    tags: ["rajlakshmi", "uttara", "sector 3", "sector 6", "azampur", "r", "ra"]
  },

  // --- S ---
  {
    id: "sayedabad-bus-terminal",
    name: "Sayedabad Inter-District Bus Terminal",
    bnName: "সায়েদাবাদ আন্তঃজেলা বাস টার্মিনাল",
    area: "Sayedabad",
    city: "Dhaka",
    lat: 23.7126,
    lon: 90.4285,
    category: "bus_terminal",
    tags: ["sayedabad", "bus terminal", "janapath", "chittagong sylhet route", "s", "sa"]
  },
  {
    id: "shahbagh-mor",
    name: "Shahbagh Mor & Metro Station (BSMMU / PG Hospital)",
    bnName: "শাহবাগ মোড় ও মেট্রো স্টেশন",
    area: "Shahbagh",
    city: "Dhaka",
    lat: 23.7389,
    lon: 90.3957,
    category: "metro_station",
    tags: ["shahbagh", "metro", "bsmmu", "pg hospital", "national museum", "du", "s", "sh"]
  },
  {
    id: "science-lab-mor",
    name: "Science Laboratory Mor & Bus Stop",
    bnName: "সায়েন্স ল্যাব মোড়",
    area: "Science Lab",
    city: "Dhaka",
    lat: 23.7385,
    lon: 90.3812,
    category: "bus_terminal",
    tags: ["science lab", "city college", "priyangan", "mirpur road", "s", "sc"]
  },
  {
    id: "shyamoli-bus-stand",
    name: "Shyamoli Square & Bus Stand",
    bnName: "শ্যামলী স্কয়ার ও বাস স্ট্যান্ড",
    area: "Shyamoli",
    city: "Dhaka",
    lat: 23.7712,
    lon: 90.3644,
    category: "bus_terminal",
    tags: ["shyamoli", "square", "shishu hospital", "suhrawardy hospital", "s", "sh"]
  },
  {
    id: "shantinagar-mor",
    name: "Shantinagar Mor & Twin Towers",
    bnName: "শান্তিনগর মোড়",
    area: "Shantinagar",
    city: "Dhaka",
    lat: 23.7410,
    lon: 90.4140,
    category: "commercial",
    tags: ["shantinagar", "twin towers", "chameli bagh", "moghbazar link", "s", "sh"]
  },
  {
    id: "savar-bus-stand",
    name: "Savar Bus Stand & Bazaar",
    bnName: "সাভার বাস স্ট্যান্ড",
    area: "Savar",
    city: "Dhaka",
    lat: 23.8440,
    lon: 90.2580,
    category: "bus_terminal",
    tags: ["savar", "bazaar", "national monument", "jahangirnagar", "s", "sa"]
  },

  // --- T ---
  {
    id: "tejgaon-nabisco-mor",
    name: "Tejgaon Nabisco Mor & Industrial Area",
    bnName: "তেজগাঁও নাবিস্কো মোড়",
    area: "Tejgaon",
    city: "Dhaka",
    lat: 23.7688,
    lon: 90.4045,
    category: "commercial",
    tags: ["tejgaon", "nabisco", "tibbat", "channel i", "link road", "t", "te"]
  },
  {
    id: "tongi-bazar-bus-stand",
    name: "Tongi Bazar & Station Road",
    bnName: "টঙ্গী বাজার ও স্টেশন রোড",
    area: "Tongi",
    city: "Gazipur",
    lat: 23.8965,
    lon: 90.4022,
    category: "bus_terminal",
    tags: ["tongi", "station road", "bazar", "turag river", "t", "to"]
  },

  // --- U ---
  {
    id: "uttara-house-building",
    name: "House Building Bus Stand (Uttara Sector 7 & 9)",
    bnName: "হাউজ বিল্ডিং বাস স্ট্যান্ড (উত্তরা)",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8735,
    lon: 90.3988,
    category: "bus_terminal",
    tags: ["house building", "uttara", "sector 7", "sector 9", "sector 6", "dhaka mymensingh highway", "u", "ut"]
  },
  {
    id: "uttara-north-metro-station",
    name: "Uttara North (Diabari) Metro Station",
    bnName: "উত্তরা উত্তর (দিয়াবাড়ি) মেট্রো স্টেশন",
    area: "Diabari / Uttara",
    city: "Dhaka",
    lat: 23.8821,
    lon: 90.3705,
    category: "metro_station",
    tags: ["diabari", "uttara north", "metro", "mrt depot", "kashful", "u", "ut"]
  },
  {
    id: "uttara-center-metro-station",
    name: "Uttara Center Metro Station",
    bnName: "উত্তরা সেন্টার মেট্রো স্টেশন",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8710,
    lon: 90.3790,
    category: "metro_station",
    tags: ["uttara center", "metro", "sector 18", "u", "ut"]
  },
  {
    id: "uttara-south-metro-station",
    name: "Uttara South Metro Station",
    bnName: "উত্তরা দক্ষিণ মেট্রো স্টেশন",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8615,
    lon: 90.3845,
    category: "metro_station",
    tags: ["uttara south", "metro", "azampur link", "u", "ut"]
  },
  {
    id: "uttara-jasimuddin-bus-stand",
    name: "Jasimuddin Road Bus Stand (Uttara Sector 1 & 3)",
    bnName: "জসীমউদদীন বাস স্ট্যান্ড (উত্তরা)",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8585,
    lon: 90.4005,
    category: "bus_terminal",
    tags: ["jasimuddin", "uttara", "sector 1", "sector 3", "airport link", "u", "ut"]
  },
  {
    id: "uttara-sector-11-kacha-bazar",
    name: "Uttara Sector 11 Kacha Bazar & Sonargaon Janapath",
    bnName: "উত্তরা সেক্টর ১১ কাঁচা বাজার",
    area: "Uttara",
    city: "Dhaka",
    lat: 23.8765,
    lon: 90.3875,
    category: "commercial",
    tags: ["uttara sector 11", "zamzam tower", "sonargaon janapath", "u", "ut"]
  },

  // --- W ---
  {
    id: "wari-baldha-garden",
    name: "Wari Baldha Garden & Christian Graveyard",
    bnName: "ওয়ারী বলধা গার্ডেন",
    area: "Wari",
    city: "Dhaka",
    lat: 23.7160,
    lon: 90.4185,
    category: "landmark",
    tags: ["wari", "baldha garden", "rankin street", "old dhaka", "w", "wa"]
  }
];

export function searchLocalPlaces(rawQuery: string): CuratedPlace[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  // Match ranking:
  // 1. Exact start match on name or tag
  // 2. Contains match on name
  // 3. Match on area or category or tags
  const scored = BANGLADESH_PLACES.map(place => {
    const nameLower = place.name.toLowerCase();
    const bnNameLower = (place.bnName || "").toLowerCase();
    const areaLower = place.area.toLowerCase();
    const cityLower = place.city.toLowerCase();

    let score = 0;

    if (nameLower.startsWith(q)) {
      score += 100;
    } else if (nameLower.split(/[\s(/]+/).some(word => word.startsWith(q))) {
      score += 80;
    } else if (nameLower.includes(q)) {
      score += 60;
    }

    if (place.tags.some(t => t.startsWith(q))) {
      score += 50;
    } else if (place.tags.some(t => t.includes(q))) {
      score += 30;
    }

    if (bnNameLower.includes(q)) {
      score += 90;
    }

    if (areaLower.startsWith(q)) {
      score += 40;
    } else if (areaLower.includes(q)) {
      score += 20;
    }

    if (cityLower.startsWith(q)) {
      score += 10;
    }

    return { place, score };
  }).filter(item => item.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map(item => item.place);
}
