import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { Button } from "../components/Button";

interface Prompt {
  id: number;
  type: string;
  text: string;
  icon: string;
}

export default function MindfulnessBell() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [bellRung, setBellRung] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("random");

  const promptTypes = [
    { id: "random", label: "Random", icon: "🎲" },
    { id: "affirmation", label: "Affirmation", icon: "💝" },
    { id: "breathing", label: "Breathing", icon: "🫁" },
    { id: "grounding", label: "Grounding", icon: "🌍" },
    { id: "body-scan", label: "Body Scan", icon: "🧘" },
    { id: "gratitude", label: "Gratitude", icon: "🙏" },
    { id: "mindfulness", label: "Mindfulness", icon: "👁️" },
    { id: "movement", label: "Movement", icon: "🚶" },
  ];

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async (type?: string) => {
    setLoading(true);
    try {
      let res;
      if (type && type !== "random") {
        res = await API.get(`/api/mindfulness/prompt/${type}`);
      } else {
        res = await API.get("/api/mindfulness/prompt");
      }
      setPrompt(res.data);
      setBellRung(false);
    } catch (err) {
      toast.error("Failed to fetch mindfulness prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleBellRing = async () => {
    setBellRung(true);
    
    // Play bell sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 528; // Healing frequency
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);

    // Log the bell click
    try {
      await API.post("/api/mindfulness/bell-click");
    } catch (err) {
      console.error("Failed to log bell click");
    }

    // Show encouragement
    toast.success("Take a moment to breathe 🫁");
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type === "random") {
      fetchPrompt();
    } else {
      fetchPrompt(type);
    }
  };

  const typeColor: { [key: string]: string } = {
    affirmation: "from-pink-400 to-rose-600",
    breathing: "from-blue-400 to-cyan-600",
    grounding: "from-green-400 to-emerald-600",
    "body-scan": "from-purple-400 to-indigo-600",
    gratitude: "from-yellow-400 to-orange-600",
    mindfulness: "from-teal-400 to-cyan-600",
    movement: "from-orange-400 to-red-600",
    random: "from-[#7C9A82] to-[#5A7A60]",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FCFAF7] to-[#F9F6F0] dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#2D3436] dark:text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-[#2D3436] dark:text-white">Mindfulness Bell</h1>
            <p className="text-[#6B7280] dark:text-slate-400">Take a moment for yourself</p>
          </div>
        </div>

        {/* Main Bell Section */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="w-full max-w-sm">
            {/* Bell Button */}
            <button
              onClick={handleBellRing}
              disabled={loading}
              className={`w-full h-64 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center text-6xl mb-8 ${
                bellRung
                  ? "bg-gradient-to-br from-yellow-300 to-yellow-500 scale-95"
                  : `bg-gradient-to-br ${typeColor[selectedType]} hover:shadow-xl`
              }`}
            >
              🔔
            </button>

            {/* Prompt Display */}
            {prompt && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#E8F0E9] dark:border-slate-700 shadow-2xl mb-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">{prompt.icon}</div>
                  <div className="text-sm font-semibold text-[#7C9A82] dark:text-emerald-400 mb-3 capitalize">
                    {prompt.type}
                  </div>
                  <p className="text-xl font-semibold text-[#2D3436] dark:text-white leading-relaxed">
                    {prompt.text}
                  </p>
                </div>
              </div>
            )}

            {/* Get New Prompt */}
            <Button
              onClick={() => fetchPrompt(selectedType === "random" ? undefined : selectedType)}
              disabled={loading}
              className="w-full mb-8 bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] text-white font-semibold py-3 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "New Prompt"}
            </Button>
          </div>
        </div>

        {/* Prompt Type Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E8F0E9] dark:border-slate-700 shadow-2xl">
          <p className="text-sm font-semibold text-[#2D3436] dark:text-white mb-4">Choose a category:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {promptTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`p-4 rounded-xl transition-all text-center font-semibold ${
                  selectedType === type.id
                    ? `bg-gradient-to-br ${typeColor[type.id]} text-white shadow-lg`
                    : "bg-[#F9F6F0] dark:bg-slate-700 text-[#2D3436] dark:text-white hover:bg-[#E8F0E9] dark:hover:bg-slate-600"
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-emerald-50 dark:to-emerald-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-[#2D3436] dark:text-white mb-3">💡 How to use the Mindfulness Bell</h3>
          <div className="space-y-2 text-sm text-[#5A6062] dark:text-slate-300">
            <p>✨ Ring the bell whenever you need a mindful moment</p>
            <p>🎯 Choose a category that resonates with your current state</p>
            <p>🕐 Take 2-5 minutes to follow the prompt</p>
            <p>🌟 The more you engage, the better your mental wellbeing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
