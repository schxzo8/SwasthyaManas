import { Link, useNavigate } from "react-router-dom";
import { FileText, Clock, ArrowRight, Brain, Activity } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { BlobDecoration } from "../components/BlobDecoration";

type AssessmentItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  questions: number;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
  comingSoon?: boolean;
};

export default function AssessmentHome() {
  const navigate = useNavigate();

  const assessments: AssessmentItem[] = [
    {
      id: "phq9",
      title: "PHQ-9 Depression Screen",
      description:
        "A standard tool to screen for the presence and severity of depression.",
      time: "3 mins",
      questions: 9,
      icon: Brain,
      path: "/assessments/phq9",
    },
    {
      id: "gad7",
      title: "GAD-7 Anxiety Screen",
      description:
        "A clinically validated tool to screen for Generalized Anxiety Disorder.",
      time: "2 mins",
      questions: 7,
      icon: Activity,
      path: "/assessments/gad7",
    },
    {
      id: "stress",
      title: "Perceived Stress Scale",
      description:
        "Measure your perception of stress and how unpredictable your life feels.",
      time: "4 mins",
      questions: 10,
      icon: FileText,
      path: "#",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 relative overflow-hidden">
      <BlobDecoration
        variant={2}
        className="top-0 right-0 w-[600px] h-[600px] text-[#E8F0E9]"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D3436] mb-4">
            Self-Assessments
          </h1>
          <p className="text-lg text-[#5A6062] max-w-2xl mx-auto">
            Scientifically validated tools to help you understand your mental
            well-being. Your results are private and secure.
          </p>
        </div>

        {/* Actions from your old page (kept, but styled to match new UI) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Button variant="secondary" onClick={() => navigate("/assessments/history")}>
            View My History
          </Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-3xl mx-auto mb-10">
          <Card className="p-5 md:p-6 bg-[#FFFDF9]">
            <p className="text-sm text-[#5A6062]">
              Tip: Answer honestly based on the <strong>last 2 weeks</strong>.
              These are screening tools for self-awareness, not a medical
              diagnosis. If you feel unsafe or overwhelmed, reach out to a
              trusted person or a professional.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;

            return (
              <Card
                key={assessment.id}
                className={`flex flex-col h-full ${
                  assessment.comingSoon ? "opacity-70" : ""
                }`}
              >
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-[#E8F0E9] rounded-xl text-[#7C9A82]">
                      <Icon size={32} />
                    </div>

                    {assessment.comingSoon && (
                      <span className="px-3 py-1 bg-[#F0F0F0] text-[#5A6062] text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                    {assessment.title}
                  </h3>

                  <p className="text-[#5A6062] mb-6 leading-relaxed">
                    {assessment.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-[#5A6062] mb-8">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{assessment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>{assessment.questions} Questions</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  {assessment.comingSoon ? (
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      Not Available Yet
                    </Button>
                  ) : (
                    <Link to={assessment.path}>
                      <Button className="w-full group">
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[#5A6062] text-sm">
            Note: These assessments are for screening purposes only and are not
            a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
