/**
 * MahaSetu System Constants
 */

export const DEMO_IDENTITIES = [
  {
    globalId: 'GLOBAL-MMVY-00010001',
    name: 'Smt. Ananya Deshmukh',
    sub: 'demo-citizen-001',
    legacyId: 'MMVY-00010001',
    mobile: '+91 98201 12345',
    email: 'ananya.deshmukh@example.gov.in',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Flat 402, Shivneri Residency, Shivaji Nagar, Pune - 411005',
  },
  {
    globalId: 'GLOBAL-MMVY-00010002',
    name: 'Shri Rahul Patil',
    sub: 'demo-citizen-002',
    legacyId: 'MMVY-00010002',
    mobile: '+91 98201 98765',
    email: 'rahul.patil@example.gov.in',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Plot 12, Sahyadri Colony, Samarth Nagar, Nashik - 422005',
  },
  {
    globalId: 'GLOBAL-MMVY-00010003',
    name: 'Kum. Sunita Jadhav',
    sub: 'demo-citizen-003',
    legacyId: 'MMVY-00010003',
    mobile: '+91 98201 55443',
    email: 'sunita.jadhav@example.gov.in',
    district: 'Nagpur',
    state: 'Maharashtra',
    address: 'B-14, Anand Vihar, Wardha Road, Nagpur - 440015',
  },
];

export const CANONICAL_ENTITIES = [
  { key: 'PERSON_NAME', label: 'Full Name', description: 'Citizen full or given name' },
  { key: 'DATE_OF_BIRTH', label: 'Date of Birth', description: 'Birth date record' },
  { key: 'INCOME', label: 'Annual Income', description: 'Annual or household income record' },
  { key: 'ADDRESS', label: 'Permanent Address', description: 'Residential or domicile address' },
  { key: 'MOBILE_NUMBER', label: 'Mobile Number', description: 'Verified phone number' },
  { key: 'EMAIL', label: 'Email Address', description: 'Citizen email contact' },
  { key: 'GENDER', label: 'Gender', description: 'Gender identity' },
  { key: 'CASTE_CERTIFICATE', label: 'Caste Certificate', description: 'Caste verification document identifier' },
  { key: 'EDUCATION_QUALIFICATION', label: 'Educational Qualification', description: 'Degree or qualification level' },
  { key: 'MARKS', label: 'Academic Marks/Percentage', description: 'Score or percentage record' },
];

export const PRESET_FORM_TEMPLATES = [
  {
    name: 'State Merit Scholarship Application',
    department: 'Scholarship_Portal',
    fields: [
      { label: 'Annual Family Income' },
      { label: 'Permanent Address' },
      { label: 'Date of Birth' },
      { label: 'Mobile Number' },
      { label: 'Applicant Full Name' },
      { label: '12th Grade Marks Percentage' },
    ],
  },
  {
    name: 'Caste & Social Welfare Verification',
    department: 'Revenue_Department',
    fields: [
      { label: 'Father Full Name' },
      { label: 'Caste Certificate Number' },
      { label: 'Residential Address' },
      { label: 'Gender' },
      { label: 'Mobile Number' },
    ],
  },
  {
    name: 'Civic Utility Connection Form',
    department: 'Municipal_Corporation',
    fields: [
      { label: 'Property Owner Name' },
      { label: 'Premises Address' },
      { label: 'Contact Phone Number' },
      { label: 'Annual Household Income' },
    ],
  },
];
