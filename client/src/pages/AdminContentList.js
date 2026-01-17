import { useEffect, useState } from "react";
import API from "../services/api";

function AdminContentList({ onEdit }) {
  const [contents, setContents] = useState([]);
  const token = localStorage.getItem("token");

  const fetchContent = async () => {
    try {
      const res = await API.get("/api/content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContents(res.data);
    } catch (err) {
      console.error("Failed to fetch content", err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const deleteContent = async (id) => {
    await API.delete(`/api/content/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchContent();
  };

  return (
    <div>
      <h2>All Content</h2>

      {contents.length === 0 && <p>No content found.</p>}

      {contents.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <small>Category: {item.category}</small>
          <br /><br />

          <button onClick={() => onEdit(item)}>Edit</button>{" "}
          <button onClick={() => deleteContent(item._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default AdminContentList;
