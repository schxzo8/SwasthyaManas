const Content = require("../models/Content");

// helper: remove invalid combo fields
function normalizePayload(payload) {
  const clean = { ...payload };

  // default to published=true if not provided
  if (typeof clean.published !== "boolean") clean.published = true;

  // clean invalid fields depending on contentType
  if (clean.contentType !== "mental_health") clean.topic = null;
  if (clean.contentType !== "page") clean.pageType = null;

  return clean;
}

// CREATE content (ADMIN)
exports.createContent = async (req, res) => {
  try {
    const { title, body, contentType, pageType, topic, published } = req.body;

    const content = await Content.create(
      normalizePayload({
        title,
        body,
        contentType,
        pageType: contentType === "page" ? pageType : null,
        topic: contentType === "mental_health" ? topic : null,
        published: published !== false,
      })
    );

    res.status(201).json({
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all content (PUBLIC)
// supports query params:
// /api/content?type=mental_health
// /api/content?type=mental_health&topic=ADHD
// /api/content?type=page&pageType=about
exports.getAllContent = async (req, res) => {
  try {
    const { type, topic, pageType } = req.query;

    const filter = { published: true };

    if (type) filter.contentType = type;
    if (topic) filter.topic = topic;
    if (pageType) filter.pageType = pageType;

    const content = await Content.find(filter).sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE content (ADMIN)
exports.updateContent = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const updated = await Content.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Content updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE content (ADMIN)
exports.deleteContent = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
