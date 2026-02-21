import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import type { ContentItem } from "../types";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Search, RefreshCcw, FileText, Trash2, Pencil } from "lucide-react";

interface AdminContentListProps {
  onEdit: (item: ContentItem) => void;
}

function badgeText(item: ContentItem) {
  if (item.contentType === "page") {
    return `PAGE • ${(item.pageType || "").toUpperCase() || "—"}`;
  }
  if (item.contentType === "mental_health") {
    return `MENTAL HEALTH • ${item.topic || "—"}`;
  }
  return item.contentType.toUpperCase(); // BLOG / RESOURCE
}

function fmtDateTime(dateIso?: string) {
  if (!dateIso) return "—";
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

function preview(text?: string, max = 220) {
  const t = (text || "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export default function AdminContentList({ onEdit }: AdminContentListProps) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const token = localStorage.getItem("token");

  const fetchContent = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await API.get("/api/content/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = (res.data || []). sort(
        (a: any, b: any) =>
          new Date(b.createdAt || 0).getTime()-
          new Date(a.createdAt || 0).getTime()
      );
      setContents(sorted);
    } catch (e) {
      console.error("Failed to fetch content", e);
      setErr("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteContent = async (id: string) => {
    const ok = window.confirm("Delete this content permanently?");
    if (!ok) return;

    try {
      await API.delete(`/api/content/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // optimistic remove
      setContents((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return contents;

    return contents.filter((c) => {
      const hay = [
        c.title,
        c.body,
        c.contentType,
        c.pageType,
        c.topic,
        c.published === false ? "draft unpublished" : "published",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [contents, q]);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2D3436]">All Content</h2>
          <p className="text-sm text-[#5A6062] mt-1">
            {loading ? "Loading…" : `${filtered.length} item(s)`}
            {q.trim() ? ` • Filtered` : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContent}
            isLoading={loading}
            className="rounded-lg"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#7C9A82]">
            <Search size={18} />
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, body, type, topic…"
            className="w-full bg-transparent outline-none text-sm text-[#2D3436] placeholder:text-[#9CA3AF]"
          />
        </div>
      </Card>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-[#5A6062]">
            No content found. Try clearing search or add new content.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {filtered.map((item) => (
            <Card
              key={item._id}
              hover
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#7C9A82]">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-[#2D3436] truncate">
                      {item.title || "Untitled"}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-medium text-[#5A7A60] border border-[#E8F0E9]">
                        {badgeText(item)}
                      </span>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          item.published === false
                            ? "bg-white text-[#8B6B2E] border-[#E8E3DA]"
                            : "bg-[#E8F0E9] text-[#2D3436] border-[#E8F0E9]"
                        }`}
                      >
                        {item.published === false ? "Draft" : "Published"}
                      </span>

                      <span className="text-xs text-[#9CA3AF]">
                        Created: {fmtDateTime(item.createdAt)}
                      </span>
                    </div>

                    {item.body && (
                      <p className="mt-3 text-sm text-[#5A6062]">
                        {preview(item.body, 260)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex md:flex-col gap-2 md:min-w-[170px]">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onEdit(item)}
                    className="rounded-lg w-full"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteContent(item._id)}
                    className="rounded-lg w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
