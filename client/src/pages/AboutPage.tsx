import { useNavigate } from "react-router-dom";
import { Heart, Users, Target, Zap, Shield, Lightbulb } from "lucide-react";

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const values: Value[] = [
  {
    icon: <Heart className="w-8 h-8 text-[#7C9A82]" />,
    title: "Compassion",
    description: "We believe in treating every individual with empathy and care, understanding the unique journey of mental health."
  },
  {
    icon: <Shield className="w-8 h-8 text-[#7C9A82]" />,
    title: "Privacy & Trust",
    description: "Your mental health information is sacred. We implement the highest privacy standards and never compromise on security."
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-[#7C9A82]" />,
    title: "Innovation",
    description: "We continuously evolve our platform with modern technology and evidence-based practices to serve you better."
  },
  {
    icon: <Users className="w-8 h-8 text-[#7C9A82]" />,
    title: "Accessibility",
    description: "Mental health support should be available to everyone, everywhere. We're committed to making wellness accessible."
  },
  {
    icon: <Target className="w-8 h-8 text-[#7C9A82]" />,
    title: "Effectiveness",
    description: "Every feature is designed based on scientific research and real user needs to create meaningful impact."
  },
  {
    icon: <Zap className="w-8 h-8 text-[#7C9A82]" />,
    title: "Empowerment",
    description: "We empower users to take control of their mental health journey with knowledge, tools, and professional support."
  }
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#7C9A82] via-[#5A7A60] to-[#4A6B50] dark:from-emerald-900 dark:to-slate-900 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">About SwasthyaManas</h1>
          <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
            Transforming mental health care through innovation, compassion, and accessibility. Your well-being is our mission.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-[#E8F0E9] dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#7C9A82]/10 p-4 rounded-xl">
                <Target className="w-8 h-8 text-[#7C9A82]" />
              </div>
              <h2 className="text-3xl font-bold text-[#2D3436] dark:text-white">Our Mission</h2>
            </div>
            <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-lg">
              To democratize mental health support by providing an accessible, secure, and evidence-based platform that empowers individuals to understand, manage, and improve their mental well-being. We believe that quality mental health care should be available to everyone, regardless of geography, language, or economic status.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-[#E8F0E9] dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#7C9A82]/10 p-4 rounded-xl">
                <Lightbulb className="w-8 h-8 text-[#7C9A82]" />
              </div>
              <h2 className="text-3xl font-bold text-[#2D3436] dark:text-white">Our Vision</h2>
            </div>
            <p className="text-[#475569] dark:text-slate-300 leading-relaxed text-lg">
              To create a world where mental health support is stigma-free, culturally sensitive, and integrated into everyday life. We envision a future where individuals proactively manage their mental wellness with the support of technology and qualified professionals working together seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white dark:bg-slate-800 py-20 border-y border-[#E8F0E9] dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#2D3436] dark:text-white mb-8">Our Story</h2>
          <div className="space-y-6 text-[#475569] dark:text-slate-300 text-lg leading-relaxed">
            <p>
              SwasthyaManas was born from a simple observation: mental health support is fragmented, expensive, and often inaccessible. Too many people struggle silently, unable to find qualified help when they need it most.
            </p>
            <p>
              Our founding team, comprising mental health professionals, technologists, and advocates, came together with a shared vision. We wanted to build something that bridges the gap between self-care and professional mental health treatment.
            </p>
            <p>
              The name "SwasthyaManas" comes from Sanskrit, combining "Swasthya" (health/wellness) and "Manas" (mind), reflecting our commitment to holistic mental well-being. It represents our roots in South Asian wellness traditions while embracing modern technology and science-based approaches.
            </p>
            <p>
              Today, SwasthyaManas is a comprehensive platform that combines AI-driven assessments, expert consultations, mindfulness practices, and community support. We're proud to have helped thousands of individuals on their mental health journeys.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-[#2D3436] dark:text-white mb-4 text-center">Our Core Values</h2>
        <p className="text-center text-[#475569] dark:text-slate-300 text-lg mb-12 max-w-2xl mx-auto">
          These principles guide everything we do at SwasthyaManas
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-[#E8F0E9] dark:border-slate-700 hover:shadow-lg transition-all hover:border-[#7C9A82] dark:hover:border-emerald-400"
            >
              <div className="bg-[#7C9A82]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 dark:bg-emerald-900/20">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-[#2D3436] dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-[#475569] dark:text-slate-300">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What We Offer */}
      <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F0F4F1] dark:from-slate-900 dark:to-slate-800 py-20 border-y border-[#E8F0E9] dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#2D3436] dark:text-white mb-4 text-center">What We Offer</h2>
          <p className="text-center text-[#475569] dark:text-slate-300 text-lg mb-12 max-w-2xl mx-auto">
            A comprehensive suite of tools and resources for mental health and wellness
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Mental Health Assessments",
                description: "Evidence-based assessments to evaluate depression, anxiety, stress, and overall well-being with detailed insights."
              },
              {
                title: "Expert Consultations",
                description: "Connect with qualified psychologists, counselors, and psychiatrists through secure video consultations."
              },
              {
                title: "Mood Tracking",
                description: "Daily mood logging with pattern recognition to understand your emotional triggers and patterns."
              },
              {
                title: "Mindfulness & Content",
                description: "Guided meditations, breathing exercises, and wellness content for stress relief and relaxation."
              },
              {
                title: "Appointment Management",
                description: "Easy booking and management of consultations with flexible scheduling and reminders."
              },
              {
                title: "Privacy & Security",
                description: "Military-grade encryption and strict privacy protocols to keep your mental health data secure."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-[#E8F0E9] dark:border-slate-700"
              >
                <h3 className="text-xl font-bold text-[#2D3436] dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#475569] dark:text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#7C9A82] dark:bg-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Wellness Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of individuals who are taking control of their mental health with SwasthyaManas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-white text-[#7C9A82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white dark:bg-slate-800 py-16 border-t border-[#E8F0E9] dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#2D3436] dark:text-white mb-12 text-center">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#7C9A82]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-900/20">
                <Heart className="w-8 h-8 text-[#7C9A82]" />
              </div>
              <h3 className="font-bold text-[#2D3436] dark:text-white mb-2 text-lg">Email</h3>
              <p className="text-[#475569] dark:text-slate-300">support@swasthyamanas.com</p>
            </div>
            <div className="text-center">
              <div className="bg-[#7C9A82]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-900/20">
                <Users className="w-8 h-8 text-[#7C9A82]" />
              </div>
              <h3 className="font-bold text-[#2D3436] dark:text-white mb-2 text-lg">Community</h3>
              <p className="text-[#475569] dark:text-slate-300">Join our supportive community</p>
            </div>
            <div className="text-center">
              <div className="bg-[#7C9A82]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-900/20">
                <Zap className="w-8 h-8 text-[#7C9A82]" />
              </div>
              <h3 className="font-bold text-[#2D3436] dark:text-white mb-2 text-lg">Updates</h3>
              <p className="text-[#475569] dark:text-slate-300">Follow us on social media</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
