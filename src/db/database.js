// ============================================================
// CampusHub PostgreSQL Database Client
// Connects to PostgreSQL (database: campushub) via Express API
// Fallback in-memory cache ensures instant UI renders and reactivity
// ============================================================

let connectionStatus = {
  connected: false,
  database: 'campushub',
  user: 'postgres',
  port: 5432,
  version: 'PostgreSQL 18.6',
  error: null,
};

let nextId = {
  events: 4,
  organizers: 6,
  venues: 3,
  participants: 66,
  sponsors: 6,
  expenses: 10,
};

// Cached tables
let venues = [
  { id: 1, name: 'Sankalp Ground', capacity: 1500, image_url: '/venues/sankalp_ground.jpg' },
  { id: 2, name: 'Galaxy Auditorium', capacity: 200, image_url: '/venues/galaxy_auditorium.jpg' },
  { id: 3, name: 'Indoor Stadium', capacity: 600, image_url: '/venues/indoor_stadium.jpg' },
  { id: 4, name: 'Cineplix', capacity: 300, image_url: '/venues/cineplix.jpg' },
  { id: 5, name: 'Octagon Library', capacity: 250, image_url: '/venues/octagon_library.jpg' },
];

let events = [
  { id: 1, name: 'Sankalp 2026', date: '2026-11-26', venue_id: 1, base_budget: 3000000 },
  { id: 2, name: 'Cultural Night', date: '2026-11-20', venue_id: 2, base_budget: 30000 },
  { id: 3, name: 'HactoberFest 2026', date: '2026-12-05', venue_id: 3, base_budget: 40000 },
];

let organizers = [
  { id: 1, name: 'Rahul Sarkar', email: 'rahul.sarkar@college.edu', role: 'Faculty Coordinator' },
  { id: 2, name: 'Subasish Rauta', email: 'subasish.rauta@college.edu', role: 'President' },
  { id: 3, name: 'Asutosh Mahapatra', email: 'asutosh.mahapatra@college.edu', role: 'Treasurer' },
  { id: 4, name: 'Dipten Sharma', email: 'dipten.sharma@college.edu', role: 'Event Head' },
  { id: 5, name: 'S Nitesh Kumar', email: 'nitesh.kumar@college.edu', role: 'Logistics Lead' },
];

