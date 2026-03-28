import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import type { ContentItem, ContentType, PageType } from "../types";
import { toast } from "react-hot-toast";

type Props = {
  editData: ContentItem | null;
};

const PAGE_TYPES: PageType[] = ["about", "services", "faq", "meditation"];

export default function AdminContentForm({ editData }: Props) {
  const isEdit = !!editData;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [contentType, setContentType] = useState<ContentType>("page");
  const [pageType, setPageType] = useState<PageType | "">("");
  const [topic, setTopic] = useState("");

  const [published, setPublished] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editData) {
      setTitle("");
      setBody("");
      setContentType("page");
      setPageType("about");
      setTopic("");
      setPublished(true);
      return;
    }

    setTitle(editData.title || "");
    setBody(editData.body || "");
    setContentType(editData.contentType || "page");
    setPageType((editData.pageType as PageType) || "");
    setTopic(editData.topic || "");
    setPublished(editData.published !== false);
  }, [editData]);

  // When switching contentType: clean incompatible fields
  useEffect(() => {
    if (contentType === "page") {
      setTopic("");
      if (!pageType) setPageType("about");
    } else if (contentType === "mental_health") {
      setPageType("");
    } else {
      // blog/resource
      setPageType("");
      setTopic("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType]);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (!body.trim()) return false;

    if (contentType === "page") return !!pageType;
    if (contentType === "mental_health") return !!topic.trim();

    return true;
  }, [title, body, contentType, pageType, topic]);

  const buildPayload = () => {
    const base = {
      title: title.trim(),
      body: body.trim(),
      contentType,
      published,
      pageType: null as PageType | null,
      topic: null as string | null,
    };

    if (contentType === "page") {
      base.pageType = (pageType || null) as PageType | null;
    }

    if (contentType === "mental_health") {
      base.topic = topic.trim();
    }

    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSave) {
      toast.error("Please fill required fields.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (isEdit && editData?._id) {
        await API.put(`/api/content/${editData._id}`, payload);
        toast.success("Content updated successfully.");
      } else {
        await API.post(`/api/content`, payload);
        toast.success("Content created successfully.");
        // clear after add
        setTitle("");
        setBody("");
        setContentType("page");
        setPageType("about");
        setTopic("");
        setPublished(true);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">
        {isEdit ? "Edit Content" : "Add Content"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8F0E9] p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
              Content Type *
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-4 py-2 border border-[#D5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C9A82] transition-all bg-white"
            >
              <option value="page">Page</option>
              <option value="mental_health">Mental Health Topic</option>
              <option value="resource">Resource</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          {contentType === "page" && (
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                Page Type *
              </label>
              <select
                value={pageType}
                onChange={(e) => setPageType(e.target.value as PageType)}
                className="w-full px-4 py-2 border border-[#D5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C9A82] transition-all bg-white"
              >
                {PAGE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {contentType === "mental_health" && (
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                Topic *
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Anxiety, ADHD, Depression..."
                className="w-full px-4 py-2 border border-[#D5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C9A82] transition-all"
              />
              <p className="text-xs text-[#999] mt-1">
                💡 Tip: Keep topics consistent (Anxiety vs anxiety). You can standardize later.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-[#D5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C9A82] transition-all"
              placeholder="Enter content title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
              Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-[#D5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C9A82] transition-all resize-vertical font-mono text-sm"
              placeholder="Enter content body (Markdown supported)"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-[#7C9A82] cursor-pointer rounded"
            />
            <label htmlFor="published" className="text-sm font-medium text-[#1a1a1a] cursor-pointer">
              Published
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E8F0E9]">
            <button
              type="submit"
              disabled={!canSave || saving}
              className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                !canSave || saving
                  ? "bg-[#D5E3DB] text-[#999] cursor-not-allowed"
                  : "bg-[#7C9A82] hover:bg-[#6a8370] text-white cursor-pointer"
              }`}
            >
              {saving ? "Saving..." : isEdit ? "Update Content" : "Create Content"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
