const { pipeline } = require("@huggingface/transformers");

let embeddingModel = null;

async function initializeEmbeddingModel() {
  console.log("Loading embedding model...");

  try {
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded successfully.");
    return true;
  } catch (error) {
    console.warn(
      "Embedding model could not be loaded. Semantic mapping will be unavailable."
    );
    console.warn(error.message);

    embeddingModel = null;
    return false;
  }
}

async function generateEmbedding(text) {
  if (!embeddingModel) {
    throw new Error(
      "Embedding model is unavailable. Semantic mapping cannot be performed."
    );
  }

  const output = await embeddingModel(text, {
    pooling: "mean",
    normalize: true
  });

  return output.tolist()[0];
}

function isEmbeddingModelReady() {
  return embeddingModel !== null;
}

module.exports = {
  initializeEmbeddingModel,
  generateEmbedding,
  isEmbeddingModelReady
};