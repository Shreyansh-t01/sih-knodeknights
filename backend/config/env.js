const path = require('path');
const dotenv = require('dotenv');

// Resolve relative to this file, rather than process.cwd(), so both commands work:
//   cd backend && node server.js
//   node backend/server.js
const envFilePath = process.env.DOTENV_CONFIG_PATH
  ? path.resolve(process.env.DOTENV_CONFIG_PATH)
  : path.resolve(__dirname, '..', '.env');

const envLoadResult = dotenv.config({ path: envFilePath, quiet: true });

module.exports = { envFilePath, envLoadResult };
