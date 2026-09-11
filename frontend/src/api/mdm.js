import { apiClient } from './client';

/**
 * MDM (Master Data Management) Identity Mapping API Service
 * Maps departmental legacy IDs to unified Citizen Global IDs.
 */
export const mdmApi = {
  /**
   * POST /api/mdm/identity
   * Request: { department_name, legacy_id, global_id }
   */
  createIdentityMapping: async ({ department_name, legacy_id, global_id }) => {
    if (!department_name || !legacy_id || !global_id) {
      throw new Error('department_name, legacy_id, and global_id are all required.');
    }

    const response = await apiClient.post('/api/mdm/identity', {
      department_name: department_name.trim(),
      legacy_id: String(legacy_id).trim(),
      global_id: String(global_id).trim(),
    });
    return response?.data;
  },
};
