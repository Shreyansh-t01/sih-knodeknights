import * as cheerio from "cheerio";

export function extractFieldsFromHTML(html) {

  const $ = cheerio.load(html);

  const fields = [];

  $("input, select, textarea").each(
    (index, element) => {

      const tag = element.tagName;

      const name = $(element).attr("name") || "";

      const placeholder =
        $(element).attr("placeholder") || "";

      const id =
        $(element).attr("id") || "";

      let label = "";

      if (id) {

        const associatedLabel =
          $(`label[for="${id}"]`).first().text();

        label = associatedLabel.trim();
      }

      if (!label) {

        label = $(element)
          .closest("label")
          .text()
          .trim();
      }

      if (!label) {

        label = $(element)
          .prev("label")
          .text()
          .trim();
      }

      const fieldText =
        label ||
        placeholder ||
        name ||
        id;

      if (!fieldText) {
        return;
      }

      fields.push({

        index,

        tag,

        label: label || null,

        name: name || null,

        placeholder:
          placeholder || null,

        id: id || null,

        extractedText: fieldText

      });
    }
  );

  return fields;
}