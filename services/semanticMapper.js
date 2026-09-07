import { canonicalFields } from "../data/canonicalField.js";
import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "./similarityService.js";

let canonicalEmbeddings = [];

export async function initializeCanonicalEmbeddings() {
  console.log("Creating canonical field embeddings...");

  canonicalEmbeddings = [];

  for (const field of canonicalFields) {

    const text = [
      field.canonical,
      field.description,
      ...field.aliases
    ].join(". ");

    const embedding = await generateEmbedding(text);

    canonicalEmbeddings.push({
      ...field,
      embedding
    });
  }

  console.log(
    `${canonicalEmbeddings.length} canonical fields indexed.`
  );
}

export async function mapField(fieldName) {

  const inputEmbedding = await generateEmbedding(fieldName);

  const results = canonicalEmbeddings.map((field) => {

    const similarity = cosineSimilarity(
      inputEmbedding,
      field.embedding
    );

    return {
      canonical: field.canonical,
      department: field.department,
      confidence: similarity
    };
  });

  results.sort(
    (a, b) => b.confidence - a.confidence
  );

  const bestMatch = results[0];

  return {
    original: fieldName,
    canonical: bestMatch.canonical,
    department: bestMatch.department,
    confidence: Number(bestMatch.confidence.toFixed(4)),
    alternatives: results.slice(1, 3).map((item) => ({
      canonical: item.canonical,
      department: item.department,
      confidence: Number(item.confidence.toFixed(4))
    }))
  };
}