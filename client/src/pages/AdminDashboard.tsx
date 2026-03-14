import { useMemo, useState } from "react";
import AdminContentList from "./AdminContentList";
import AdminContentForm from "./AdminContentForm";
import type { ContentItem } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import AdminUsersPanel from "../components/admin/AdminUsersPanel";
import AdminExpertsPanel from "../components/admin/AdminExpertsPanel";

type MainTab = "cms" | "users" | "experts";
type CmsView = "list" | "add" | "edit";

export default function AdminDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>("cms");

  // CMS sub-state
  const [cmsView, setCmsView] = useState<CmsView>("list");
  const [editData, setEditData] = useState<ContentItem | null>(null);

  const cmsTitle = useMemo(() => {
    if (cmsView === "add") return "Add Content";
    if (cmsView === "edit") return "Edit Content";
    return "Admin CMS";
  }, [cmsView]);

  const cmsSubtitle = useMemo(() => {
    if (cmsView === "list") return "Manage pages, mental health topics, blogs, and resources.";
    if (cmsView === "add") return "Create new content for the platform.";
    return "Update the selected content item.";
  }, [cmsView]);

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: "cms",     label: "Content (CMS)" },
    { id: "users",   label: "Users"         },
    { id: "experts", label: "Experts"       },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436]">
            Admin Panel
          </h1>
          <p className="text-[#5A6062] mt-1">
            Manage content, users, and experts across SwasthyaManas.
          </p>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-[#E8F0E9] rounded-xl p-1 w-fit shadow-sm">
          {mainTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMainTab(id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                mainTab === id
                  ? "bg-[#7C9A82] text-white shadow-sm"
                  : "text-[#5A6062] hover:text-[#2D3436] hover:bg-[#F0F4F0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CMS TAB ── */}
        {mainTab === "cms" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2D3436]">{cmsTitle}</h2>
                <p className="text-[#5A6062] mt-1 text-sm">{cmsSubtitle}</p>
              </div>
              <Card className="p-2 flex items-center gap-2 w-fit">
                <Button
                  size="sm"
                  variant={cmsView === "list" ? "primary" : "ghost"}
                  onClick={() => { setCmsView("list"); setEditData(null); }}
                  className="rounded-lg"
                >
                  View Content
                </Button>
                <Button
                  size="sm"
                  variant={cmsView === "add" ? "primary" : "ghost"}
                  onClick={() => { setCmsView("add"); setEditData(null); }}
                  className="rounded-lg"
                >
                  Add Content
                </Button>
                {cmsView === "edit" && (
                  <Button size="sm" variant="primary" className="rounded-lg cursor-default" disabled>
                    Edit Mode
                  </Button>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="p-6 md:p-8">
                  {cmsView === "list" && (
                    <AdminContentList
                      onEdit={(data) => { setEditData(data); setCmsView("edit"); }}
                    />
                  )}
                  {(cmsView === "add" || cmsView === "edit") && (
                    <AdminContentForm editData={editData} />
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <h2 className="font-serif text-2xl font-bold text-[#2D3436]">Quick Guide</h2>
                <Card className="p-6">
                  <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-2">How this works</h3>
                  <ul className="text-sm text-[#5A6062] space-y-2 list-disc pl-5">
                    <li>Use <span className="font-medium text-[#2D3436]">View Content</span> to edit existing items.</li>
                    <li>Use <span className="font-medium text-[#2D3436]">Add Content</span> to create new posts/pages.</li>
                    <li>Clicking edit switches you into <span className="font-medium text-[#2D3436]">Edit Mode</span>.</li>
                  </ul>
                </Card>
                {cmsView === "edit" && editData && (
                  <Card className="p-6">
                    <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-2">Currently Editing</h3>
                    <p className="text-sm text-[#5A6062]">
                      Title: <span className="font-medium text-[#2D3436]">{editData.title}</span>
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => { setCmsView("list"); setEditData(null); }}>
                        Back to List
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full"
                        onClick={() => { setCmsView("add"); setEditData(null); }}>
                        Add New
                      </Button>
                    </div>
                  </Card>
                )}
                <Card className="p-6 shadow-none bg-[#FAF7F2] border-[#E8E3DA]">
                  <h3 className="font-serif text-xl font-bold mb-2 text-[#2D3436]">Tip</h3>
                  <p className="text-[#5A6062] text-sm">
                    Keep titles consistent and avoid duplicate topics (e.g., Anxiety vs anxiety).
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {mainTab === "users" && <AdminUsersPanel />}

        {/* ── EXPERTS TAB ── */}
        {mainTab === "experts" && <AdminExpertsPanel />}

      </div>
    </div>
  );
}