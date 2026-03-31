import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Button } from "../components/Button";

type MoodType = "excellent" | "good" | "neutral" | "sad" | "stressed";

interface MoodEntry {
  _id: string;
  mood: MoodType;
  intensity: number;
  notes: string;
  date: string;
}

export default function MoodTracker() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const moods: { type: MoodType; emoji: string; label: string; color: string; tips: string[] }[] = [
    {
      type: "excellent",
      emoji: "🤩",
      label: "Excellent",
      color: "from-green-400 to-emerald-600",
      tips: [
        "💡 Share your joy with others",
        "📝 Write down what made today great",
        "🎯 Set new goals while motivated",
      ],
    },
    {
      type: "good",
      emoji: "😊",
      label: "Good",
      color: "from-blue-400 to-cyan-600",
      tips: [
        "💪 Maintain this positive momentum",
        "🤝 Connect with someone you care about",
        "🎨 Do something creative",
      ],
    },
    {
      type: "neutral",
      emoji: "😐",
      label: "Neutral",
      color: "from-yellow-400 to-orange-500",
      tips: [
        "🧘 Try a short meditation or breathing exercise",
        "🚶 Take a walk and notice your surroundings",
        "📚 Read something uplifting",
      ],
    },
    {
      type: "sad",
      emoji: "😔",
      label: "Sad",
      color: "from-blue-600 to-blue-800",
      tips: [
        "🎵 Listen to music that resonates with your feelings",
        "📞 Reach out to someone you trust",
        "🌧️ Allow yourself to feel, it's okay",
      ],
    },
    {
      type: "stressed",
      emoji: "😰",
      label: "Stressed",
      color: "from-red-400 to-pink-600",
      tips: [
        "🫁 Practice the 4-7-8 breathing technique",
        "📋 Break tasks into smaller steps",
        "⏸️ Take a 5-minute break",
      ],
    },
  ];

  useEffect(() => {
    fetchTodayMood();
    fetchTrackerStats();
    fetchHistory();
  }, []);

  const fetchTodayMood = async () => {
    try {
      const res = await API.get("/api/mood/today");
      if (res.data) {
        setTodayMood(res.data);
        setSelectedMood(res.data.mood);
        setIntensity(res.data.intensity);
        setNotes(res.data.notes || "");
      }
    } catch (err) {
      console.error("Failed to fetch today's mood");
    }
  };

  const fetchTrackerStats = async () => {
    try {
      setStatsLoading(true);
      const res = await API.get("/api/mood/tracker-stats");
      console.log("Tracker stats response:", res.data);
      setStreak(res.data.streak);
      setTotalEntries(res.data.totalEntries);
      setPoints(res.data.points);
    } catch (err: any) {
      console.error("Failed to fetch tracker stats:", err?.response?.data || err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/api/mood/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/mood", {
        mood: selectedMood,
        intensity,
        notes,
      });

      toast.success("Mood saved successfully!");
      setTodayMood(res.data.moodEntry);
      fetchTrackerStats();
      fetchHistory();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save mood");
    } finally {
      setLoading(false);
    }
  };

  const currentMoodData = moods.find((m) => m.type === selectedMood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FCFAF7] to-[#F9F6F0] dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#2D3436] dark:text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-[#2D3436] dark:text-white">Daily Mood Tracker</h1>
            <p className="text-[#6B7280] dark:text-slate-400">Check in with yourself and track your emotional journey</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E8F0E9] dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Flame size={20} className="text-red-500" />
              <span className="text-sm text-[#6B7280] dark:text-slate-400">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-[#2D3436] dark:text-white">
              {statsLoading ? "..." : `${streak} days`}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E8F0E9] dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-[#7C9A82]" />
              <span className="text-sm text-[#6B7280] dark:text-slate-400">Total Entries</span>
            </div>
            <p className="text-3xl font-bold text-[#2D3436] dark:text-white">
              {statsLoading ? "..." : totalEntries}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E8F0E9] dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🏆</span>
              <span className="text-sm text-[#6B7280] dark:text-slate-400">Points</span>
            </div>
            <p className="text-3xl font-bold text-[#2D3436] dark:text-white">
              {statsLoading ? "..." : points}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#E8F0E9] dark:border-slate-700 shadow-2xl">
          {/* Mood Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2D3436] dark:text-white mb-6">How are you feeling today?</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className={`p-6 rounded-2xl transition-all transform hover:scale-105 ${
                    selectedMood === mood.type
                      ? `bg-gradient-to-br ${mood.color} text-white shadow-xl scale-105`
                      : "bg-[#F9F6F0] dark:bg-slate-700 text-[#2D3436] dark:text-white hover:shadow-lg"
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-semibold">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="mb-8 p-6 bg-gradient-to-r from-[#FAF7F2] dark:from-slate-700 to-[#F5F2EC] dark:to-slate-600 rounded-2xl">
            <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-4">
              Intensity: {intensity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-3 bg-[#E8F0E9] dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-[#7C9A82]"
            />
            <div className="flex justify-between text-xs text-[#6B7280] dark:text-slate-400 mt-2">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-3">
              Add a note (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind? What triggered this feeling?"
              className="w-full h-24 p-4 border border-[#D4CCBF] dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-[#2D3436] dark:text-white placeholder-[#9CA3AF] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveMood}
            disabled={loading || !selectedMood}
            className="w-full bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white font-semibold py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : todayMood ? "Update Mood" : "Save Mood"}
          </Button>

          {/* Tips */}
          {currentMoodData && selectedMood && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-emerald-50 dark:to-emerald-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-[#2D3436] dark:text-white mb-3">💡 Suggestions for {currentMoodData.label}</h3>
              <div className="space-y-2">
                {currentMoodData.tips.map((tip, i) => (
                  <p key={i} className="text-sm text-[#5A6062] dark:text-slate-300">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#E8F0E9] dark:border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#2D3436] dark:text-white mb-6">Recent History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.slice(0, 10).map((entry) => {
                const mood = moods.find((m) => m.type === entry.mood);
                return (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-4 bg-[#F9F6F0] dark:bg-slate-700 rounded-xl border border-[#E8F0E9] dark:border-slate-600"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{mood?.emoji}</span>
                      <div>
                        <p className="font-semibold text-[#2D3436] dark:text-white">{mood?.label}</p>
                        <p className="text-xs text-[#6B7280] dark:text-slate-400">
                          {new Date(entry.date).toLocaleDateString() || "Today"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#7C9A82] dark:text-emerald-400">{entry.intensity}/10</p>
                      {entry.notes && <p className="text-xs text-[#6B7280] dark:text-slate-400 max-w-xs truncate">{entry.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
