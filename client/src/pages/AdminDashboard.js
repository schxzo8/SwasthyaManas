import { useState } from "react";
import AdminContentList from "./AdminContentList";
import AdminContentForm from "./AdminContentForm";

function AdminDashboard() {
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin CMS</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => { setView("list"); setEditData(null); }}>
          View Content
        </button>{" "}
        <button onClick={() => setView("add")}>
          Add Content
        </button>
      </div>

      {view === "list" && (
        <AdminContentList onEdit={(data) => {
          setEditData(data);
          setView("edit");
        }} />
      )}

      {(view === "add" || view === "edit") && (
        <AdminContentForm editData={editData} />
      )}
    </div>
  );
}

export default AdminDashboard;
