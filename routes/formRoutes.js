import express from "express";
import { mapField } from "../services/semanticMapper.js";

const router = express.Router();

router.post("/analyze-form", async (req, res) => {

  try {

    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array."
      });
    }

    const results = [];

    for (const field of fields) {

      if (!field || typeof field !== "string") {
        continue;
      }

      const mapping = await mapField(field);

      results.push(mapping);
    }

    res.json({
      success: true,
      totalFields: results.length,
      fields: results
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze form."
    });
  }
});

export default router;