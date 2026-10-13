import type { Question } from './game'

export const customQuestions: Question[] = [
  {
    "id": "custom-1",
    "category": "Student Life",
    "pack": "grover",
    "week": "Week 1",
    "prompt": "Places to Scan your Student ID.",
    "detail": "",
    "answers": [
      { "name": "Dining hall", "points": 10, "aliases": ["Hicks", "Hicks Dining", "Hicks Dining Hall", "MAP", "MAP Dining", "MAP Dining Hall"] },
      { "name": "Curriculum Library", "points": 70, "aliases": ["Curriculum"] },
      { "name": "Chickfila", "points": 10, "aliases": ["CFA", "Chick-fil-a", "Chick", "Kiosk", "Chickfila Kiosk"] },
      { "name": "Hicks Market", "points": 20 },
      { "name": "MAP Market", "points": 20 },
      { "name": "Print Services", "points": 70 },
      { "name": "Garage", "points": 20, "aliases": ["Cafe", "MAP Cafe", "MAP Garage", "The Garage", "Cafe"] },
      { "name": "Bookstore", "points": 40 },
      { "name": "Chapel", "points": 30, "aliases": ["Fiver", "Chapel Credit"] },
      { "name": "Mailroom", "points": 40, "aliases": ["Mail"] },
      { "name": "TLC", "points": 85, "aliases": ["Technological Learning Center", "Helpdesk", "Help", "IT"] },
      { "name": "Dorm", "points": 10, "aliases": ["Dorms", "Building", "Hall", "Entrance", "Building Entrance", "Building", "Hall"] },
      { "name": "Urban Trail", "points": 50, "aliases": ["Urban"] },
      { "name": "CAD Lab", "points": 100, "aliases": ["CAD", "Lab"] },
      { "name": "Classroom", "points": 40, "aliases": ["Class", "Room"] },
      { "name": "Library", "points": 60, "aliases": ["Book", "Checkout Book"] }
    ]
  },
  {
    "id": "custom-2",
    "category": "Greek",
    "pack": "grover",
    "week": "Week 1",
    "prompt": "Housing Groups on Campus.",
    "detail": "",
    "answers": [
      { "name": "Buffalos", "points": 10, "aliases": ["Delta Rho Sigma", "DRS", "APE"] },
      { "name": "AEX", "points": 10, "aliases": ["Alpha Epsilon Chi"] },
      { "name": "Alpha Sigma", "points": 40, "aliases": ["AS"] },
      { "name": "Zenoids", "points": 70, "aliases": ["Zeta Xi Omega", "ZXO"] },
      { "name": "Tri Rho", "points": 10, "aliases": ["Tri Rhos", "Rho Rho Rho", "PPP", "P P P", "RRR", "R R R"] },
      { "name": "Nu Delta Epsilon", "points": 80, "aliases": ["Nu Del", "Nu Delta", "NDE"] },
      { "name": "Phi Omega Sigma", "points": 20, "aliases": ["Possums", "Possum", "Opossum", "Opossums", "POS"] },
      { "name": "Sigma Phi Omicron", "points": 60, "aliases": ["Cron", "Crons", "SPO"] },
      { "name": "Alpha Omega", "points": 100, "aliases": ["AO", "AOs"] }
    ]
  },
  {
    "id": "custom-3",
    "category": "Food",
    "pack": "grover",
    "week": "Week 1",
    "prompt": "Places in SAC.",
    "detail": "",
    "answers": [
      { "name": "Mailroom", "points": 20, "aliases": ["Mail"] },
      { "name": "Bookstore", "points": 20, "aliases": ["Book"] },
      { "name": "Chickfila", "points": 10, "aliases": ["CFA", "Chick-fil-a", "Chick"] },
      { "name": "SGA", "points": 60, "aliases": ["Student Government", "Student Government Association"] },
      { "name": "SIC", "points": 70, "aliases": ["Student Involvement Committee"] },
      { "name": "SLL", "points": 50, "aliases": ["Student Life and Learning", "Student Life & Learning"] },
      { "name": "Student Lounge", "points": 30, "aliases": ["Study area", "chairs", "tables", "Food court"] },
      { "name": "Great Room", "points": 20, "aliases": ["The Great Room"] },
      { "name": "Fishbowl", "points": 30, "aliases": ["Fishbowl Rooms", "FIshbowl Room"] },
      { "name": "Commuter Lounge", "points": 80, "aliases": ["Commuter", "Locker"] },
      { "name": "Bathroom", "points": 100, "aliases": ["Bathrooms", "Men's Room", "Women's Room"] },
      { "name": "Elevator", "points": 90 }
    ]
  },
  {
    "id": "custom-4",
    "category": "Employment",
    "pack": "grover",
    "week": "Week 1",
    "prompt": "Student Worker Position on Campus.",
    "detail": "",
    "answers": [
      { "name": "Teacher's Assistant", "points": 10, "aliases": ["TA"] },
      { "name": "Dining Hall", "points": 20, "aliases": ["Cater", "Catering", "Dishes", "Dishwasher", "Cow"] },
      { "name": "TLC", "points": 10, "aliases": ["Technological Learning Center"] },
      { "name": "Bookstore", "points": 20 },
      { "name": "Intern", "points": 50, "aliases": ["E+I", "Parkhurst", "E+I Fellows", "E + I", "E + I Fellows"] },
      { "name": "Library", "points": 60 },
      { "name": "Media Services", "points": 50, "aliases": ["Media"] },
      { "name": "WSAJ Radio", "points": 100, "aliases": ["WSAJ"] },
      { "name": "Lobby Attendent", "points": 20, "aliases": ["Colonial", "Harker", "Ketler", "Ket Rec", "Ketler Rec", "MAP North", "MAP South", "MAP West", "Memorial", "MEP", "South"] },
      { "name": "Tour Guide", "points": 80, "aliases": ["Tour", "Guide"] },
      { "name": "Chapel", "points": 40, "aliases": ["Chapel", "Slides", "Chapel Slides"] },
      { "name": "Theater", "points": 50, "aliases": ["Technician", "PEW", "Peter", "Peter Brumbach", "Musical", "Play", "Orchesis", "24 hour", "PEW"] },
      { "name": "Curriculum Library", "points": 70, "aliases": ["Curriculum"] },
      { "name": "Housekeeping", "points": 30 },
      { "name": "Mailroom", "points": 20, "aliases": ["Mail"] },
      { "name": "Safety", "points": 30, "aliases": ["Campus Safety", "Campo"] },
      { "name": "Chickfila", "points": 20, "aliases": ["CFA", "Chick-fil-a", "Chick"] },
      { "name": "Tutoring", "points": 50, "aliases": ["Tutor"] },
      { "name": "Timer", "points": 80, "aliases": ["Swim Timer", "Time", "Swim", "Swim Meet"] },
      { "name": "SLL", "points": 60, "aliases": ["Student Life and Learning", "Student Life & Learning", "SL&L"] }
    ]
  },
  {
    "id": "custom-",
    "category": "Food",
    "pack": "grover",
    "week": "Week 1",
    "prompt": "Places to get a Drink on Campus.",
    "detail": "",
    "answers": [
      { "name": "Zerbe", "points": 100, "aliases": ["Zerbe Wellness", "Zerbe Wellness Center"] },
      { "name": "Vending Machine", "points": 30, "aliases": ["Vending"] },
      { "name": "Dining Hall", "points": 10, "aliases": ["Hicks", "Map", "Garage", "MAP Cafe", "Hicks Market", "MAP Market", "Market"] },
      { "name": "Chickfila", "points": 10, "aliases": ["CFA", "Chick-fil-a", "Chick"] },
      { "name": "Water Fountain", "points": 20 },
      { "name": "Fountain", "points": 50 },
      { "name": "Wolf Creek", "points": 70, "aliases": ["Wolf", "Wolfe", "Wolfe Creek", "Creek"] },
      { "name": "Urban Trail", "points": 20, "aliases": ["Urban"] },
      { "name": "Zenoids", "points": 80, "aliases": ["Zeta XI Omega", "ZXO", "Zenoid", "Zenoid Hall"] }
    ]
  },
  {
    "id": "custom-6",
    "category": "Buildings",
    "pack": "grover",
    "prompt": "Name a building on campus that starts with \"H\".",
    "detail": "",
    "answers": [
      {
        "name": "Hicks Hall",
        "points": 10,
        "aliases": [
          "Hicks",
          "Hicks Dining",
          "Hicks Dining Hall"
        ]
      },
      {
        "name": "Harker Hall",
        "points": 30,
        "aliases": [
          "Harker",
          "Helen Harker",
          "Helen Harker Hall"
        ]
      },
      {
        "name": "Henry Buhl Library",
        "points": 100,
        "aliases": [
          "Buhl",
          "Library",
          "Henry Buhl",
          "Buhl Library"
        ]
      },
      {
        "name": "Hoyt Hall",
        "points": 40,
        "aliases": [
          "Hoyt"
        ]
      },
      {
        "name": "Hopeman Hall",
        "points": 30,
        "aliases": [
          "Hopeman"
        ]
      },
      {
        "name": "Harbison Chapel",
        "points": 60,
        "aliases": [
          "Harbison",
          "Chapel"
        ]
      }
    ],
    "week": "Week 2"
  },
  {
    "id": "custom-7",
    "category": "Academics",
    "pack": "grover",
    "prompt": "Name an academic department (like computer science).",
    "detail": "Information sourced from https://www.gcc.edu/Utility/Offices/Registrar/Degree-Requirements",
    "answers": [
      {
        "name": "Accounting & Finance",
        "points": 30,
        "aliases": [
          "Accounting",
          "Finance"
        ]
      },
      {
        "name": "Applied Science & Engineering",
        "points": 80,
        "aliases": [
          "Applied Science"
        ]
      },
      {
        "name": "Biblical & Theological Studies and Philosphy",
        "points": 60,
        "aliases": [
          "Philosophy",
          "BATS",
          "BARS",
          "Religion",
          "Theology",
          "Bible"
        ]
      },
      {
        "name": "Biology",
        "points": 10,
        "aliases": [
          "Bio"
        ]
      },
      {
        "name": "Chemistry",
        "points": 10,
        "aliases": [
          "Chem"
        ]
      },
      {
        "name": "Communication & Design",
        "points": 40,
        "aliases": [
          "Communications",
          "Design",
          "Communication",
          "Comms"
        ]
      },
      {
        "name": "Computer Science",
        "points": 10,
        "aliases": [
          "Comp Sci",
          "Computer"
        ]
      },
      {
        "name": "Economics",
        "points": 20,
        "aliases": [
          "Econ"
        ]
      },
      {
        "name": "Education",
        "points": 10,
        "aliases": [
          "Ed",
          "Classical Education",
          "Elementary Education",
          "Christian Education",
          "Christian Ed",
          "Classical Ed"
        ]
      },
      {
        "name": "Electrical & Computer Engineering",
        "points": 60,
        "aliases": [
          "Electrical",
          "Computer Engineering",
          "Electrical and Computer Engineering"
        ]
      },
      {
        "name": "English",
        "points": 20
      },
      {
        "name": "Entrepreneurship",
        "points": 30
      },
      {
        "name": "History",
        "points": 20
      },
      {
        "name": "Management & Marketing",
        "points": 50,
        "aliases": [
          "Management",
          "Marketing",
          "Management and Marketing"
        ]
      },
      {
        "name": "Mathematics",
        "points": 10,
        "aliases": [
          "Math"
        ]
      },
      {
        "name": "Mechanical Engineering",
        "points": 30,
        "aliases": [
          "Mech E",
          "Mechanical",
          "Engineering"
        ]
      },
      {
        "name": "Modern Languages",
        "points": 80,
        "aliases": [
          "Languages"
        ]
      },
      {
        "name": "Music, Theatre, and Arts",
        "points": 70,
        "aliases": [
          "Music",
          "Theater",
          "Arts",
          "Theatre"
        ]
      },
      {
        "name": "Nursing",
        "points": 40
      },
      {
        "name": "Physics",
        "points": 10
      },
      {
        "name": "Political Science",
        "points": 50,
        "aliases": [
          "Poli Sci",
          "Poly Sci",
          "Politics",
          "Political"
        ]
      },
      {
        "name": "Psychology & Social Work",
        "points": 60,
        "aliases": [
          "Psych",
          "Social Work",
          "Psychology and Social Work",
          "Psychology"
        ]
      },
      {
        "name": "Undeclared",
        "points": 100
      }
    ],
    "week": "Week 2"
  },
  {
    "id": "custom-8",
    "category": "Publications",
    "pack": "grover",
    "prompt": "Name a Grove City College publication.",
    "detail": "",
    "answers": [
      {
        "name": "The Collegian",
        "points": 10,
        "aliases": [
          "Collegian"
        ]
      },
      {
        "name": "Cogitare Magazine",
        "points": 60,
        "aliases": [
          "Cogitare"
        ]
      },
      {
        "name": "The Echo",
        "points": 70,
        "aliases": [
          "Echo"
        ]
      },
      {
        "name": "Journal of Law and Public Policy",
        "points": 90,
        "aliases": [
          "Journal",
          "Journal of Law",
          "Journal of Law & Public Policy"
        ]
      },
      {
        "name": "GeDunk Magazine",
        "points": 30,
        "aliases": [
          "GeDunk"
        ]
      },
      {
        "name": "The Oujia Yearbook",
        "points": 100,
        "aliases": [
          "Oujia",
          "Yearbook",
          "Bridge",
          "The Bridge",
          "The Bridge Yearbook",
          "Yearbooks"
        ]
      },
      {
        "name": "Archival Alumni News",
        "points": 100,
        "aliases": [
          "Alumni News",
          "Archival"
        ]
      },
      {
        "name": "Athletics",
        "points": 70,
        "aliases": [
          "Athletic"
        ]
      },
      {
        "name": "President's Inauguration",
        "points": 100,
        "aliases": [
          "Inauguration",
          "President Inauguration"
        ]
      },
      {
        "name": "Office of Global Programs",
        "points": 100,
        "aliases": [
          "Going Global",
          "Global Programs",
          "Global"
        ]
      },
      {
        "name": "The Quad",
        "points": 100,
        "aliases": [
          "Quad"
        ]
      },
      {
        "name": "Admissions",
        "points": 80,
        "aliases": [
          "Open Your Eyes"
        ]
      },
      {
        "name": "Career Services Office",
        "points": 60,
        "aliases": [
          "CSO",
          "Career Services"
        ]
      },
      {
        "name": "Student Life and Learning",
        "points": 60,
        "aliases": [
          "SLL",
          "SL&L",
          "SL and L",
          "Student Life",
          "Life"
        ]
      }
    ],
    "week": "Week 2"
  },
  {
    "id": "custom-9",
    "category": "Buildings",
    "pack": "grover",
    "prompt": "Name an area of the PLC.",
    "detail": "",
    "answers": [
      {
        "name": "Grove City College Arena",
        "points": 10,
        "aliases": [
          "Arena",
          "Basketball",
          "Basketball Court",
          "Court",
          "Courts",
          "Basketball Courts",
          "Volleyball Court",
          "Volleyball",
          "Gym",
          "Gymnasium"
        ]
      },
      {
        "name": "Pool",
        "points": 20,
        "aliases": [
          "Competition Pool",
          "Recreation Pool",
          "The pool"
        ]
      },
      {
        "name": "IM Rooms",
        "points": 20,
        "aliases": [
          "Intramural",
          "Intramural Room"
        ]
      },
      {
        "name": "Fitness Center",
        "points": 10,
        "aliases": [
          "Fitness",
          "Weight room",
          "weight",
          "aerobics",
          "aerobics room"
        ]
      },
      {
        "name": "Racquetball Courts",
        "points": 70,
        "aliases": [
          "Racquetball",
          "Racketball",
          "Racketball courts",
          "Racketball court",
          "Racquetball Court"
        ]
      },
      {
        "name": "Dance Studio",
        "points": 70,
        "aliases": [
          "Dance"
        ]
      },
      {
        "name": "Hall of Fame",
        "points": 60,
        "aliases": [
          "Fame"
        ]
      },
      {
        "name": "Heritage Hall",
        "points": 60,
        "aliases": [
          "Heritage"
        ]
      },
      {
        "name": "Athletic Training Room",
        "points": 30,
        "aliases": [
          "Training room",
          "train",
          "training",
          "Athletic",
          "Varsity",
          "Varsity Weight room",
          "varsity fitness",
          "varsity center",
          "varsity fitness center",
          "varsity lifting",
          "lifting"
        ]
      },
      {
        "name": "Career Services Office",
        "points": 20,
        "aliases": [
          "CSO",
          "Career Services",
          "Career Service"
        ]
      },
      {
        "name": "Alumni Hall",
        "points": 30,
        "aliases": [
          "Alumni"
        ]
      },
      {
        "name": "Bowling Alley",
        "points": 40,
        "aliases": [
          "Bowling",
          "Bowl",
          "Alley"
        ]
      },
      {
        "name": "Locker rooms",
        "points": 10,
        "aliases": [
          "Lockers",
          "Locker",
          "Locker room",
          "Men's Locker",
          "Women's Locker",
          "Men's Locker Room",
          "Women's Locker Room"
        ]
      },
      {
        "name": "Track",
        "points": 100,
        "aliases": [
          "Suspended Track"
        ]
      },
      {
        "name": "Bathrooms",
        "points": 10,
        "aliases": [
          "Bathroom",
          "Restroom"
        ]
      }
    ],
    "week": "Week 2"
  },
  {
    "id": "custom-10",
    "category": "Buildings",
    "pack": "grover",
    "prompt": "Name a non-academic and non-dorm building on campus (PLC and TLC don't count).",
    "detail": "",
    "answers": [
      {
        "name": "Crawford Hall",
        "points": 10,
        "aliases": [
          "Crawford"
        ]
      },
      {
        "name": "Harbison Chapel",
        "points": 10,
        "aliases": [
          "Harbison",
          "Chapel"
        ]
      },
      {
        "name": "Breen Student Union",
        "points": 10,
        "aliases": [
          "SAC",
          "STU",
          "Breen",
          "Student Union"
        ]
      },
      {
        "name": "Carnegie Alumni Center",
        "points": 30,
        "aliases": [
          "Carnegie",
          "Alumni",
          "Alumni Center"
        ]
      },
      {
        "name": "Physical Learning Center",
        "points": 20,
        "aliases": [
          "PLC",
          "Physical Learning",
          "Physical"
        ]
      },
      {
        "name": "Rathburn Hall",
        "points": 20,
        "aliases": [
          "Rathburn"
        ]
      },
      {
        "name": "Presidents' House",
        "points": 30,
        "aliases": [
          "President's House",
          "President",
          "Presidents House"
        ]
      },
      {
        "name": "Cunningham House",
        "points": 50,
        "aliases": [
          "Cunningham"
        ]
      },
      {
        "name": "Stewart House",
        "points": 100,
        "aliases": [
          "Stewart"
        ]
      },
      {
        "name": "Larry House",
        "points": 100,
        "aliases": [
          "Larry"
        ]
      },
      {
        "name": "Central Utility Plant",
        "points": 100,
        "aliases": [
          "CUP",
          "Utility",
          "Utility Plant",
          "Plant"
        ]
      },
      {
        "name": "Phillips Field House",
        "points": 40,
        "aliases": [
          "Field House",
          "Field"
        ]
      },
      {
        "name": "McNulty Athletic Center",
        "points": 70,
        "aliases": [
          "MAC",
          "McNulty",
          "Athletic Center"
        ]
      },
      {
        "name": "Zerbe Wellness Center",
        "points": 10,
        "aliases": [
          "Zerbe",
          "Zerbe Wellness",
          "Zerbe Center",
          "Health",
          "Health center"
        ]
      },
      {
        "name": "Lascell House",
        "points": 100,
        "aliases": [
          "Lascell"
        ]
      },
      {
        "name": "Facilities Management and Central Receiving",
        "points": 100,
        "aliases": [
          "FMCR",
          "Facilities Management & Central Receiving",
          "Facilities",
          "Facilities Management"
        ]
      }
    ],
    "week": "Week 2"
  }
]
