const Content = require("../models/Content");

// CREATE content (ADMIN)
exports.createContent = async (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title || !body || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const content = await Content.create({
      title,
      body,
      category,
    });

    res.status(201).json({
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET all content (PUBLIC)
exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.find({ published: true });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE content (ADMIN)
exports.updateContent = async (req, res) => {
  try {
    const updated = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Content updated successfully",
      updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE content (ADMIN)
exports.deleteContent = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