let participants = [
  {
    "id": 1,
    "name": "Aditya Gouda",
    "email": "aditya.gouda@student.edu",
    "roll_number": "202556171"
  },
  {
    "id": 2,
    "name": "Mayank Kumar",
    "email": "mayank.kumar@student.edu",
    "roll_number": "202556177"
  },
  {
    "id": 3,
    "name": "N Bhagyalaxmi Reddy",
    "email": "n.bhagyalaxmi.reddy@student.edu",
    "roll_number": "202557179"
  },
  {
    "id": 4,
    "name": "Shreyasha Mishra",
    "email": "shreyasha.mishra@student.edu",
    "roll_number": "202556180"
  },
  {
    "id": 5,
    "name": "Sreeyanshu Dash",
    "email": "sreeyanshu.dash@student.edu",
    "roll_number": "202556183"
  },
  {
    "id": 6,
    "name": "Hansika Kotni",
    "email": "hansika.kotni@student.edu",
    "roll_number": "202557184"
  },
  {
    "id": 7,
    "name": "Subhankar Padhy",
    "email": "subhankar.padhy@student.edu",
    "roll_number": "202556187"
  },
  {
    "id": 8,
    "name": "Siddharth Sahoo",
    "email": "siddharth.sahoo@student.edu",
    "roll_number": "202556189"
  },
  {
    "id": 9,
    "name": "Prince Kumar",
    "email": "prince.kumar@student.edu",
    "roll_number": "202556190"
  },
  {
    "id": 10,
    "name": "Om Kumar Nayak",
    "email": "om.kumar.nayak@student.edu",
    "roll_number": "202556191"
  },
  {
    "id": 11,
    "name": "Manisha Panigrahi",
    "email": "manisha.panigrahi@student.edu",
    "roll_number": "202557193"
  },
  {
    "id": 12,
    "name": "Suvam Sahoo",
    "email": "suvam.sahoo@student.edu",
    "roll_number": "202556194"
  },
  {
    "id": 13,
    "name": "Sparsh Chauhan",
    "email": "sparsh.chauhan@student.edu",
    "roll_number": "202556195"
  },
  {
    "id": 14,
    "name": "Nandhika Jyothi Swaroop Reddy",
    "email": "nandhika.jyothi.swaroop.reddy@student.edu",
    "roll_number": "202556203"
  },
  {
    "id": 15,
    "name": "Hari Shankar Sahu",
    "email": "hari.shankar.sahu@student.edu",
    "roll_number": "202556206"
  },
  {
    "id": 16,
    "name": "K Harish Kumar",
    "email": "k.harish.kumar@student.edu",
    "roll_number": "202556207"
  },
  {
    "id": 17,
    "name": "Diptee Ranjan Nahak",
    "email": "diptee.ranjan.nahak@student.edu",
    "roll_number": "202556209"
  },
  {
    "id": 18,
    "name": "Ashirbad Panda",
    "email": "ashirbad.panda@student.edu",
    "roll_number": "202556211"
  },
  {
    "id": 19,
    "name": "Shaharsh",
    "email": "shaharsh@student.edu",
    "roll_number": "202556214"
  },
  {
    "id": 20,
    "name": "Smrutisudha Sahu",
    "email": "smrutisudha.sahu@student.edu",
    "roll_number": "202557215"
  },
  {
    "id": 21,
    "name": "Aryan Kumar Sahu",
    "email": "aryan.kumar.sahu@student.edu",
    "roll_number": "202556219"
  },
  {
    "id": 22,
    "name": "Sonam Patro",
    "email": "sonam.patro@student.edu",
    "roll_number": "202557223"
  },
  {
    "id": 23,
    "name": "B. Sridhar Achary",
    "email": "b.sridhar.achary@student.edu",
    "roll_number": "202556225"
  },
  {
    "id": 24,
    "name": "A Rajasekhar Patra",
    "email": "a.rajasekhar.patra@student.edu",
    "roll_number": "202556227"
  },
  {
    "id": 25,
    "name": "Prathamesh Purohit",
    "email": "prathamesh.purohit@student.edu",
    "roll_number": "202556231"
  },
  {
    "id": 26,
    "name": "Pranab Gouda",
    "email": "pranab.gouda@student.edu",
    "roll_number": "202556235"
  },
  {
    "id": 27,
    "name": "Rudra Prasad Panigrahi",
    "email": "rudra.prasad.panigrahi@student.edu",
    "roll_number": "202556236"
  },
  {
    "id": 28,
    "name": "Ayush Mahapatra",
    "email": "ayush.mahapatra@student.edu",
    "roll_number": "202556241"
  },
  {
    "id": 29,
    "name": "Pratyus Nayak",
    "email": "pratyus.nayak@student.edu",
    "roll_number": "202556243"
  },
  {
    "id": 30,
    "name": "Chokkala Yaswanth",
    "email": "chokkala.yaswanth@student.edu",
    "roll_number": "202556247"
  },
  {
    "id": 31,
    "name": "Omkar Swain",
    "email": "omkar.swain@student.edu",
    "roll_number": "202556248"
  },
  {
    "id": 32,
    "name": "Yuvraj Azad",
    "email": "yuvraj.azad@student.edu",
    "roll_number": "202556249"
  },
  {
    "id": 33,
    "name": "Priyansha Pradhan",
    "email": "priyansha.pradhan@student.edu",
    "roll_number": "202557250"
  },
  {
    "id": 34,
    "name": "Asutosh Mishra",
    "email": "asutosh.mishra@student.edu",
    "roll_number": "202556259"
  },
  {
    "id": 35,
    "name": "Rudra Prasad Sahu",
    "email": "rudra.prasad.sahu@student.edu",
    "roll_number": "202556260"
  },
  {
    "id": 36,
    "name": "Kunal Panda",
    "email": "kunal.panda@student.edu",
    "roll_number": "202556261"
  },
  {
    "id": 37,
    "name": "Samir Kumar Pradhan",
    "email": "samir.kumar.pradhan@student.edu",
    "roll_number": "202556263"
  },
  {
    "id": 38,
    "name": "J Kartik Achary",
    "email": "j.kartik.achary@student.edu",
    "roll_number": "202556265"
  },
  {
    "id": 39,
    "name": "Soumyaranjan Susant Mohapatra",
    "email": "soumyaranjan.susant.mohapatra@student.edu",
    "roll_number": "202556267"
  },
  {
    "id": 40,
    "name": "G Charan Kumar",
    "email": "g.charan.kumar@student.edu",
    "roll_number": "202556271"
  },
  {
    "id": 41,
    "name": "Akash Panigrahy",
    "email": "akash.panigrahy@student.edu",
    "roll_number": "202556272"
  },
  {
    "id": 42,
    "name": "Subasish Rauta",
    "email": "subasish.rauta@student.edu",
    "roll_number": "202556275"
  },
  {
    "id": 43,
    "name": "Achintya Prasad Mishra",
    "email": "achintya.prasad.mishra@student.edu",
    "roll_number": "202556276"
  },
  {
    "id": 44,
    "name": "Neyyila Puspak",
    "email": "neyyila.puspak@student.edu",
    "roll_number": "202556278"
  },
  {
    "id": 45,
    "name": "Bijan Kumar Pattanayak",
    "email": "bijan.kumar.pattanayak@student.edu",
    "roll_number": "202556282"
  },
  {
    "id": 46,
    "name": "Bishnu Kumar Sahu",
    "email": "bishnu.kumar.sahu@student.edu",
    "roll_number": "202556284"
  },
  {
    "id": 47,
    "name": "Madhusmita Panigrahy",
    "email": "madhusmita.panigrahy@student.edu",
    "roll_number": "202557285"
  },
  {
    "id": 48,
    "name": "Ullasi Abhinash Reddy",
    "email": "ullasi.abhinash.reddy@student.edu",
    "roll_number": "202556286"
  },
  {
    "id": 49,
    "name": "Swadhina Sahu",
    "email": "swadhina.sahu@student.edu",
    "roll_number": "202556288"
  },
  {
    "id": 50,
    "name": "Shahid Hussain",
    "email": "shahid.hussain@student.edu",
    "roll_number": "202556289"
  },
  {
    "id": 51,
    "name": "M Mathur Kesav",
    "email": "m.mathur.kesav@student.edu",
    "roll_number": "202556290"
  },
  {
    "id": 52,
    "name": "Rudra Prasad Parida",
    "email": "rudra.prasad.parida@student.edu",
    "roll_number": "202556292"
  },
  {
    "id": 53,
    "name": "Asutosh Mahapatra",
    "email": "asutosh.mahapatra@student.edu",
    "roll_number": "202556293"
  },
  {
    "id": 54,
    "name": "Souransita Padhy",
    "email": "souransita.padhy@student.edu",
    "roll_number": "202557294"
  },
  {
    "id": 55,
    "name": "Dipten Sharma",
    "email": "dipten.sharma@student.edu",
    "roll_number": "202556295"
  },
  {
    "id": 56,
    "name": "S Nitesh Kumar",
    "email": "s.nitesh.kumar@student.edu",
    "roll_number": "202556296"
  },
  {
    "id": 57,
    "name": "Deepak Kumar Nayak",
    "email": "deepak.kumar.nayak@student.edu",
    "roll_number": "202556297"
  },
  {
    "id": 58,
    "name": "Ganeswar Bisoyi",
    "email": "ganeswar.bisoyi@student.edu",
    "roll_number": "202556298"
  },
  {
    "id": 59,
    "name": "Subham Kumar Gouda",
    "email": "subham.kumar.gouda@student.edu",
    "roll_number": "202556301"
  },
  {
    "id": 60,
    "name": "Sickon Behera",
    "email": "sickon.behera@student.edu",
    "roll_number": "202556304"
  },
  {
    "id": 61,
    "name": "Ayushman Swain",
    "email": "ayushman.swain@student.edu",
    "roll_number": "202556307"
  },
  {
    "id": 62,
    "name": "Arpita Padhy",
    "email": "arpita.padhy@student.edu",
    "roll_number": "202557313"
  },
  {
    "id": 63,
    "name": "Debasis Nahak",
    "email": "debasis.nahak@student.edu",
    "roll_number": "202556316"
  },
  {
    "id": 64,
    "name": "N Tetendra Reddy",
    "email": "n.tetendra.reddy@student.edu",
    "roll_number": "202556319"
  },
  {
    "id": 65,
    "name": "K Madhu Mohan Rao",
    "email": "k.madhu.mohan.rao@student.edu",
    "roll_number": "202556320"
  }
];

