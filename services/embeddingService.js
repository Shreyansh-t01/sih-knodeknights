import { pipeline } from "@huggingface/transformers";

let embeddingModel = null;

export async function initializeEmbeddingModel() {

  console.log("Loading embedding model...");

  embeddingModel = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  console.log("Embedding model loaded successfully.");
}

export async function generateEmbedding(text) {

  if (!embeddingModel) {
    throw new Error(
      "Embedding model has not been initialized."
    );
  }

  const output = await embeddingModel(text, {
    pooling: "mean",
    normalize: true
  });

  return output.tolist()[0];
}