const canonicalEntities = [
  {
    entity: "PERSON_NAME",

    description:
      "Name of the applicant, student, beneficiary, citizen or person",

    aliases: [
      "applicant name",
      "student name",
      "beneficiary name",
      "candidate name",
      "citizen name",
      "person name",
      "full name"
    ]
  },

  {
    entity: "DATE_OF_BIRTH",

    description:
      "Date on which the applicant or person was born",

    aliases: [
      "date of birth",
      "birth date",
      "dob",
      "birthdate",
      "date born"
    ]
  },

  {
    entity: "INCOME",

    description:
      "Annual family income, household income, yearly income or total family earnings",

    aliases: [
      "family income",
      "annual income",
      "yearly income",
      "annual family income",
      "yearly family income",
      "household income",
      "family earnings",
      "yearly household earnings"
    ]
  },

  {
    entity: "ADDRESS",

    description:
      "Residential, permanent or current address of the applicant",

    aliases: [
      "permanent address",
      "residential address",
      "home address",
      "current address",
      "residence address",
      "permanent residential address"
    ]
  },

  {
    entity: "MOBILE_NUMBER",

    description:
      "Mobile phone number or contact telephone number of the applicant",

    aliases: [
      "mobile number",
      "mobile no",
      "phone number",
      "contact number",
      "telephone number"
    ]
  },

  {
    entity: "EMAIL",

    description:
      "Email address of the applicant or citizen",

    aliases: [
      "email",
      "email address",
      "e-mail",
      "mail id"
    ]
  },

  {
    entity: "GENDER",

    description:
      "Gender or sex of the applicant",

    aliases: [
      "gender",
      "sex",
      "applicant gender",
      "candidate gender"
    ]
  },

  {
    entity: "CASTE_CERTIFICATE",

    description:
      "Caste certificate number or caste certification information",

    aliases: [
      "caste certificate",
      "caste certificate number",
      "caste certificate no",
      "social category certificate"
    ]
  },

  {
    entity: "EDUCATION_QUALIFICATION",

    description:
      "Educational qualification, academic qualification or highest qualification of the applicant",

    aliases: [
      "educational qualification",
      "academic qualification",
      "highest qualification",
      "education qualification",
      "qualification"
    ]
  },

  {
    entity: "MARKS",

    description:
      "Academic marks, percentage, score or examination result",

    aliases: [
      "marks",
      "academic marks",
      "percentage",
      "exam marks",
      "score",
      "academic score",
      "marks obtained"
    ]
  }
];
module.exports = { canonicalEntities };