let registrations = [
  {
    "event_id": 1,
    "participant_id": 1,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 2,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 3,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 4,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 5,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 6,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 7,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 8,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 9,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 10,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 11,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 12,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 13,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 14,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 15,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 16,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 17,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 18,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 19,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 20,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 21,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 22,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 23,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 24,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 25,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 26,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 27,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 28,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 29,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 30,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 31,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 32,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 33,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 34,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 35,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 36,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 37,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 38,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 39,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 40,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 41,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 42,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 43,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 44,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 45,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 46,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 47,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 48,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 49,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 50,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 51,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 52,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 53,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 54,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 55,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 56,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 57,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 58,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 59,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 60,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 61,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 62,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 63,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 64,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 1,
    "participant_id": 65,
    "registration_date": "2026-10-18"
  },
  {
    "event_id": 2,
    "participant_id": 1,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 2,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 3,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 4,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 5,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 6,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 7,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 8,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 9,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 10,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 11,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 12,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 13,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 14,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 15,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 16,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 17,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 18,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 19,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 20,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 21,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 22,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 23,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 24,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 2,
    "participant_id": 25,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 21,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 22,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 23,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 24,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 25,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 26,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 27,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 28,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 29,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 30,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 31,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 32,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 33,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 34,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 35,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 36,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 37,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 38,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 39,
    "registration_date": "2026-10-17"
  },
  {
    "event_id": 3,
    "participant_id": 40,
    "registration_date": "2026-10-17"
  }
];

