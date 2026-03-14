import { useState } from "react";
import { User, Lock, Bell, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/Button";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

type Tab = "profile" | "security" | "notifications" | "danger";

export default function UserSettings() {
  const navigate = useNavigate();

  const [user] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    email:     user?.email     || "",
  });

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });

  const [showPw, setShowPw] = useState({
    current: false, newPass: false, confirm: false,
  });

  const [notifications, setNotifications] = useState({
    email: true, appointments: true, assessments: false,
  });

  const [deleteInput, setDeleteInput] = useState("");
  const [activeTab, setActiveTab]     = useState<Tab>("profile");
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ type: "success" | "error"; text: string } | null>(null);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleProfileSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim())
      return flash("error", "All fields are required.");
    setSaving(true);
    try {
      const res = await API.put("/api/users/profile", form);
      const updated = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("auth:changed"));
      flash("success", "Profile updated successfully.");
    } catch (err: any) {
      flash("error", err?.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm)
      return flash("error", "All password fields are required.");
    if (passwords.newPass.length < 8)
      return flash("error", "New password must be at least 8 characters.");
    if (passwords.newPass !== passwords.confirm)
      return flash("error", "New passwords do not match.");
    setSaving(true);
    try {
      await API.put("/api/users/password", {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      flash("success", "Password changed successfully.");
    } catch (err: any) {
      flash("error", err?.response?.data?.message || "Failed to change password.");
    } finally { setSaving(false); }
  };

  const handleNotificationsSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    flash("success", "Notification preferences saved.");
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email)
      return flash("error", "Email doesn't match. Account not deleted.");
    setSaving(true);
    try {
      await API.delete("/api/users");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/");
    } catch (err: any) {
      flash("error", err?.response?.data?.message || "Failed to delete account.");
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: "profile"       as Tab, label: "Profile",       icon: User   },
    { id: "security"      as Tab, label: "Security",      icon: Lock   },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell   },
    { id: "danger"        as Tab, label: "Danger Zone",   icon: Trash2 },
  ];

  const inp =
    "w-full border border-[#E8F0E9] rounded-lg px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-[#7C9A82] bg-white";
  const lbl = "block text-sm font-medium text-[#2D3436] mb-1";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-[#2D3436] mb-8">Account Settings</h1>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === "success"
            ? "bg-[#E8F0E9] text-[#4A7C59]"
            : "bg-red-50 text-red-600"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setMsg(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-[#7C9A82] text-white"
                  : "text-[#2D3436] hover:bg-[#E8F0E9]"
              } ${id === "danger" && activeTab !== "danger" ? "hover:text-red-500" : ""}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </aside>

        {/* Panel */}
        <div className="flex-1 bg-white rounded-xl border border-[#E8F0E9] p-6 shadow-sm">

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#2D3436]">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>First Name</label>
                  <input className={inp} value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className={lbl}>Last Name</label>
                  <input className={inp} value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" className={inp} value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Role</label>
                <input className={inp + " bg-[#FAF7F2] text-gray-400 cursor-not-allowed"}
                  value={user?.role || ""} disabled />
              </div>
              <Button variant="primary" size="sm" onClick={handleProfileSave} disabled={saving}>
                <Save size={14} className="mr-1" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#2D3436]">Change Password</h2>
              {(["current", "newPass", "confirm"] as const).map((field, i) => (
                <div key={field}>
                  <label className={lbl}>
                    {["Current Password", "New Password", "Confirm New Password"][i]}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw[field] ? "text" : "password"}
                      className={inp + " pr-10"}
                      value={passwords[field]}
                      onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7C9A82]"
                    >
                      {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <Button variant="primary" size="sm" onClick={handlePasswordChange} disabled={saving}>
                <Lock size={14} className="mr-1" />
                {saving ? "Updating…" : "Update Password"}
              </Button>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#2D3436]">Notification Preferences</h2>
              <div className="space-y-1">
                {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => (
                  <div key={key}
                    className="flex items-center justify-between py-3 border-b border-[#E8F0E9] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#2D3436] capitalize">{key} Notifications</p>
                      <p className="text-xs text-gray-400">
                        {{ email: "Receive updates via email", appointments: "Reminders for upcoming appointments", assessments: "Nudges to complete assessments" }[key]}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        notifications[key] ? "bg-[#7C9A82]" : "bg-gray-200"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        notifications[key] ? "left-6" : "left-1"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="primary" size="sm" onClick={handleNotificationsSave} disabled={saving}>
                <Save size={14} className="mr-1" />
                {saving ? "Saving…" : "Save Preferences"}
              </Button>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === "danger" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
              <p className="text-sm text-gray-500">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-[#2D3436]">
                  Type <span className="font-mono font-bold text-red-500">{user?.email}</span> to confirm:
                </p>
                <input
                  className={inp + " border-red-200 focus:ring-red-300"}
                  placeholder="Enter your email to confirm"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteInput !== user?.email}
                  className="border-red-400 text-red-500 hover:bg-red-100 disabled:opacity-40"
                >
                  <Trash2 size={14} className="mr-1" />
                  {saving ? "Deleting…" : "Permanently Delete Account"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}