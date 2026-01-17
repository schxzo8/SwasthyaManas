const Content = require("../models/Content");

// CREATE content (ADMIN)
exports.createContent = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { title, body, category } = req.body;

    const content = await Content.create({
      title,
      body,
      category,
      published: true,
    });

    res.status(201).json({
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    console.error("CREATE CONTENT ERROR");
    console.error(error);

    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};


// GET all content (PUBLIC)
exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.find({ published: true });
    res.json(content);
  } catch (error) {
      console.error("CONTENT ERROR:", error);
      res.status(500).json({ message: error.message })
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
