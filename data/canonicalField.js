export const canonicalFields = [
  {
    canonical: "PERSON_NAME",
    description: "Name of the applicant, student, beneficiary, citizen or person",
    aliases: [
      "student name",
      "applicant name",
      "beneficiary name",
      "candidate name",
      "citizen name",
      "person name"
    ],
    department: "IDENTITY"
  },

  {
    canonical: "DATE_OF_BIRTH",
    description: "Date on which the applicant or person was born",
    aliases: [
      "date of birth",
      "birth date",
      "dob",
      "born on",
      "birthdate"
    ],
    department: "IDENTITY"
  },

  {
    canonical: "INCOME",
    description: "Annual family income, household income, yearly income or total earnings of the family",
    aliases: [
      "family income",
      "annual income",
      "yearly income",
      "annual family income",
      "household income",
      "family earnings",
      "yearly family earnings"
    ],
    department: "REVENUE"
  },

  {
    canonical: "ADDRESS",
    description: "Residential, permanent or current address of the applicant",
    aliases: [
      "permanent address",
      "residential address",
      "home address",
      "current address",
      "residence address",
      "permanent residential address"
    ],
    department: "REVENUE"
  },

  {
    canonical: "MOBILE_NUMBER",
    description: "Mobile phone number or telephone number of the applicant",
    aliases: [
      "mobile number",
      "phone number",
      "contact number",
      "telephone number",
      "mobile no"
    ],
    department: "IDENTITY"
  },

  {
    canonical: "EMAIL",
    description: "Email address of the applicant or citizen",
    aliases: [
      "email",
      "email address",
      "e-mail",
      "electronic mail"
    ],
    department: "IDENTITY"
  },

  {
    canonical: "GENDER",
    description: "Gender or sex of the applicant",
    aliases: [
      "gender",
      "sex",
      "applicant gender",
      "candidate gender"
    ],
    department: "IDENTITY"
  },

  {
    canonical: "CASTE_CERTIFICATE",
    description: "Caste certificate number or caste certification information",
    aliases: [
      "caste certificate",
      "caste certificate number",
      "caste certificate no",
      "social category certificate"
    ],
    department: "SOCIAL_JUSTICE"
  }
];