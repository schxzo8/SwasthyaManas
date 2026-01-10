import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [contents, setContents] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchContent = async () => {
    try {
      const res = await API.get("/api/content", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContent = async (id) => {
    try {
      await API.delete(`/api/content/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchContent();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin CMS</h1>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

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
          <button onClick={() => deleteContent(item._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
