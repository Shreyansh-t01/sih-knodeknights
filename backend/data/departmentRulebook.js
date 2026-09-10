const departmentRulebook = {

  PERSON_NAME: {
    department: "IDENTITY",
    apiKey: "IDENTITY_PERSON_API"
  },

  DATE_OF_BIRTH: {
    department: "IDENTITY",
    apiKey: "IDENTITY_DOB_API"
  },

  INCOME: {
    department: "REVENUE",
    apiKey: "REVENUE_INCOME_API"
  },

  ADDRESS: {
    department: "REVENUE",
    apiKey: "REVENUE_ADDRESS_API"
  },

  MOBILE_NUMBER: {
    department: "IDENTITY",
    apiKey: "IDENTITY_MOBILE_API"
  },

  EMAIL: {
    department: "IDENTITY",
    apiKey: "IDENTITY_EMAIL_API"
  },

  GENDER: {
    department: "IDENTITY",
    apiKey: "IDENTITY_GENDER_API"
  },

  CASTE_CERTIFICATE: {
    department: "SOCIAL_JUSTICE",
    apiKey: "SOCIAL_JUSTICE_CASTE_API"
  },

  EDUCATION_QUALIFICATION: {
    department: "EDUCATION",
    apiKey: "EDUCATION_QUALIFICATION_API"
  },

  MARKS: {
    department: "EDUCATION",
    apiKey: "EDUCATION_MARKS_API"
  }

};
module.exports = { departmentRulebook };