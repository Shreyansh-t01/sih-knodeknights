const express = require('express');
const { upsertIdentity, listMappings } = require('../controllers/identity.controller');

const router = express.Router();

router.get('/mappings', listMappings);
router.post('/identity', upsertIdentity);

module.exports = router;
