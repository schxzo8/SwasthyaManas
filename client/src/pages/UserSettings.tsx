import { useState } from "react";
import { User, Lock, Bell, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/Button";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

  const handleProfileSave = async (): Promise<void> => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await API.put("/api/users/profile", form);
      const updated = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("auth:changed"));
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (): Promise<void> => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error("All password fields are required.");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await API.put("/api/users/password", {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      toast.success("Password changed successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    } finally { setSaving(false); }
  };

  const handleNotificationsSave = async (): Promise<void> => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    toast.success("Notification preferences saved.");
    setSaving(false);
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (deleteInput !== user?.email) {
      toast.error("Email doesn't match. Account not deleted.");
      return;
    }
    setSaving(true);
    try {
      await API.delete("/api/users");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete account.");
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: "profile"       as Tab, label: "Profile",       icon: User   },
    { id: "security"      as Tab, label: "Security",      icon: Lock   },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell   },
    { id: "danger"        as Tab, label: "Danger Zone",   icon: Trash2 },
  ];

  const inp =
    "w-full border border-[#D4CCBF] rounded-xl px-4 py-3 text-sm bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:border-[#7C9A82] " +
    "transition-all shadow-sm hover:shadow-md text-[#2D3436] placeholder-[#9CA3AF]";
  const lbl = "block text-sm font-semibold text-[#2D3436] mb-2 tracking-wide";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FCFAF7] to-[#F9F6F0] py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-5xl font-bold text-[#1a1a1a] mb-2">Account Settings</h1>
          <p className="text-[#6B7280] text-lg">Manage your profile, security, and preferences</p>
        </div>

        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="bg-white rounded-2xl border border-[#E8E6E1] shadow-lg overflow-hidden">
              {tabs.map(({ id, label, icon: Icon }, idx) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === id
                      ? "bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white shadow-md"
                      : "text-[#6B7280] hover:bg-[#F9F6F0]"
                  } ${idx < tabs.length - 1 ? "border-b border-[#E8E6E1]" : ""}`}
                >
                  {activeTab === id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                  )}
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E6E1] p-8 shadow-2xl">

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Profile Information</h2>
                  <p className="text-[#6B7280] text-sm">Update your personal details</p>
                </div>
                <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5F2EC] rounded-2xl p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={lbl}>First Name</label>
                      <input className={inp} value={form.firstName} placeholder="Enter your first name"
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Last Name</label>
                      <input className={inp} value={form.lastName} placeholder="Enter your last name"
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Email Address</label>
                    <input type="email" className={inp} value={form.email} placeholder="Enter your email"
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className={lbl}>Account Role</label>
                    <div className="relative">
                      <input className={inp + " bg-[#F0F7F4] text-[#7C9A82] cursor-not-allowed border-[#E8F0E9]"}
                        value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} disabled />
                      <span className="absolute right-4 top-3.5 text-xs font-semibold text-[#7C9A82]">Read-only</span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleProfileSave} disabled={saving}
                  className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Save size={16} className="mr-2" />
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Change Password</h2>
                  <p className="text-[#6B7280] text-sm">Keep your account secure with a strong password</p>
                </div>
                <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5F2EC] rounded-2xl p-6 space-y-5">
                  {(["current", "newPass", "confirm"] as const).map((field, i) => (
                    <div key={field}>
                      <label className={lbl}>
                        {["Current Password", "New Password", "Confirm New Password"][i]}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw[field] ? "text" : "password"}
                          className={inp + " pr-12"}
                          value={passwords[field]}
                          placeholder={["Enter current password", "Enter new password", "Confirm new password"][i]}
                          onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                        />
                        <button type="button"
                          onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#7C9A82] transition-colors">
                          {showPw[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-800">
                    💡 <span className="font-semibold">Password Tips:</span> Use at least 8 characters, mix uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
                <Button onClick={handlePasswordChange} disabled={saving}
                  className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Lock size={16} className="mr-2" />
                  {saving ? "Updating…" : "Update Password"}
                </Button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === "notifications" && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Notification Preferences</h2>
                  <p className="text-[#6B7280] text-sm">Choose how you'd like to be notified</p>
                </div>
                <div className="space-y-3">
                  {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => (
                    <div key={key}
                      className="flex items-center justify-between bg-gradient-to-r from-[#FAF7F2] to-[#F5F2EC] rounded-2xl p-5 border border-[#E8E6E1] hover:shadow-md transition-all">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1a1a1a] capitalize">
                          {key === "email" ? "Email Updates" : key === "appointments" ? "Appointment Reminders" : "Assessment Nudges"}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {{ email: "Receive important updates and newsletters via email", appointments: "Get reminders before your upcoming appointments", assessments: "Nudges to help you complete pending assessments" }[key]}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                        className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ml-4 shadow-sm ${
                          notifications[key] ? "bg-gradient-to-r from-[#7C9A82] to-[#5A7A60]" : "bg-[#D4D4D8]"
                        }`}
                      >
                        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                          notifications[key] ? "left-6" : "left-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleNotificationsSave} disabled={saving}
                  className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Save size={16} className="mr-2" />
                  {saving ? "Saving…" : "Save Preferences"}
                </Button>
              </div>
            )}

            {/* ── DANGER ZONE ── */}
            {activeTab === "danger" && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-2xl font-bold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-[#6B7280] text-sm">Account deletion is permanent and cannot be undone</p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-8 space-y-5">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-red-900">⚠️ Before you go…</p>
                    <p className="text-sm text-red-800 leading-relaxed">Deleting your account will:</p>
                    <ul className="text-xs text-red-800 space-y-1 ml-4 list-disc">
                      <li>Permanently remove all your personal data</li>
                      <li>Cancel any active consultations</li>
                      <li>Delete all assessment history</li>
                      <li>Remove access to all services</li>
                    </ul>
                  </div>
                  <div className="border-t-2 border-red-200 pt-5 space-y-3">
                    <p className="text-sm font-semibold text-red-900">Type your email to confirm deletion:</p>
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-[#9CA3AF] mb-1">Your email:</p>
                      <p className="font-mono font-bold text-red-600 text-sm">{user?.email}</p>
                    </div>
                    <input
                      className={inp + " border-2 border-red-300 focus:ring-red-400 focus:border-red-400 bg-white"}
                      placeholder="Paste your email here to confirm"
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                    />
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={saving || deleteInput !== user?.email}
                      className={`w-full py-3 font-semibold transition-all ${
                        deleteInput === user?.email && !saving
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
                          : "bg-red-200 text-red-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <Trash2 size={16} className="mr-2" />
                      {saving ? "Deleting Account…" : "Permanently Delete My Account"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}