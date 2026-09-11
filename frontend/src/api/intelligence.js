import { apiClient } from './client';

/**
 * Semantic Intelligence API Service
 * Analyzes form fields to map them to canonical entities (e.g. INCOME, ADDRESS, etc.)
 */
export const intelligenceApi = {
  /**
   * POST /api/intelligence/analyze-form
   * @param {Object} payload - { fields: Array<{ label: string, name?: string, type?: string }>, html?: string }
   */
  analyzeForm: async (payload) => {
    if (!payload || (!payload.fields && !payload.html)) {
      throw new Error("Provide either 'html' or 'fields' to analyze.");
    }

    const response = await apiClient.post('/api/intelligence/analyze-form', payload);
    return response;
  },
};
