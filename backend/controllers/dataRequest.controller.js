const { middlewarePool } = require('../config/db');
const { processDataRequest } = require('../services/dataRequest.service');

async function handleDataRequest(req, res, next) {
  try {
    const globalId = req.body.global_id || req.body.globalId;
    const legacyId = req.body.legacy_id || req.body.legacyId;
    const requestedFields = req.body.requested_fields || req.body.requestedFields;
    const departmentName = req.body.department_name || req.body.departmentName || req.body.targetDepartment || 'MMVY';
    const requestingDepartment = req.body.requesting_department || req.body.requestingDepartment || 'MMVY';
    const purpose = req.body.purpose || 'Scholarship Application Verification';

    const result = await processDataRequest({
      middlewarePool,
      globalId,
      legacyId,
      departmentName,
      requestedFields: requestedFields || ['ADDRESS', 'INCOME'],
      purpose,
      requestingDepartment,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  handleDataRequest,
};
