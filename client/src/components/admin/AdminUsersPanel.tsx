import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, Ban, RefreshCw, Plus, X, Check } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";
import API from "../../services/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
};

const defaultForm = { firstName: "", lastName: "", email: "", password: "", role: "user" };

export default function AdminUsersPanel() {
  const [users, setUsers]             = useState<User[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(defaultForm);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/users/admin/users");
      setUsers(res.data);
    } catch {
      flash("error", "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return flash("error", "All fields are required.");
    setSaving(true);
    try {
      const res = await API.post("/api/users/admin/create", form);
      setUsers(u => [res.data, ...u]);
      setForm(defaultForm);
      setShowForm(false);
      flash("success", "User created successfully.");
    } catch (err: any) {
      flash("error", err?.response?.data?.message || "Failed to create user.");
    } finally { setSaving(false); }
  };

  const toggleBan = async (user: User) => {
    try {
      await API.put(`/api/users/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers(u => u.map(x => x._id === user._id ? { ...x, isActive: !x.isActive } : x));
      flash("success", `User ${user.isActive ? "banned" : "unbanned"} successfully.`);
    } catch {
      flash("error", "Failed to update user.");
    }
  };

  const changeRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await API.put(`/api/users/admin/users/${user._id}`, { role: newRole });
      setUsers(u => u.map(x => x._id === user._id ? { ...x, role: newRole } : x));
      flash("success", `Role changed to ${newRole}.`);
    } catch {
      flash("error", "Failed to change role.");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await API.delete(`/api/users/admin/users/${id}`);
      setUsers(u => u.filter(x => x._id !== id));
      setConfirmDelete(null);
      flash("success", "User deleted.");
    } catch {
      flash("error", "Failed to delete user.");
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full border border-[#E8F0E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2D3436]">User Management</h2>
          <p className="text-sm text-[#5A6062] mt-0.5">{users.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>
            <Plus size={14} className="mr-1" /> {showForm ? "Cancel" : "Add User"}
          </Button>
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === "success" ? "bg-[#E8F0E9] text-[#4A7C59]" : "bg-red-50 text-red-600"
        }`}>{msg.text}</div>
      )}

      {/* Add User Form */}
      {showForm && (
        <Card className="p-5 border-2 border-[#7C9A82]">
          <h3 className="font-semibold text-[#2D3436] mb-4">Create New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1">First Name</label>
              <input className={inp} value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1">Last Name</label>
              <input className={inp} value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1">Email</label>
              <input type="email" className={inp} value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1">Password</label>
              <input type="password" className={inp} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1">Role</label>
              <select className={inp} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={handleAddUser} disabled={saving}>
              <Check size={13} className="mr-1" /> {saving ? "Creating…" : "Create User"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(defaultForm); }}>
              <X size={13} className="mr-1" /> Cancel
            </Button>
          </div>
        </Card>
      )}

      <input
        className={inp}
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-16 text-[#5A6062]">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#5A6062]">No users found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <Card key={user._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C4B5A0] flex items-center justify-center text-white font-medium text-sm shrink-0">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D3436]">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#5A6062]">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-[#E8F0E9] text-[#4A7C59]"
                    }`}>{user.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>{user.isActive !== false ? "Active" : "Banned"}</span>
                    {!user.isVerified && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">Unverified</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => toggleBan(user)}
                  className={user.isActive !== false ? "border-red-300 text-red-500 hover:bg-red-50" : "border-green-300 text-green-600 hover:bg-green-50"}>
                  <Ban size={13} className="mr-1" />{user.isActive !== false ? "Ban" : "Unban"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => changeRole(user)}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50">
                  <ShieldCheck size={13} className="mr-1" />
                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                </Button>
                {confirmDelete === user._id ? (
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="border-red-400 text-red-500 hover:bg-red-50"
                      onClick={() => deleteUser(user._id)}>Confirm</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => setConfirmDelete(user._id)}>
                    <Trash2 size={13} className="mr-1" /> Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}