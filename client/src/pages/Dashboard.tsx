import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import type { User } from "../types";

import { Card } from "../components/Card";
import { Button } from "../components/Button";

import {
  Calendar,
  TrendingUp,
  Award,
  Clock,
  FileText,
  Users as UsersIcon,
} from "lucide-react";

type AssessmentResult = {
  _id: string;
  assessmentType: "PHQ-9" | "GAD-7";
  totalScore: number;
  severity: "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe";
  createdAt: string;
};

type ConsultationUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise?: string;
};

type ConsultationRequest = {
  _id: string;
  user: ConsultationUser; // populated in expert route
  expert: ConsultationUser; // populated in user route
  reason: string;
  status: "pending" | "accepted" | "rejected" | "closed";
  expertReply?: string;
  createdAt: string;
};

function severityToWellness(sev: string): number {
  const map: Record<string, number> = {
    Minimal: 9,
    Mild: 7,
    Moderate: 5,
    "Moderately Severe": 3,
    Severe: 2,
  };
  return map[sev] ?? 6;
}

function calcAvgWellness(history: AssessmentResult[]) {
  if (!history.length) return 0;
  const vals = history.slice(0, 10).map((h) => severityToWellness(h.severity));
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}

function calcStreakDays(history: AssessmentResult[]) {
  if (!history.length) return 0;

  const unique = Array.from(
    new Set(history.map((h) => new Date(h.createdAt).toDateString()))
  )
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (!unique.length) return 0;

  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const diffDays =
      (unique[i].getTime() - unique[i + 1].getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 1 && diffDays < 2) streak++;
    else break;
  }
  return streak;
}

function fmtDateTime(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleString();
  } catch {
    return dateIso;
  }
}

