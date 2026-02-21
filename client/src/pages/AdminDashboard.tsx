import { useMemo, useState } from "react";
import AdminContentList from "./AdminContentList";
import AdminContentForm from "./AdminContentForm";
import type { ContentItem } from "../types";

import { Card } from "../components/Card";
import { Button } from "../components/Button";

type View = "list" | "add" | "edit";

export default function AdminDashboard() {
  const [view, setView] = useState<View>("list");
  const [editData, setEditData] = useState<ContentItem | null>(null);

  const title = useMemo(() => {
    if (view === "add") return "Add Content";
    if (view === "edit") return "Edit Content";
    return "Admin CMS";
  }, [view]);

  const subtitle = useMemo(() => {
    if (view === "list") return "Manage pages, mental health topics, blogs, and resources.";
    if (view === "add") return "Create new content for the platform.";
    return "Update the selected content item.";
  }, [view]);

  const goList = () => {
    setView("list");
    setEditData(null);
  };

  const goAdd = () => {
    setView("add");
    setEditData(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436]">
              {title}
            </h1>
            <p className="text-[#5A6062] mt-1">{subtitle}</p>
          </div>

          {/* Tab Pills */}
          <Card className="p-2 flex items-center gap-2 w-fit">
            <Button
              size="sm"
              variant={view === "list" ? "primary" : "ghost"}
              onClick={goList}
              className="rounded-lg"
            >
              View Content
            </Button>

            <Button
              size="sm"
              variant={view === "add" ? "primary" : "ghost"}
              onClick={goAdd}
              className="rounded-lg"
            >
              Add Content
            </Button>

            {view === "edit" && (
              <Button
                size="sm"
                variant="primary"
                className="rounded-lg cursor-default"
                disabled
              >
                Edit Mode
              </Button>
            )}
          </Card>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8">
              {view === "list" && (
                <AdminContentList
                  onEdit={(data) => {
                    setEditData(data);
                    setView("edit");
                  }}
                />
              )}

              {(view === "add" || view === "edit") && (
                <AdminContentForm editData={editData} />
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#2D3436]">
              Quick Guide
            </h2>

            <Card className="p-6">
              <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-2">
                How this works
              </h3>
              <ul className="text-sm text-[#5A6062] space-y-2 list-disc pl-5">
                <li>
                  Use <span className="font-medium text-[#2D3436]">View Content</span> to edit existing items.
                </li>
                <li>
                  Use <span className="font-medium text-[#2D3436]">Add Content</span> to create new posts/pages.
                </li>
                <li>
                  Clicking edit switches you into <span className="font-medium text-[#2D3436]">Edit Mode</span>.
                </li>
              </ul>
            </Card>

            {view === "edit" && editData && (
              <Card className="p-6">
                <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-2">
                  Currently Editing
                </h3>
                <p className="text-sm text-[#5A6062]">
                  Title:{" "}
                  <span className="font-medium text-[#2D3436]">
                    {editData.title}
                  </span>
                </p>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={goList}>
                    Back to List
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full" onClick={goAdd}>
                    Add New
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-6 shadow-none bg-[#FAF7F2] border-[#E8E3DA]">
              <h3 className="font-serif text-xl font-bold mb-2 text-[#2D3436]">
                Tip
              </h3>
              <p className="text-[#5A6062] text-sm">
                Keep titles consistent and avoid duplicate topics (e.g., Anxiety vs anxiety).
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
