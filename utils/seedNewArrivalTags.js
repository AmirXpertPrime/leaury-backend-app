const NewArrivalTag = require('../models/NewArrivalTag');

const DEFAULT_TAGS = [
  { name: 'SHOES COLLECTION', tag_type: 'shoes' },
  { name: 'BAGS COLLECTION', tag_type: 'bags' },
  { name: 'OLYMPUS COLLECTION', tag_type: 'olympus' },
  { name: 'EXCLUSIVE COLLECTION', tag_type: 'exclusive' },
];

async function seedNewArrivalTags() {
  const existingCount = await NewArrivalTag.countDocuments();
  if (existingCount > 0) return;

  await NewArrivalTag.insertMany(DEFAULT_TAGS, { ordered: false });
  console.log(`[seedNewArrivalTags] Inserted ${DEFAULT_TAGS.length} tags`);
}

module.exports = seedNewArrivalTags;


