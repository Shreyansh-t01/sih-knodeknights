import express from "express";

import {
  extractFieldsFromHTML
} from "../services/fieldExtractor.js";

import {
  identifyCommonEntity
} from "../services/semanticEngine.js";

const router = express.Router();


router.post("/analyze-form", async (req, res) => {

  try {

    // read json body
    const body = req.body || {};

    const {
      html,
      fields
    } = body;


    let extractedFields = [];


    
    // html


    if (html) {

      extractedFields =
        extractFieldsFromHTML(html);

    }


    // json data

    else if (Array.isArray(fields)) {

      extractedFields =
        fields.map((field, index) => {

          // If frontend sends an object
          if (
            typeof field === "object" &&
            field !== null
          ) {

            return {

              index,

              label: field.label || "",

              name: field.name || "",

              type: field.type || "text",

              extractedText:
                field.label ||
                field.name ||
                ""

            };

          }


          // If frontend sends simple string
          return {

            index,

            label: field,

            name: "",

            type: "text",

            extractedText: field

          };

        });

    }



    else {

      return res.status(400).json({

        success: false,

        message:
          "Provide either 'html' or 'fields'."

      });

    }



    const analyzedFields = [];


    for (
      const field
      of extractedFields
    ) {

      const intelligence =
        await identifyCommonEntity(
          field.extractedText
        );


      analyzedFields.push({

        ...field,

        intelligence

      });

    }



    return res.json({

      success: true,

      totalFields:
        analyzedFields.length,

      fields:
        analyzedFields

    });


  } catch (error) {

    console.error(
      "Form intelligence error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Form intelligence analysis failed.",

      error:
        error.message

    });

  }

});


export default router;