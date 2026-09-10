require('./env');

function requiredIdentifier(value, name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`${name} must be a valid PostgreSQL identifier.`);
  }
  return value;
}

const cdcChannel = requiredIdentifier(process.env.CDC_CHANNEL || 'cdc_channel', 'CDC_CHANNEL');
// legacy_users uses `id` as its source-system primary key. Override this only
// when integrating a different legacy table whose identifier has another name.
const legacyIdField = process.env.LEGACY_ID_FIELD || 'id';

function departmentName(value) {
  const name = String(value || '').trim();
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,62}$/.test(name)) {
    throw new Error('A department name must contain only letters, numbers, underscores, or hyphens.');
  }
  return name;
}

function environmentToken(value) {
  return departmentName(value).replace(/-/g, '_').toUpperCase();
}

function configuredDepartments() {
  const rawValue = process.env.LEGACY_DEPARTMENTS || 'dept_1';
  const departments = rawValue.split(',').map((value) => departmentName(value));
  const environmentTokens = departments.map(environmentToken);
  if (
    departments.length === 0
    || new Set(departments).size !== departments.length
    || new Set(environmentTokens).size !== environmentTokens.length
  ) {
    throw new Error('LEGACY_DEPARTMENTS must contain one or more unique department names.');
  }
  return departments;
}

function getLegacySourceConfigs() {
  return configuredDepartments().map((name) => {
    const token = environmentToken(name);
    const departmentUrlVariable = `LEGACY_${token}_DATABASE_URL`;
    const departmentChannelVariable = `LEGACY_${token}_CDC_CHANNEL`;
    const departmentIdFieldVariable = `LEGACY_${token}_ID_FIELD`;

    // LEGACY_DATABASE_URL remains the compatibility setting for the first
    // connected source, dept_1. Every additional source has its own URL.
    const databaseUrlEnvironment = process.env[departmentUrlVariable]
      ? departmentUrlVariable
      : name === 'dept_1' ? 'LEGACY_DATABASE_URL' : departmentUrlVariable;

    return {
      departmentName: name,
      databaseUrlEnvironment,
      connectionString: process.env[databaseUrlEnvironment],
      channel: requiredIdentifier(
        process.env[departmentChannelVariable] || cdcChannel,
        departmentChannelVariable,
      ),
      legacyIdField: process.env[departmentIdFieldVariable] || legacyIdField,
    };
  });
}

// Keys are normalised by normaliseFieldName before this map is consulted.
const fieldEventMap = Object.freeze({
  address: 'Address_Update',
  residential_address: 'Address_Update',
  permanent_address: 'Address_Update',
  correspondence_address: 'Address_Update',
  name: 'Name_Update',
  full_name: 'Name_Update',
  first_name: 'Name_Update',
  last_name: 'Name_Update',
  date_of_birth: 'Date_of_Birth_Update',
  dob: 'Date_of_Birth_Update',
  mobile_number: 'Mobile_Number_Update',
  mobile: 'Mobile_Number_Update',
  phone: 'Mobile_Number_Update',
  phone_number: 'Mobile_Number_Update',
  email: 'Email_Update',
  email_address: 'Email_Update',
  income: 'Income_Update',
  annual_income: 'Income_Update',
  caste_category: 'Caste_Category_Update',
  caste: 'Caste_Category_Update',
  disability_status: 'Disability_Status_Update',
  disability: 'Disability_Status_Update',
  marital_status: 'Marital_Status_Update',
  bank_account: 'Bank_Account_Update',
  bank_account_number: 'Bank_Account_Update',
  ifsc_code: 'Bank_Account_Update',
  domicile: 'Domicile_Update',
  domicile_status: 'Domicile_Update',
  family_details: 'Family_Details_Update',
  property_details: 'Property_Details_Update',
  vehicle_details: 'Vehicle_Details_Update',
  education_qualification: 'Education_Qualification_Update',
  educational_qualification: 'Education_Qualification_Update',
  employment_details: 'Employment_Details_Update',
  employment_status: 'Employment_Details_Update',
  death_status: 'Death_Status_Update',
  is_deceased: 'Death_Status_Update',
});

function normaliseFieldName(field) {
  return String(field).trim().toLowerCase().replace(/[\s-]+/g, '_');
}

module.exports = {
  cdcChannel,
  legacyIdField,
  fieldEventMap,
  normaliseFieldName,
  getLegacySourceConfigs,
};
