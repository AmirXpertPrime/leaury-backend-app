const NewArrivalTag = require("../models/NewArrivalTag");
const { COLLECTION_TAGS } = require("../constants");

async function seedNewArrivalTags() {
  const existingCount = await NewArrivalTag.countDocuments();
  if (existingCount > 0) return;

  await NewArrivalTag.insertMany(COLLECTION_TAGS, { ordered: false });
  console.log(`[seedNewArrivalTags] Inserted ${DEFAULT_TAGS.length} tags`);
}

module.exports = seedNewArrivalTags;
