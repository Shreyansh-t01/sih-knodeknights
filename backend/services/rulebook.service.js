const fs = require('fs');
const path = require('path');

const rulebookPath = path.join(__dirname, '..', 'rulebook.json');

function loadRulebook() {
  let contents;
  try {
    contents = fs.readFileSync(rulebookPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read rulebook at ${rulebookPath}: ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    throw new Error(`rulebook.json contains invalid JSON: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('rulebook.json must be an object keyed by trigger event.');
  }

  const normalised = new Map();
  for (const [triggerEvent, definition] of Object.entries(parsed)) {
    const rawTargets = Array.isArray(definition)
      ? definition
      : definition && definition.target_departments;

    if (!Array.isArray(rawTargets) || rawTargets.length === 0) {
      throw new Error(`Rulebook event "${triggerEvent}" must define a non-empty target_departments array.`);
    }

    const targets = [...new Set(rawTargets.map((target) => String(target).trim()).filter(Boolean))];
    if (targets.length === 0) {
      throw new Error(`Rulebook event "${triggerEvent}" has no valid target departments.`);
    }
    normalised.set(triggerEvent, targets);
  }
  return normalised;
}

class RulebookService {
  constructor() {
    this.rules = loadRulebook();
  }

  getTargets(triggerEvent) {
    return this.rules.get(triggerEvent) || [];
  }
}

const rulebookService = new RulebookService();

module.exports = { RulebookService, rulebookService, loadRulebook };
