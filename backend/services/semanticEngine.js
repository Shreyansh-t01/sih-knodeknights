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

function fallbackKeywordMatch(fieldText) {
  const cleanInput = (fieldText || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const inputWords = cleanInput.split(/\s+/).filter(Boolean);

  let best = { entity: canonicalEntities[0]?.entity || 'PERSON_NAME', score: 0 };
  for (const item of canonicalEntities) {
    let score = 0;
    const allAliases = [item.entity.toLowerCase(), item.description.toLowerCase(), ...item.aliases.map((a) => a.toLowerCase())];
    for (const alias of allAliases) {
      if (cleanInput.includes(alias) || alias.includes(cleanInput)) {
        score = Math.max(score, 0.95);
      }
      for (const w of inputWords) {
        if (alias.includes(w)) {
          score = Math.max(score, 0.75);
        }
      }
    }
    if (score > best.score) {
      best = { entity: item.entity, score };
    }
  }

  const entity = best.score > 0 ? best.entity : (canonicalEntities[0]?.entity || 'PERSON_NAME');
  const confidence = best.score > 0 ? best.score : 0.75;
  const rule = departmentRulebook[entity];

  return {
    originalField: fieldText,
    commonEntity: entity,
    confidence,
    department: rule?.department || null,
    apiKey: rule?.apiKey || null,
    alternatives: canonicalEntities
      .filter((c) => c.entity !== entity)
      .slice(0, 2)
      .map((c) => ({
        commonEntity: c.entity,
        confidence: 0.50,
      })),
  };
}

async function identifyCommonEntity(fieldText) {
  if (indexedEntities.length === 0) {
    return fallbackKeywordMatch(fieldText);
  }

  try {
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
  } catch (err) {
    return fallbackKeywordMatch(fieldText);
  }
}

module.exports = {
  initializeSemanticEngine,
  identifyCommonEntity
};