import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Heart, Brain, Users, CheckCircle } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BlobDecoration } from "../components/BlobDecoration";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* HERO SECTION (merged: keeps your “compassionate companion” text + new UI) */}
      <section className="relative min-h-[90vh] flex items-center bg-[#FAF7F2]">
        <BlobDecoration
          variant={1}
          className="top-0 right-0 w-[600px] h-[600px] text-[#E8F0E9]"
        />
        <BlobDecoration
          variant={2}
          className="bottom-0 left-0 w-[500px] h-[500px] text-[#E8F0E9] opacity-30"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#E8F0E9] text-[#5A7A60] text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-[#7C9A82] mr-2" />
                Mental Wellness for Everyone
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-[#2D3436] leading-tight">
                Your compassionate companion on the <br />
                journey to mental wellness.
              </h1>

              <p className="text-lg md:text-xl text-[#5A6062] max-w-lg leading-relaxed font-sans">
                Start nurturing your mind and well-being today. SwasthyaManas is
                here to guide you every step of the way.
              </p>

              {/* Actions (merged: Learn more + your CTA buttons) */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/assessments")}
                >
                  Take Free Assessment
                </Button>

                <Link to="/experts">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Meet Our Experts
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const el = document.getElementById("learn-explore");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn more
                </Button>
              </div>

              <div className="pt-8 flex items-center gap-8 text-sm text-[#5A6062]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7C9A82]" />
                  <span>Clinically Validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7C9A82]" />
                  <span>100% Confidential</span>
                </div>
              </div>

              {/* Our Goal (from your old home) */}
              <Card className="p-5 bg-[#FFFDF9] border border-[#E8F0E9] max-w-xl">
                <h3 className="font-serif text-xl font-bold text-[#2D3436] mb-2">
                  Our Goal
                </h3>
                <p className="text-[#5A6062]">
                  Supporting your journey with guidance and skills to nurture a
                  healthier, more balanced mind.
                </p>
              </Card>
            </div>

            {/* Right visual (keeps your abstract hero from new UI; no dummy assets required) */}
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden bg-[#C4B5A0]/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-32 h-32 text-[#7C9A82] opacity-20" />
                </div>
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#7C9A82] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" />
                <div
                  className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-[#C4B5A0] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-[#fff] rounded-full opacity-30" />
              </div>
              <div
                className="absolute -bottom-8 -left-8 max-w-xs hidden md:block animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="bg-[#E8F0E9] p-3 rounded-full">
                      <Heart className="h-6 w-6 text-[#7C9A82]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2D3436]">Daily Check-in</p>
                      <p className="text-xs text-[#5A6062]">How are you feeling today?</p>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* LEARN & EXPLORE (merged from old home, styled like new UI) */}
      <section id="learn-explore" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-4xl font-bold text-[#2D3436] mb-4">
              Learn & Explore
            </h2>
            <p className="text-[#5A6062] text-lg">
              Get to know SwasthyaManas and explore tools designed for your
              wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover:bg-[#FAF7F2] transition-colors border-none shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                About SwasthyaManas
              </h3>
              <p className="text-[#5A6062] leading-relaxed mb-6">
                SwasthyaManas is a mental health support platform.
              </p>
              <div className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#E8F0E9] text-[#5A7A60]">
                about
              </div>
            </Card>

            <Card className="p-8 hover:bg-[#FAF7F2] transition-colors border-none shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                Start with a Self-Assessment
              </h3>
              <p className="text-[#5A6062] leading-relaxed mb-6">
                Take clinically backed questionnaires (PHQ-9, GAD-7) and track
                your progress over time.
              </p>
              <Link
                to="/assessments"
                className="text-[#7C9A82] font-medium flex items-center hover:underline"
              >
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (from new UI) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-bold text-[#2D3436] mb-4">
              Holistic Mental Wellness
            </h2>
            <p className="text-[#5A6062] text-lg">
              We combine clinical expertise with a human-centered approach to
              help you thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 hover:bg-[#FAF7F2] transition-colors border-none shadow-lg">
              <div className="w-14 h-14 bg-[#E8F0E9] rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-[#7C9A82]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                Self Assessments
              </h3>
              <p className="text-[#5A6062] leading-relaxed mb-6">
                Scientifically backed questionnaires (PHQ-9, GAD-7) to help you
                understand your mental state better.
              </p>
              <Link
                to="/assessments"
                className="text-[#7C9A82] font-medium flex items-center hover:underline"
              >
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-8 hover:bg-[#FAF7F2] transition-colors border-none shadow-lg">
              <div className="w-14 h-14 bg-[#E8F0E9] rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-[#7C9A82]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                Expert Support
              </h3>
              <p className="text-[#5A6062] leading-relaxed mb-6">
                Connect with licensed therapists and counselors who specialize
                in your specific needs.
              </p>
              <Link
                to="/experts"
                className="text-[#7C9A82] font-medium flex items-center hover:underline"
              >
                Find an Expert <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-8 hover:bg-[#FAF7F2] transition-colors border-none shadow-lg">
              <div className="w-14 h-14 bg-[#E8F0E9] rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-[#7C9A82]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2D3436] mb-3">
                Progress Tracking
              </h3>
              <p className="text-[#5A6062] leading-relaxed mb-6">
                Monitor your journey with intuitive dashboards and history
                tracking to see how far you've come.
              </p>
              <Link
                to="/dashboard"
                className="text-[#7C9A82] font-medium flex items-center hover:underline"
              >
                View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* QUOTE SECTION (from new UI) */}
      <section className="py-20 bg-[#7C9A82] text-[#FAF7F2] relative overflow-hidden">
        <BlobDecoration
          variant={3}
          className="absolute top-0 left-0 w-full h-full text-[#5A7A60] opacity-10"
        />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="font-serif text-3xl md:text-4xl italic leading-relaxed mb-8">
            "Mental health is not a destination, but a process. It's about how
            you drive, not where you're going."
          </p>
          <p className="font-sans font-medium tracking-wider uppercase text-[#E8F0E9]">
            Noam Shpancer, PhD
          </p>
        </div>
      </section>
    </div>
  );
}
