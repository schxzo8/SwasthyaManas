import { useEffect, useState } from "react";
import { Trash2, Pencil, X, Check, RefreshCw, Ban } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";
import API from "../../services/api";

type Expert = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
};

export default function AdminExpertsPanel() {
  const [experts, setExperts]   = useState<Expert[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expert>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [msg, setMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/users/admin/experts");
      setExperts(res.data);
    } catch {
      flash("error", "Failed to load experts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExperts(); }, []);

  const startEdit = (expert: Expert) => {
    setEditing(expert._id);
    setEditForm({
      firstName: expert.firstName,
      lastName:  expert.lastName,
      email:     expert.email,
      expertise: expert.expertise,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await API.put(`/api/users/admin/experts/${id}`, editForm);
      setExperts(e => e.map(x => x._id === id ? { ...x, ...res.data } : x));
      setEditing(null);
      flash("success", "Expert updated successfully.");
    } catch {
      flash("error", "Failed to update expert.");
    }
  };

  const toggleBan = async (expert: Expert) => {
    try {
      await API.put(`/api/users/admin/experts/${expert._id}`, { isActive: !expert.isActive });
      setExperts(e => e.map(x => x._id === expert._id ? { ...x, isActive: !x.isActive } : x));
      flash("success", `Expert ${expert.isActive ? "banned" : "unbanned"}.`);
    } catch {
      flash("error", "Failed to update expert.");
    }
  };

  const deleteExpert = async (id: string) => {
    try {
      await API.delete(`/api/users/admin/experts/${id}`);
      setExperts(e => e.filter(x => x._id !== id));
      setConfirmDelete(null);
      flash("success", "Expert deleted.");
    } catch {
      flash("error", "Failed to delete expert.");
    }
  };

  const filtered = experts.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.expertise}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const inp = "border border-[#E8F0E9] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2D3436]">Expert Management</h2>
          <p className="text-sm text-[#5A6062] mt-0.5">{experts.length} total experts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchExperts}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === "success" ? "bg-[#E8F0E9] text-[#4A7C59]" : "bg-red-50 text-red-600"
        }`}>{msg.text}</div>
      )}

      <input
        className="w-full border border-[#E8F0E9] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82]"
        placeholder="Search by name, email, or expertise…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-16 text-[#5A6062]">Loading experts…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#5A6062]">No experts found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(expert => (
            <Card key={expert._id} className="p-4">
              {editing === expert._id ? (
                // ── Edit row ──
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="First name"
                      value={editForm.firstName || ""}
                      onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                    <input className={inp} placeholder="Last name"
                      value={editForm.lastName || ""}
                      onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                  <input className={inp + " w-full"} placeholder="Email"
                    value={editForm.email || ""}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                  <input className={inp + " w-full"} placeholder="Expertise"
                    value={editForm.expertise || ""}
                    onChange={e => setEditForm(f => ({ ...f, expertise: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => saveEdit(expert._id)}>
                      <Check size={13} className="mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                      <X size={13} className="mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // ── View row ──
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#7C9A82] flex items-center justify-center text-white font-medium text-sm shrink-0">
                      {expert.firstName[0]}{expert.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D3436]">
                        {expert.firstName} {expert.lastName}
                      </p>
                      <p className="text-xs text-[#5A6062]">{expert.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                          {expert.expertise || "No expertise set"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          expert.isActive !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {expert.isActive !== false ? "Active" : "Banned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => startEdit(expert)}
                      className="border-[#7C9A82] text-[#7C9A82] hover:bg-[#E8F0E9]">
                      <Pencil size={13} className="mr-1" /> Edit
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => toggleBan(expert)}
                      className={expert.isActive !== false
                        ? "border-red-300 text-red-500 hover:bg-red-50"
                        : "border-green-300 text-green-600 hover:bg-green-50"}>
                      <Ban size={13} className="mr-1" />
                      {expert.isActive !== false ? "Ban" : "Unban"}
                    </Button>

                    {confirmDelete === expert._id ? (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm"
                          className="border-red-400 text-red-500 hover:bg-red-50"
                          onClick={() => deleteExpert(expert._id)}>
                          Confirm
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm"
                        className="border-red-300 text-red-500 hover:bg-red-50"
                        onClick={() => setConfirmDelete(expert._id)}>
                        <Trash2 size={13} className="mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}