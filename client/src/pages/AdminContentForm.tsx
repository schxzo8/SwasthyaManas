import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import type { ContentItem, ContentType, PageType } from "../types";

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

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // preload edit data
  useEffect(() => {
    setMsg("");
    setErr("");

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
    setMsg("");
    setErr("");

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
    setErr("");
    setMsg("");

    if (!canSave) {
      setErr("Please fill required fields.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (isEdit && editData?._id) {
        const res = await API.put(`/api/content/${editData._id}`, payload);
        setMsg(res.data?.message || "Content updated.");
      } else {
        const res = await API.post(`/api/content`, payload);
        setMsg(res.data?.message || "Content created.");
        // clear after add
        setTitle("");
        setBody("");
        setContentType("page");
        setPageType("about");
        setTopic("");
        setPublished(true);
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>{isEdit ? "Edit Content" : "Add Content"}</h2>

      {err && (
        <p style={{ color: "red", marginTop: 12 }}>
          {err}
        </p>
      )}
      {msg && (
        <p style={{ color: "green", marginTop: 12 }}>
          {msg}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Content Type *</div>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            >
              <option value="page">Page</option>
              <option value="mental_health">Mental Health Topic</option>
              <option value="resource">Resource</option>
              <option value="blog">Blog</option>
            </select>
          </label>

          {contentType === "page" && (
            <label>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Page Type *</div>
              <select
                value={pageType}
                onChange={(e) => setPageType(e.target.value as PageType)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              >
                {PAGE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          )}

          {contentType === "mental_health" && (
            <label>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Topic *</div>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Anxiety, ADHD, Depression..."
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
              <small style={{ color: "#666" }}>
                Tip: Keep topics consistent (Anxiety vs anxiety). You can standardize later.
              </small>
            </label>
          )}

          <label>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Title *</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </label>

          <label>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Body *</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Published</span>
          </label>

          <button
            type="submit"
            disabled={!canSave || saving}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: !canSave || saving ? "#999" : "#003f35",
              color: "#fff",
              cursor: !canSave || saving ? "not-allowed" : "pointer",
              width: 180,
            }}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
