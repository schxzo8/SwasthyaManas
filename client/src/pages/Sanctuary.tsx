import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Repeat2 } from "lucide-react";
import API from "../services/api";
import { toast } from "react-hot-toast";

type BreathingExercise = {
  id: number;
  type: string;
  text: string;
  icon: string;
};

export default function Sanctuary() {
  const [exercise, setExercise] = useState<BreathingExercise | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sanctuary-autoplay") || "false");
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(4);

  const audioRef = useRef<HTMLAudioElement>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const countdownRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize Web Audio API fallback
  const initWebAudioFallback = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 432; // Healing frequency
      gain.gain.value = 0.1;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();

      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  };

  // Stop Web Audio fallback
  const stopWebAudioFallback = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      } catch (e) {
        // Already stopped
      }
    }
  };

  // Fetch breathing exercise
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await API.get("/api/mindfulness/prompt/breathing");
        setExercise(res.data);
      } catch (error) {
        toast.error("Failed to load breathing exercise");
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, []);

  // Start breathing animation with proper countdown
  useEffect(() => {
    if (!isPlaying) {
      if (countdownRef.current) clearTimeout(countdownRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      stopWebAudioFallback();
      return;
    }

    const breathSequence = [
      { phase: "inhale" as const, duration: 4000 },
      { phase: "hold" as const, duration: 4000 },
      { phase: "exhale" as const, duration: 4000 },
    ];

    let sequenceIndex = 0;

    const startCountdown = (durationMs: number) => {
      let remaining = durationMs / 1000;
      setBreathCount(remaining);

      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setBreathCount(remaining);
      }, 1000);
    };

    const runBreathCycle = () => {
      const current = breathSequence[sequenceIndex];
      setBreathPhase(current.phase);
      startCountdown(current.duration);

      breathTimerRef.current = setTimeout(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        sequenceIndex = (sequenceIndex + 1) % breathSequence.length;
        runBreathCycle();
      }, current.duration);
    };

    runBreathCycle();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, [isPlaying]);

  // Trigger autoplay on mount and when autoplay setting changes
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    // Only play audio if audioEnabled is true AND autoplay is true
    // Don't check isPlaying because breathing might be active but audio was toggled off
    if (autoplay && audioEnabled) {
      // Small delay to ensure audio element is ready
      timer = setTimeout(() => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Fallback to Web Audio API
            if (!audioContextRef.current) {
              initWebAudioFallback();
            }
            setIsPlaying(true);
          });
        }
      }, 500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoplay, audioEnabled]);

  const handleNewExercise = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/mindfulness/prompt/breathing");
      setExercise(res.data);
    } catch (error) {
      toast.error("Failed to load new exercise");
    } finally {
      setLoading(false);
    }
  };

  const getBreathingCircleSize = () => {
    if (breathPhase === "inhale") return "w-48 h-48";
    if (breathPhase === "hold") return "w-56 h-56";
    return "w-40 h-40";
  };

  const getBreathingColor = () => {
    if (breathPhase === "inhale") return "from-emerald-400 to-emerald-500";
    if (breathPhase === "hold") return "from-blue-400 to-blue-500";
    return "from-purple-400 to-purple-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFAF7] via-white to-[#F9F6F0] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-emerald-200 dark:bg-emerald-900 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFAF7] via-white to-[#F9F6F0] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-6 gap-8">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D3436] dark:text-white mb-2">
          Sanctuary
        </h1>
        <p className="text-sm md:text-base text-[#5A6062] dark:text-slate-400">
          Take a moment to breathe and center yourself
        </p>
      </div>

      {/* Breathing Animation Circle */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getBreathingColor()} opacity-20 rounded-full blur-3xl transition-all duration-1000`}
          style={{
            width: breathPhase === "inhale" ? "200px" : breathPhase === "hold" ? "232px" : "168px",
            height: breathPhase === "inhale" ? "200px" : breathPhase === "hold" ? "232px" : "168px",
          }}
        />

        {/* Main breathing circle */}
        <div
          className={`relative ${getBreathingCircleSize()} bg-gradient-to-br ${getBreathingColor()} rounded-full shadow-2xl flex items-center justify-center transition-all duration-1000 cursor-default`}
        >
          {/* Inner circle */}
          <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full opacity-10"></div>

          {/* Center text */}
          <div className="relative z-10 text-center">
            <p className="text-5xl md:text-6xl font-bold text-white opacity-90 mb-2">{breathCount}</p>
            <p className="text-white text-sm md:text-base font-medium opacity-80 capitalize">{breathPhase}</p>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full"
              style={{
                left: `${50 + 40 * Math.cos((i * Math.PI) / 3)}%`,
                top: `${50 + 40 * Math.sin((i * Math.PI) / 3)}%`,
                animation:
                  breathPhase === "inhale"
                    ? `float-out 4s ease-out infinite`
                    : breathPhase === "hold"
                      ? `float-stay 4s ease-in-out infinite`
                      : `float-in 4s ease-in infinite`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Exercise Text */}
      {exercise && (
        <div className="text-center max-w-md mb-6">
          <p className="text-3xl mb-4">{exercise.icon}</p>
          <p className="text-lg md:text-xl text-[#2D3436] dark:text-white font-medium leading-relaxed">
            {exercise.text}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 items-center">
        {/* Play/Pause Button */}
        <button
          onClick={() => {
            if (isPlaying) {
              audioRef.current?.pause();
              stopWebAudioFallback();
              setIsPlaying(false);
            } else {
              // Try to play HTML audio first
              if (audioRef.current) {
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                  })
                  .catch(() => {
                    // Fallback to Web Audio API
                    if (!audioContextRef.current) {
                      initWebAudioFallback();
                    }
                    setIsPlaying(true);
                  });
              } else {
                // No audio element, use fallback
                if (!audioContextRef.current) {
                  initWebAudioFallback();
                }
                setIsPlaying(true);
              }
            }
          }}
          className="p-4 bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-600 dark:to-emerald-700 hover:shadow-lg rounded-full text-white transition-all duration-200 hover:scale-110"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* New Exercise Button */}
        <button
          onClick={handleNewExercise}
          className="p-4 border-2 border-[#7C9A82] dark:border-emerald-600 hover:bg-[#7C9A82] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-[#7C9A82] dark:text-emerald-400 rounded-full transition-all duration-200"
          title="Get a new exercise"
        >
          <Repeat2 size={24} />
        </button>
      </div>

      {/* Settings */}
      <div className="mt-12 w-full max-w-md space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-[#E8E8E8] dark:border-slate-700">
          {/* Audio Toggle */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#E8E8E8] dark:border-slate-700">
            <div className="flex items-center gap-3">
              {audioEnabled ? (
                <Volume2 size={20} className="text-[#7C9A82] dark:text-emerald-400" />
              ) : (
                <VolumeX size={20} className="text-[#C0A0B0]" />
              )}
              <span className="text-sm font-medium text-[#2D3436] dark:text-white">Calming Audio</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={() => {
                  const newAudioEnabled = !audioEnabled;
                  setAudioEnabled(newAudioEnabled);
                  
                  if (!newAudioEnabled) {
                    // Turning audio OFF - stop all audio but keep breathing
                    audioRef.current?.pause();
                    stopWebAudioFallback();
                  } else {
                    // Turning audio ON - start playing immediately
                    if (audioRef.current) {
                      audioRef.current.play().then(() => {
                        setIsPlaying(true);
                      }).catch(() => {
                        // Fallback to Web Audio API
                        if (!audioContextRef.current) {
                          initWebAudioFallback();
                        }
                        setIsPlaying(true);
                      });
                    } else {
                      // No audio element available, use fallback
                      if (!audioContextRef.current) {
                        initWebAudioFallback();
                      }
                      setIsPlaying(true);
                    }
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C9A82] dark:peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Autoplay Toggle */}
          {audioEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2D3436] dark:text-white">Autoplay</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={() => {
                    const newAutoplay = !autoplay;
                    setAutoplay(newAutoplay);
                    localStorage.setItem("sanctuary-autoplay", JSON.stringify(newAutoplay));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C9A82] dark:peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-[#9CA3AF] dark:text-slate-500">
            🌿 Breathe deeply. You're safe here.
          </p>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="/audio.mp3"
        loop
        onEnded={() => {
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
      />

      {/* Floating Animation Styles */}
      <style>{`
        @keyframes float-out {
          0% {
            opacity: 0.8;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(1.2);
          }
        }

        @keyframes float-stay {
          0%, 100% {
            opacity: 0.6;
            transform: translate(0, 0);
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes float-in {
          0% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(1.2);
          }
          100% {
            opacity: 0.8;
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
