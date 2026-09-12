import { apiClient } from './client';

/**
 * Applications API Service
 * Handles application retrieval, consent decisions, and tracking.
 */
export const applicationsApi = {
  /**
   * GET /api/applications/pending/:global_id
   * Retrieves pending consent applications for a citizen global ID.
   */
  getPendingApplications: async (globalId) => {
    if (!globalId) {
      throw new Error('globalId is required to fetch pending applications.');
    }

    const response = await apiClient.get(
      `/api/applications/pending/${encodeURIComponent(globalId)}`
    );

    return (
      response?.data || {
        global_id: globalId,
        count: 0,
        applications: [],
      }
    );
  },

  /**
   * GET /api/applications/citizen/:global_id
   * Retrieves all applications for a citizen global ID.
   */
  getCitizenApplications: async (globalId) => {
    if (!globalId) {
      throw new Error(
        'globalId is required to fetch citizen applications.'
      );
    }

    const response = await apiClient.get(
      `/api/applications/citizen/${encodeURIComponent(globalId)}`
    );

    return (
      response?.data || {
        global_id: globalId,
        count: 0,
        applications: [],
      }
    );
  },

  /**
   * POST /api/applications/:uarn/consent
   * Submits consent decision for an application UARN.
   * decision must be "APPROVED" or "REJECTED".
   */
  submitConsentDecision: async (uarn, decision) => {
    if (!uarn) {
      throw new Error('uarn is required to submit consent decision.');
    }

    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new Error('decision must be APPROVED or REJECTED.');
    }

    const response = await apiClient.post(
      `/api/applications/${encodeURIComponent(uarn)}/consent`,
      {
        decision,
      }
    );

    return response?.data;
  },

  /**
   * GET /api/applications/:uarn
   * Retrieves one application and its task statuses for tracking.
   */
  getApplicationByUarn: async (uarn) => {
    if (!uarn) {
      throw new Error(
        'uarn is required to fetch application tracking data.'
      );
    }

    const response = await apiClient.get(
      `/api/applications/${encodeURIComponent(uarn)}`
    );

    return response?.data;
  },

  /**
   * GET /api/applications/all
   * Retrieves all platform applications and tasks for admin oversight.
   */
  getAllApplications: async () => {
    const response = await apiClient.get('/api/applications/all');
    return response?.data?.applications || response?.applications || [];
  },
};