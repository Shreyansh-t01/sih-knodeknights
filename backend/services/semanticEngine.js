const { canonicalEntities } = require("../data/canonicalEntities");
const { departmentRulebook } = require("../data/departmentRulebook");

const {
  generateEmbedding
} = require("./embeddingService");

const {
  cosineSimilarity
} = require("./similarityService");

let indexedEntities = [];

async function initializeSemanticEngine() {
  console.log("Creating semantic entity index...");

  indexedEntities = [];

  for (const entity of canonicalEntities) {
    const searchableText = [
      entity.entity,
      entity.description,
      ...entity.aliases
    ].join(". ");

    const embedding = await generateEmbedding(searchableText);

    indexedEntities.push({
      entity: entity.entity,
      description: entity.description,
      aliases: entity.aliases,
      embedding
    });
  }

  console.log(
    `${indexedEntities.length} common entities indexed.`
  );
}

async function identifyCommonEntity(fieldText) {
  const inputEmbedding = await generateEmbedding(fieldText);

  const candidates = indexedEntities.map((entity) => {
    const similarity = cosineSimilarity(
      inputEmbedding,
      entity.embedding
    );

    return {
      entity: entity.entity,
      confidence: similarity
    };
  });

  candidates.sort(
    (a, b) => b.confidence - a.confidence
  );

  const bestMatch = candidates[0];

  const rule = departmentRulebook[bestMatch.entity];

  return {
    originalField: fieldText,

    commonEntity: bestMatch.entity,

    confidence: Number(
      bestMatch.confidence.toFixed(4)
    ),

    department: rule?.department || null,

    apiKey: rule?.apiKey || null,

    alternatives: candidates
      .slice(1, 3)
      .map((candidate) => ({
        commonEntity: candidate.entity,
        confidence: Number(
          candidate.confidence.toFixed(4)
        )
      }))
  };
}

module.exports = {
  initializeSemanticEngine,
  identifyCommonEntity
};