let attendance = [
  {
    "event_id": 1,
    "participant_id": 1,
    "check_in_time": "2026-10-19 03:30:00"
  },
  {
    "event_id": 1,
    "participant_id": 2,
    "check_in_time": "2026-10-19 04:37:00"
  },
  {
    "event_id": 1,
    "participant_id": 3,
    "check_in_time": "2026-10-19 05:44:00"
  },
  {
    "event_id": 1,
    "participant_id": 4,
    "check_in_time": "2026-10-19 06:51:00"
  },
  {
    "event_id": 1,
    "participant_id": 5,
    "check_in_time": "2026-10-19 07:58:00"
  },
  {
    "event_id": 1,
    "participant_id": 6,
    "check_in_time": "2026-10-19 09:05:00"
  },
  {
    "event_id": 1,
    "participant_id": 7,
    "check_in_time": "2026-10-19 04:12:00"
  },
  {
    "event_id": 1,
    "participant_id": 8,
    "check_in_time": "2026-10-19 05:19:00"
  },
  {
    "event_id": 1,
    "participant_id": 9,
    "check_in_time": "2026-10-19 06:26:00"
  },
  {
    "event_id": 1,
    "participant_id": 10,
    "check_in_time": "2026-10-19 06:33:00"
  },
  {
    "event_id": 1,
    "participant_id": 11,
    "check_in_time": "2026-10-19 07:40:00"
  },
  {
    "event_id": 1,
    "participant_id": 12,
    "check_in_time": "2026-10-19 08:47:00"
  },
  {
    "event_id": 1,
    "participant_id": 13,
    "check_in_time": "2026-10-19 03:54:00"
  },
  {
    "event_id": 1,
    "participant_id": 14,
    "check_in_time": "2026-10-19 05:01:00"
  },
  {
    "event_id": 1,
    "participant_id": 15,
    "check_in_time": "2026-10-19 06:08:00"
  },
  {
    "event_id": 1,
    "participant_id": 16,
    "check_in_time": "2026-10-19 07:15:00"
  },
  {
    "event_id": 1,
    "participant_id": 17,
    "check_in_time": "2026-10-19 08:22:00"
  },
  {
    "event_id": 1,
    "participant_id": 18,
    "check_in_time": "2026-10-19 09:29:00"
  },
  {
    "event_id": 1,
    "participant_id": 19,
    "check_in_time": "2026-10-19 03:36:00"
  },
  {
    "event_id": 1,
    "participant_id": 20,
    "check_in_time": "2026-10-19 04:43:00"
  },
  {
    "event_id": 1,
    "participant_id": 21,
    "check_in_time": "2026-10-19 05:50:00"
  },
  {
    "event_id": 1,
    "participant_id": 22,
    "check_in_time": "2026-10-19 06:57:00"
  },
  {
    "event_id": 1,
    "participant_id": 23,
    "check_in_time": "2026-10-19 08:04:00"
  },
  {
    "event_id": 1,
    "participant_id": 24,
    "check_in_time": "2026-10-19 09:11:00"
  },
  {
    "event_id": 1,
    "participant_id": 25,
    "check_in_time": "2026-10-19 04:18:00"
  },
  {
    "event_id": 1,
    "participant_id": 26,
    "check_in_time": "2026-10-19 05:25:00"
  },
  {
    "event_id": 1,
    "participant_id": 27,
    "check_in_time": "2026-10-19 05:32:00"
  },
  {
    "event_id": 1,
    "participant_id": 28,
    "check_in_time": "2026-10-19 06:39:00"
  },
  {
    "event_id": 1,
    "participant_id": 29,
    "check_in_time": "2026-10-19 07:46:00"
  },
  {
    "event_id": 1,
    "participant_id": 30,
    "check_in_time": "2026-10-19 08:53:00"
  },
  {
    "event_id": 1,
    "participant_id": 31,
    "check_in_time": "2026-10-19 04:00:00"
  },
  {
    "event_id": 1,
    "participant_id": 32,
    "check_in_time": "2026-10-19 05:07:00"
  },
  {
    "event_id": 1,
    "participant_id": 33,
    "check_in_time": "2026-10-19 06:14:00"
  },
  {
    "event_id": 1,
    "participant_id": 34,
    "check_in_time": "2026-10-19 07:21:00"
  },
  {
    "event_id": 1,
    "participant_id": 35,
    "check_in_time": "2026-10-19 08:28:00"
  },
  {
    "event_id": 1,
    "participant_id": 36,
    "check_in_time": "2026-10-19 08:35:00"
  },
  {
    "event_id": 1,
    "participant_id": 37,
    "check_in_time": "2026-10-19 03:42:00"
  },
  {
    "event_id": 1,
    "participant_id": 38,
    "check_in_time": "2026-10-19 04:49:00"
  },
  {
    "event_id": 1,
    "participant_id": 39,
    "check_in_time": "2026-10-19 05:56:00"
  },
  {
    "event_id": 1,
    "participant_id": 40,
    "check_in_time": "2026-10-19 07:03:00"
  },
  {
    "event_id": 1,
    "participant_id": 41,
    "check_in_time": "2026-10-19 08:10:00"
  },
  {
    "event_id": 1,
    "participant_id": 42,
    "check_in_time": "2026-10-19 09:17:00"
  },
  {
    "event_id": 2,
    "participant_id": 1,
    "check_in_time": "2026-10-18 12:30:00"
  },
  {
    "event_id": 2,
    "participant_id": 2,
    "check_in_time": "2026-10-18 12:33:00"
  },
  {
    "event_id": 2,
    "participant_id": 3,
    "check_in_time": "2026-10-18 12:36:00"
  },
  {
    "event_id": 2,
    "participant_id": 4,
    "check_in_time": "2026-10-18 12:39:00"
  },
  {
    "event_id": 2,
    "participant_id": 5,
    "check_in_time": "2026-10-18 12:42:00"
  },
  {
    "event_id": 2,
    "participant_id": 6,
    "check_in_time": "2026-10-18 12:45:00"
  },
  {
    "event_id": 2,
    "participant_id": 7,
    "check_in_time": "2026-10-18 12:48:00"
  },
  {
    "event_id": 2,
    "participant_id": 8,
    "check_in_time": "2026-10-18 12:51:00"
  },
  {
    "event_id": 2,
    "participant_id": 9,
    "check_in_time": "2026-10-18 12:54:00"
  },
  {
    "event_id": 2,
    "participant_id": 10,
    "check_in_time": "2026-10-18 12:57:00"
  },
  {
    "event_id": 2,
    "participant_id": 11,
    "check_in_time": "2026-10-18 13:00:00"
  },
  {
    "event_id": 2,
    "participant_id": 12,
    "check_in_time": "2026-10-18 13:03:00"
  },
  {
    "event_id": 2,
    "participant_id": 13,
    "check_in_time": "2026-10-18 13:06:00"
  },
  {
    "event_id": 2,
    "participant_id": 14,
    "check_in_time": "2026-10-18 13:09:00"
  },
  {
    "event_id": 2,
    "participant_id": 15,
    "check_in_time": "2026-10-18 13:12:00"
  },
  {
    "event_id": 2,
    "participant_id": 16,
    "check_in_time": "2026-10-18 13:15:00"
  }
];

