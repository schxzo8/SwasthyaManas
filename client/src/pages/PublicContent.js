import { useEffect, useState } from "react";
import API from "../services/api";

function PublicContent() {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await API.get("/api/content");
      setContents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>SwasthyaManas – Information</h1>

      {contents.length === 0 && <p>No content available.</p>}

      {contents.map((item) => (
        <div
          key={item._id}
          style={{
            borderBottom: "1px solid #ddd",
            paddingBottom: "20px",
            marginBottom: "20px",
          }}
        >
          <h2>{item.title}</h2>
          <p>{item.body}</p>
          <small>Category: {item.category}</small>
        </div>
      ))}
    </div>
  );
}

export default PublicContent;