function getBookingState(consultations: ConsultationRequest[]) {
  const latest = [...consultations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (!latest) return { state: "none" as const, latest: null };

  if (latest.status === "accepted") return { state: "confirmed" as const, latest };
  if (latest.status === "pending") return { state: "pending" as const, latest };
  if (latest.status === "rejected") return { state: "rejected" as const, latest };
  if (latest.status === "closed") return { state: "closed" as const, latest };

  return { state: "none" as const, latest };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  

  useEffect(() => {
    const run = async () => {
      try {
        const meRes = await API.get("/api/users/me");
        const me: User = meRes.data;
        setUser(me);

        const aRes = await API.get("/api/assessments/my");
        setAssessments(aRes.data || []);

        const cUrl = me.role === "expert" ? "/api/consultations/expert" : "/api/consultations/my";
        const cRes = await API.get(cUrl);
        setConsultations(cRes.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, []);

  const stats = useMemo(() => {
    const isExpert = user?.role === "expert";

    if (isExpert) {
      const total = consultations.length;
      const pending = consultations.filter((c) => c.status === "pending").length;
      const accepted = consultations.filter((c) => c.status === "accepted").length;
      const closed = consultations.filter((c) => c.status === "closed").length;

      return [
        { label: "Total Requests", value: String(total), icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-100" },
        { label: "Pending", value: String(pending), icon: Clock, color: "text-purple-500", bg: "bg-purple-100" },
        { label: "Accepted", value: String(accepted), icon: Award, color: "text-green-500", bg: "bg-green-100" },
        { label: "Closed", value: String(closed), icon: FileText, color: "text-orange-500", bg: "bg-orange-100" },
      ];
    }

    const screeningsCompleted = assessments.length;
    const avgWellness = calcAvgWellness(assessments);
    const streakDays = calcStreakDays(assessments);
    const pendingCount = consultations.filter((c) => c.status === "pending").length;

    return [
      { label: "Screenings Completed", value: String(screeningsCompleted), icon: FileText, color: "text-blue-500", bg: "bg-blue-100" },
      { label: "Avg Wellness", value: String(avgWellness || 0), icon: TrendingUp, color: "text-green-500", bg: "bg-green-100" },
      { label: "Streak Days", value: String(streakDays), icon: Award, color: "text-orange-500", bg: "bg-orange-100" },
      { label: "Requests Pending", value: String(pendingCount), icon: Clock, color: "text-purple-500", bg: "bg-purple-100" },
    ];
  }, [assessments, consultations, user?.role]);

  const recentActivity = useMemo(() => {
    const assessmentItems = assessments.map((a) => ({
      kind: "Assessment" as const,
      title: `${a.assessmentType} Screening`,
      date: a.createdAt,
      badge: a.severity,
    }));

    const consultationItems = consultations.map((c) => {
      const person =
        user?.role === "expert"
          ? `${c.user?.firstName ?? "User"} ${c.user?.lastName ?? ""}`.trim()
          : `${c.expert?.firstName ?? "Expert"} ${c.expert?.lastName ?? ""}`.trim();

      return {
        kind: "Consultation" as const,
        title: person || "Consultation Request",
        date: c.createdAt,
        badge: c.status,
      };
    });

    const merged = [...assessmentItems, ...consultationItems].sort(
      (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
    );

    return merged.slice(0, 3).map((x) => ({
      type: x.kind,
      title: x.title,
      date: fmtDateTime(x.date),
      result: x.badge,
    }));
  }, [assessments, consultations, user?.role]);

  const upcomingCard = useMemo(() => {
    const accepted = consultations.find((c) => c.status === "accepted");
    const pending = consultations.find((c) => c.status === "pending");
    const best = accepted || pending;

    if (!best) return null;

    const isExpert = user?.role === "expert";
    const other = isExpert ? best.user : best.expert;

    return {
      name:
        `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim() ||
        (isExpert ? "User" : "Expert"),
      sub: isExpert
        ? "Client"
        : other?.expertise
        ? `Expertise: ${other.expertise}`
        : "Expert",
      status: best.status,
      when: fmtDateTime(best.createdAt),
    };
  }, [consultations, user?.role]);

  const booking = useMemo(() => getBookingState(consultations), [consultations]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading dashboard...</p>;
  if (loadingData) return <p>Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2D3436]">
              Hello, {user.firstName} {user.lastName}
            </h1>
            <p className="text-[#5A6062] mt-1">Here's your wellness overview for today.</p>

            <div className="mt-3 text-sm text-[#5A6062] space-y-1">
              <p>
                <span className="font-medium text-[#2D3436]">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium text-[#2D3436]">Role:</span> {user.role}
              </p>
              {user.role === "expert" && (user as any).expertise && (
                <p>
                  <span className="font-medium text-[#2D3436]">Expertise:</span>{" "}
                  {(user as any).expertise}
                </p>
              )}
            </div>
          </div>

          {/* Single main CTA */}
          <div className="flex flex-wrap gap-3">
            {user.role !== "expert" ? (
              <Link to="/assessments" className="no-underline">
                <Button>Take Screening</Button>
              </Link>
            ) : (
              <Link to="/inbox" className="no-underline">
                <Button>Open Inbox</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold text-[#2D3436]">{stat.value}</span>
              <span className="text-sm text-[#5A6062]">{stat.label}</span>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#2D3436]">Recent Activity</h2>

              <Link
                to="/assessments/history"
                className="no-underline text-[#7C9A82] text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <Card className="p-5">
                  <p className="text-sm text-[#5A6062]">No recent activity yet. Try taking a screening.</p>
                </Card>
              ) : (
                recentActivity.map((item, index) => (
                  <Card
                    key={index}
                    className="p-5 flex items-center justify-between hover:bg-white/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#7C9A82]">
                        {item.type === "Assessment" ? <FileText size={20} /> : <UsersIcon size={20} />}
                      </div>

                      <div>
                        <h3 className="font-medium text-[#2D3436]">{item.title}</h3>
                        <p className="text-xs text-[#5A6062]">{item.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-medium text-[#5A7A60] border border-[#E8F0E9]">
                        {item.result}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right column: Recommended / Quick Actions */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#2D3436]">
              {user.role === "expert" ? "Quick Actions" : "Recommended"}
            </h2>

            {/* Users: Appointment Booking (payment placeholder) */}
            {user.role !== "expert" && (
              <Card className="p-6">
                <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-2">
                  Appointment Booking
                </h3>

                {booking.state === "none" && (
                  <>
                    <p className="text-sm text-[#5A6062] mb-4">
                      Book a session with an expert. Payment will be added later (for now it’s empty).
                    </p>
                    <Link to="/experts" className="no-underline">
                      <Button className="w-full">Book Appointment</Button>
                    </Link>
                  </>
                )}

                {booking.state === "pending" && (
                  <>
                    <p className="text-sm text-[#5A6062] mb-2">
                      Your request is sent. Waiting for expert to accept.
                    </p>
                    <p className="text-xs text-[#9CA3AF] mb-4">
                      Payment: <span className="font-medium">Pending (Coming soon)</span>
                    </p>
                    <Link to="/inbox" className="no-underline">
                      <Button variant="outline" className="w-full">View Status</Button>
                    </Link>
                  </>
                )}

                {booking.state === "confirmed" && (
                  <>
                    <p className="text-sm text-[#5A6062] mb-2">✅ Appointment confirmed by expert.</p>
                    <p className="text-xs text-[#9CA3AF] mb-4">
                      Payment: <span className="font-medium">Not collected yet (Coming soon)</span>
                    </p>
                    <Link to="/inbox" className="no-underline">
                      <Button className="w-full">Open Inbox</Button>
                    </Link>
                  </>
                )}

                {booking.state === "rejected" && (
                  <>
                    <p className="text-sm text-[#5A6062] mb-4">
                      Your last request was rejected. You can book another expert.
                    </p>
                    <Link to="/experts" className="no-underline">
                      <Button variant="outline" className="w-full">Book Another</Button>
                    </Link>
                  </>
                )}

                {booking.state === "closed" && (
                  <>
                    <p className="text-sm text-[#5A6062] mb-4">
                      Your last appointment was closed. You can book a new one anytime.
                    </p>
                    <Link to="/experts" className="no-underline">
                      <Button variant="outline" className="w-full">Book Again</Button>
                    </Link>
                  </>
                )}
              </Card>
            )}

            {/* Users: Daily Check-in */}
            {user.role !== "expert" && (
              <Card className="p-6 bg-[#7C9A82] text-[#FAF7F2] border-none">
                <h3 className="font-serif text-xl font-bold mb-2">Daily Check-in</h3>
                <p className="text-[#E8F0E9] text-sm mb-4">
                  Take 2 minutes to record your mood and feelings.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Start Now
                </Button>
              </Card>
            )}

            {/* Experts: Manage Requests */}
            {user.role === "expert" && (
              <Card className="p-6">
                <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-3">
                  Manage Requests
                </h3>
                <p className="text-sm text-[#5A6062] mb-4">
                  Review pending consultation requests and respond to users.
                </p>
                <Link to="/inbox" className="no-underline">
                  <Button className="w-full">Open Inbox</Button>
                </Link>
              </Card>
            )}

            {/* Latest card (avoid repetitive inbox CTA in empty state) */}
            <Card className="p-6">
              <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-3">
                {user.role === "expert" ? "Latest Request" : "Latest Consultation"}
              </h3>

              {upcomingCard ? (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium text-[#2D3436]">{upcomingCard.name}</p>
                      <p className="text-xs text-[#5A6062]">{upcomingCard.sub}</p>
                      <p className="text-xs text-[#5A6062]">
                        Status: <span className="font-medium">{upcomingCard.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#5A6062] mb-4">
                    <Calendar size={16} />
                    <span>{upcomingCard.when}</span>
                  </div>

                  <Link to="/inbox" className="no-underline">
                    <Button variant="outline" size="sm" className="w-full">
                      View in Inbox
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#5A6062]">
                    {user.role === "expert"
                      ? "No consultation requests yet."
                      : "No consultations yet. Book an appointment to get started."}
                  </p>

                  {user.role !== "expert" && (
                    <div className="mt-4">
                      <Link to="/experts" className="no-underline">
                        <Button variant="outline" size="sm" className="w-full">
                          Find Experts
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
