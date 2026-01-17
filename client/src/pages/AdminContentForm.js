import { useState, useEffect } from "react";
import API from "../services/api";

function AdminContentForm({ editData }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setBody(editData.body);
      setCategory(editData.category);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { title, body, category };

    try {
      if (editData) {
        await API.put(`/api/content/${editData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Content updated successfully");
      } else {
        await API.post("/api/content", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Content created successfully");
      }

      // Reset form after submit
      setTitle("");
      setBody("");
      setCategory("");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>{editData ? "Edit Content" : "Add New Content"}</h2>

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        {/* BODY */}
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <br /><br />

        {/* CATEGORY — FIXED */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="about">About</option>
          <option value="blog">Blog</option>
          <option value="meditation">Meditation</option>
          <option value="resource">Resource</option>
        </select>
        <br /><br />

        <button type="submit">
          {editData ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default AdminContentForm;
