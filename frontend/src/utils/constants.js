/**
 * MahaSetu System Constants
 */

export const DEMO_IDENTITIES = [
  {
    globalId: 'MAHA-TEST-102',
    name: 'Rajesh Sharma',
    mobile: '+91 98765 43210',
    email: 'rajesh.sharma@example.gov.in',
    state: 'Maharashtra',
  },
  {
    globalId: 'MAHA-TEST-103',
    name: 'Priya Deshmukh',
    mobile: '+91 98111 22334',
    email: 'priya.d@example.gov.in',
    state: 'Maharashtra',
  },
  {
    globalId: 'MAHA-TEST-104',
    name: 'Anil Patil',
    mobile: '+91 99222 55667',
    email: 'anil.patil@example.gov.in',
    state: 'Maharashtra',
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
