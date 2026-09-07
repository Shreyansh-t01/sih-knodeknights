import { pipeline } from "@huggingface/transformers";

let extractor = null;

export async function initializeEmbeddingModel() {
  console.log("Loading embedding");

  extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  console.log("Embedding model loaded.");
}

export async function generateEmbedding(text) {
  if (!extractor) {
    throw new Error("Embedding model has not been initialized.");
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  return output.tolist()[0];
}