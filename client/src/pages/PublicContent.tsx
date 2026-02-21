import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Info,
  FileText,
  AlertCircle,
  Loader2,
  Brain,
  Tag,
} from "lucide-react";
import API from "../services/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { BlobDecoration } from "../components/BlobDecoration";

type ContentType = "page" | "resource" | "blog" | "mental_health";
type PageType = "about" | "services" | "faq" | "meditation";

interface ContentItem {
  _id: string;
  title: string;
  body: string;
  contentType?: ContentType; // ✅ backend might send missing -> be defensive
  pageType?: PageType | null;
  topic?: string | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type ActiveType = "all" | ContentType;

export default function PublicContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeType, setActiveType] = useState<ActiveType>("all");
  const [activeTopic, setActiveTopic] = useState<string>("all");

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/api/content");
      const list: ContentItem[] = Array.isArray(res.data) ? res.data : [];
      // ✅ extra safety: only published content
      setContent(list.filter((x) => x.published !== false));
    } catch (err) {
      console.error(err);
      setError("Unable to load content at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Normalize topic so "Anxiety", " anxiety ", "ANXIETY" become one
  const normalizeTopic = (t: string) => t.trim();

  // Build topic list from DB (only from mental_health content)
  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const item of content) {
      const type = item.contentType;
      const t = item.topic;
      if (type === "mental_health" && t && t.trim()) {
        set.add(normalizeTopic(t));
      }
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [content]);

  // Reset topic whenever you leave mental_health tab
  useEffect(() => {
    if (activeType !== "mental_health") setActiveTopic("all");
  }, [activeType]);

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const type = item.contentType;

      // if backend accidentally sends no contentType, show it only on "all"
      const typeOk =
        activeType === "all"
          ? true
          : type === activeType;

      const topicOk =
        activeType !== "mental_health"
          ? true
          : activeTopic === "all"
            ? true
            : normalizeTopic(item.topic || "") === activeTopic;

      return typeOk && topicOk;
    });
  }, [content, activeType, activeTopic]);

  const getBadgeStyle = (type: ContentType) => {
    switch (type) {
      case "page":
        return "bg-[#E8F0E9] text-[#5A7A60]";
      case "resource":
        return "bg-[#F0EBE3] text-[#8B7355]";
      case "blog":
        return "bg-[#E8E4F0] text-[#6B5B8D]";
      case "mental_health":
        return "bg-[#EAF2FF] text-[#3B5B8A]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getBadgeIcon = (type: ContentType) => {
    switch (type) {
      case "page":
        return <Info size={14} className="mr-1" />;
      case "resource":
        return <BookOpen size={14} className="mr-1" />;
      case "blog":
        return <FileText size={14} className="mr-1" />;
      case "mental_health":
        return <Brain size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const typeFilters: { id: ActiveType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "mental_health", label: "Mental Health" },
    { id: "resource", label: "Resources" },
    { id: "blog", label: "Blog" },
    { id: "page", label: "Pages" },
  ];

  const prettyType = (t?: ContentType) => {
    if (!t) return "Content";
    if (t === "mental_health") return "Mental Health";
    if (t === "page") return "Page";
    if (t === "resource") return "Resource";
    return "Blog";
  };

  const prettyActive = (t: ActiveType) => {
    if (t === "all") return "all";
    return prettyType(t);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 relative overflow-hidden">
      <BlobDecoration
        variant={1}
        className="top-0 right-0 w-[600px] h-[600px] text-[#E8F0E9] opacity-60"
      />
      <BlobDecoration
        variant={3}
        className="bottom-0 left-0 w-[500px] h-[500px] text-[#E8F0E9] opacity-40"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D3436] mb-3">
            Wellness Library
          </h1>
          <p className="text-lg text-[#5A6062] max-w-2xl mx-auto">
            Curated mental health topics, resources, and articles.
          </p>

          <div className="mt-6">
            <Button variant="outline" size="sm" onClick={fetchContent}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveType(filter.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition
                ${
                  activeType === filter.id
                    ? "bg-[#7C9A82] text-white shadow-md"
                    : "bg-white border border-[#E8F0E9] text-[#5A6062] hover:border-[#7C9A82]"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Topic filter (only when mental_health is active) */}
        {activeType === "mental_health" && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-10">
            <div className="flex items-center gap-2 text-sm text-[#5A6062]">
              <Tag size={16} />
              <span className="font-medium">Topic:</span>
            </div>

            <select
              value={activeTopic}
              onChange={(e) => setActiveTopic(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#E8F0E9] bg-white text-sm text-[#2D3436]"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All topics" : t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-10 w-10 text-[#7C9A82] animate-spin mb-4" />
            <p className="text-[#5A6062]">Loading content...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <p className="text-[#5A6062] mb-4">{error}</p>
            <Button onClick={fetchContent} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-xl border">
            <Search className="h-12 w-12 text-[#C4B5A0] mx-auto mb-4" />
            <p className="text-[#5A6062]">
              No content found in {prettyActive(activeType)}
              {activeType === "mental_health" && activeTopic !== "all"
                ? ` → ${activeTopic}`
                : ""}
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContent.map((item) => {
              const type = item.contentType ?? "resource"; // fallback
              return (
                <Card
                  key={item._id}
                  className="h-full flex flex-col hover:shadow-lg transition border"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyle(
                          type
                        )}`}
                      >
                        {getBadgeIcon(type)}
                        {prettyType(type)}
                      </span>

                      {type === "page" && item.pageType && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#E8F0E9] text-[#5A6062]">
                          {String(item.pageType).toUpperCase()}
                        </span>
                      )}

                      {type === "mental_health" && item.topic && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#E8F0E9] text-[#5A6062]">
                          {normalizeTopic(item.topic)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#2D3436] mb-3">
                      {item.title}
                    </h3>

                    <p className="text-[#5A6062] text-sm flex-grow line-clamp-4">
                      {item.body}
                    </p>

                    <div className="mt-6 pt-4 border-t text-sm text-[#7C9A82] font-medium">
                      Read more →
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