let sponsors = [
  { id: 1, event_id: 1, sponsor_name: 'TCS', amount_contributed: 25000 },
  { id: 2, event_id: 1, sponsor_name: 'Infosys', amount_contributed: 15000 },
  { id: 3, event_id: 2, sponsor_name: 'Coca-Cola', amount_contributed: 10000 },
  { id: 4, event_id: 2, sponsor_name: 'Red Bull', amount_contributed: 8000 },
  { id: 5, event_id: 3, sponsor_name: 'Google', amount_contributed: 50000 },
];

let expenses = [
  { id: 1, event_id: 1, budget_head: 'Marketing', amount: 8000, description: 'Social media ads and posters' },
  { id: 2, event_id: 1, budget_head: 'Food', amount: 12000, description: 'Catering for 200 attendees' },
  { id: 3, event_id: 1, budget_head: 'Logistics', amount: 5000, description: 'Stage setup and sound system' },
  { id: 4, event_id: 1, budget_head: 'Prizes', amount: 15000, description: 'Winner and runner-up prizes' },
  { id: 5, event_id: 2, budget_head: 'Food', amount: 8000, description: 'Snacks and beverages' },
  { id: 6, event_id: 2, budget_head: 'Decoration', amount: 6000, description: 'Stage decoration and lights' },
  { id: 7, event_id: 2, budget_head: 'Marketing', amount: 3000, description: 'Event banners and flyers' },
  { id: 8, event_id: 3, budget_head: 'Food', amount: 10000, description: 'Meals for 48-hour hackathon' },
  { id: 9, event_id: 3, budget_head: 'Logistics', amount: 7000, description: 'Wi-Fi setup and power strips' },
];

