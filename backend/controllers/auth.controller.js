const authService = require('../services/auth.service');

exports.loginSSO = async (req, res) => {
  try {
    const { identifier, password, pin, identityId, role, department } = req.body || {};
    const result = await authService.loginSSO({ identifier, password, pin, identityId, role, department });
    return res.status(200).json(result);
  } catch (error) {
    console.error('[SSO Controller] Login failed:', error.message);
    return res.status(401).json({ success: false, error: error.message });
  }
};

exports.getUserInfo = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User claims not found.' });
    }
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPersonas = async (req, res) => {
  try {
    const personas = await authService.listPersonas();
    return res.status(200).json({ success: true, personas });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCitizenProfile = async (req, res) => {
  try {
    const { globalId } = req.params;
    const profile = await authService.getCitizenProfileFromNeon(globalId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Citizen profile not found in Neon database.' });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