let cachedReports = {
  attendance: null,
  financial: null,
  expensesByCategory: null,
};

// Helper: sync cache from PostgreSQL backend
async function syncFromBackend() {
  try {
    const [statusRes, dataRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/all-data'),
    ]);

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      connectionStatus = { ...connectionStatus, ...statusData, connected: true, error: null };
    }

    if (dataRes.ok) {
      const data = await dataRes.json();
      venues = data.venues || venues;
      events = data.events || events;
      organizers = data.organizers || organizers;
      participants = data.participants || participants;
      registrations = data.registrations || registrations;
      attendance = data.attendance || attendance;
      sponsors = data.sponsors || sponsors;
      expenses = data.expenses || expenses;
      if (data.reports) {
        cachedReports = data.reports;
      }
    }
  } catch (err) {
    console.warn('[PostgreSQL Sync Warning] Using local cache:', err.message);
    connectionStatus.connected = false;
    connectionStatus.error = err.message;
  }
}

// Auto-initialize connection on module load
syncFromBackend();

const db = {
  // Connection info
  getConnectionStatus: () => ({ ...connectionStatus }),
  syncFromBackend,

  // Raw SQL execution via PostgreSQL
  executeSql: async (sql) => {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'SQL Query failed');
    }
    // Re-sync after query in case of INSERT/UPDATE/DELETE
    if (sql.trim().toUpperCase().match(/^(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/)) {
      await syncFromBackend();
    }
    return data;
  },

  resetDatabase: async () => {
    const res = await fetch('/api/reset-db', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset database');
    await syncFromBackend();
    return data;
  },

  // ---- VENUES ----
  getVenues: () => [...venues],
  addVenue: (venue) => {
    const newVenue = { ...venue, id: nextId.venues++ };
    venues.push(newVenue);
    return newVenue;
  },

  // ---- EVENTS ----
  getEvents: () => [...events],
  getEventById: (id) => events.find(e => e.id === id) || null,
  addEvent: async (event) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add event');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        // Fallback local logic
        if (!venues.find(v => v.id === event.venue_id)) {
          throw new Error(`FK Constraint Violation: venue_id ${event.venue_id} does not exist in Venues table.`);
        }
        const newEvent = { ...event, id: nextId.events++ };
        events.push(newEvent);
        return newEvent;
      }
      throw err;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const idx = events.findIndex(e => e.id === id);
        if (idx === -1) throw new Error(`Event with id ${id} not found.`);
        events[idx] = { ...events[idx], ...updates };
        return events[idx];
      }
      throw err;
    }
  },

  deleteEvent: async (id) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        registrations = registrations.filter(r => r.event_id !== id);
        attendance = attendance.filter(a => a.event_id !== id);
        sponsors = sponsors.filter(s => s.event_id !== id);
        expenses = expenses.filter(e => e.event_id !== id);
        events = events.filter(e => e.id !== id);
        return;
      }
      throw err;
    }
  },

  // ---- ORGANIZERS ----
  getOrganizers: () => [...organizers],
  addOrganizer: async (org) => {
    try {
      const res = await fetch('/api/organizers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(org),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add organizer');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const newOrg = { ...org, id: nextId.organizers++ };
        organizers.push(newOrg);
        return newOrg;
      }
      throw err;
    }
  },

  // ---- PARTICIPANTS ----
  getParticipants: () => [...participants],
  findParticipantByRoll: (roll) => participants.find(p => p.roll_number.toUpperCase() === roll.trim().toUpperCase()) || null,
  addParticipant: async (participant) => {
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add participant');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (participants.find(p => p.roll_number === participant.roll_number)) {
          throw new Error(`UNIQUE Constraint Violation: roll_number '${participant.roll_number}' already exists in Participants table.`);
        }
        const newP = { ...participant, id: nextId.participants++ };
        participants.push(newP);
        return newP;
      }
      throw err;
    }
  },

  // ---- REGISTRATIONS (Composite PK) ----
  getRegistrations: () => [...registrations],
  getRegistrationsByEvent: (eventId) => registrations.filter(r => r.event_id === eventId),
  registerParticipant: async (eventId, participantId) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, participant_id: participantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register participant');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (!events.find(e => e.id === eventId)) {
          throw new Error(`FK Constraint Violation: event_id ${eventId} does not exist in Events table.`);
        }
        if (!participants.find(p => p.id === participantId)) {
          throw new Error(`FK Constraint Violation: participant_id ${participantId} does not exist in Participants table.`);
        }
        if (registrations.find(r => r.event_id === eventId && r.participant_id === participantId)) {
          throw new Error(`Composite PK Violation: Participant ${participantId} is already registered for Event ${eventId}. Duplicate registrations are not allowed.`);
        }
        const event = events.find(e => e.id === eventId);
        const venue = venues.find(v => v.id === event.venue_id);
        const currentRegs = registrations.filter(r => r.event_id === eventId).length;
        if (currentRegs >= venue.capacity) {
          throw new Error(`Capacity Exceeded: Venue '${venue.name}' is full (${venue.capacity}/${venue.capacity}).`);
        }
        const reg = {
          event_id: eventId,
          participant_id: participantId,
          registration_date: new Date().toISOString().split('T')[0],
        };
        registrations.push(reg);
        return reg;
      }
      throw err;
    }
  },

  // ---- ATTENDANCE ----
  getAttendance: () => [...attendance],
  getAttendanceByEvent: (eventId) => attendance.filter(a => a.event_id === eventId),
  checkIn: async (eventId, participantId) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, participant_id: participantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check in');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (!registrations.find(r => r.event_id === eventId && r.participant_id === participantId)) {
          throw new Error(`Constraint Violation: Participant ${participantId} is not registered for Event ${eventId}.`);
        }
        if (attendance.find(a => a.event_id === eventId && a.participant_id === participantId)) {
          throw new Error(`Duplicate Check-In: Participant already checked in for this event.`);
        }
        const record = {
          event_id: eventId,
          participant_id: participantId,
          check_in_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        attendance.push(record);
        return record;
      }
      throw err;
    }
  },

  removeCheckIn: async (eventId, participantId) => {
    try {
      const res = await fetch(`/api/attendance/${eventId}/${participantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove check-in');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        attendance = attendance.filter(
          a => !(a.event_id === eventId && a.participant_id === participantId)
        );
        return;
      }
      throw err;
    }
  },

  // ---- SPONSORS ----
  getSponsors: () => [...sponsors],
  getSponsorsByEvent: (eventId) => sponsors.filter(s => s.event_id === eventId),
  addSponsor: async (sponsor) => {
    try {
      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsor),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add sponsor');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (!events.find(e => e.id === sponsor.event_id)) {
          throw new Error(`FK Constraint Violation: event_id ${sponsor.event_id} does not exist in Events table.`);
        }
        const newS = { ...sponsor, id: nextId.sponsors++ };
        sponsors.push(newS);
        return newS;
      }
      throw err;
    }
  },

  // ---- EXPENSES ----
  getExpenses: () => [...expenses],
  getExpensesByEvent: (eventId) => expenses.filter(e => e.event_id === eventId),
  addExpense: async (expense) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add expense');
      await syncFromBackend();
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (!events.find(e => e.id === expense.event_id)) {
          throw new Error(`FK Constraint Violation: event_id ${expense.event_id} does not exist in Events table.`);
        }
        const newE = { ...expense, id: nextId.expenses++ };
        expenses.push(newE);
        return newE;
      }
      throw err;
    }
  },

  // ============================================================
  // SQL AGGREGATE VIEWS & QUERIES (Reports)
  // ============================================================
  getAttendanceReport: () => {
    if (cachedReports?.attendance && cachedReports.attendance.length > 0) {
      return cachedReports.attendance;
    }
    return events.map(e => {
      const venue = venues.find(v => v.id === e.venue_id);
      const totalRegs = registrations.filter(r => r.event_id === e.id).length;
      const totalAtt = attendance.filter(a => a.event_id === e.id).length;
      const attendancePct = totalRegs > 0 ? Math.round((totalAtt / totalRegs) * 1000) / 10 : 0;
      const venuePct = venue ? Math.round((totalRegs / venue.capacity) * 1000) / 10 : 0;
      return {
        event_name: e.name,
        event_date: e.date,
        venue_name: venue ? venue.name : 'N/A',
        venue_capacity: venue ? venue.capacity : 0,
        total_registrations: totalRegs,
        total_attendance: totalAtt,
        attendance_pct: attendancePct,
        venue_fill_pct: venuePct,
      };
    });
  },

  getFinancialSummary: () => {
    if (cachedReports?.financial && cachedReports.financial.length > 0) {
      return cachedReports.financial;
    }
    return events.map(e => {
      const totalSponsorship = sponsors
        .filter(s => s.event_id === e.id)
        .reduce((sum, s) => sum + s.amount_contributed, 0);
      const totalExpenses = expenses
        .filter(ex => ex.event_id === e.id)
        .reduce((sum, ex) => sum + ex.amount, 0);
      const totalBudget = e.base_budget + totalSponsorship;
      return {
        event_name: e.name,
        base_budget: e.base_budget,
        total_sponsorship: totalSponsorship,
        total_budget: totalBudget,
        total_expenses: totalExpenses,
        remaining_budget: totalBudget - totalExpenses,
      };
    });
  },

  getExpenseByCategory: () => {
    if (cachedReports?.expensesByCategory && cachedReports.expensesByCategory.length > 0) {
      return cachedReports.expensesByCategory;
    }
    const categories = {};
    expenses.forEach(e => {
      if (!categories[e.budget_head]) {
        categories[e.budget_head] = 0;
      }
      categories[e.budget_head] += e.amount;
    });
    return Object.entries(categories)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  },

  getDashboardStats: () => {
    const totalEvents = events.length;
    const uniqueParticipants = new Set(registrations.map(r => r.participant_id)).size;
    const totalSponsorship = sponsors.reduce((sum, s) => sum + s.amount_contributed, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { totalEvents, uniqueParticipants, totalSponsorship, totalExpenses };
  },

  getEventsWithVenue: () => {
    return events.map(e => {
      const venue = venues.find(v => v.id === e.venue_id);
      return {
        ...e,
        venue_name: venue ? venue.name : 'N/A',
        venue_capacity: venue ? venue.capacity : 0,
      };
    });
  },

  getRegisteredParticipantsForEvent: (eventId) => {
    return registrations
      .filter(r => r.event_id === eventId)
      .map(r => {
        const p = participants.find(pp => pp.id === r.participant_id);
        const att = attendance.find(a => a.event_id === eventId && a.participant_id === r.participant_id);
        return {
          ...r,
          participant_name: p ? p.name : 'Unknown',
          participant_email: p ? p.email : '',
          roll_number: p ? p.roll_number : '',
          checked_in: !!att,
          check_in_time: att ? att.check_in_time : null,
        };
      });
  },
};

export default db;
