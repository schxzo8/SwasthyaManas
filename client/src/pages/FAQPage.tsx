import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    id: 1,
    category: "General",
    question: "What is SwasthyaManas?",
    answer: "SwasthyaManas is a comprehensive mental health and wellness platform designed to provide accessible support for your mental well-being. Our platform combines self-assessment tools, expert consultations, mindfulness content, and mood tracking to help you understand and improve your mental health."
  },
  {
    id: 2,
    category: "General",
    question: "Is SwasthyaManas a replacement for professional mental health treatment?",
    answer: "SwasthyaManas is designed to complement, not replace, professional mental health treatment. Our platform provides tools for self-awareness and connects you with qualified mental health professionals. Always consult with a healthcare provider for serious mental health concerns."
  },
  {
    id: 3,
    category: "General",
    question: "Is my information secure and private?",
    answer: "Yes. We take privacy seriously and implement industry-standard security measures to protect your personal and health information. All data is encrypted and stored securely. We comply with data protection regulations and never share your information without consent."
  },
  // Account & Authentication
  {
    id: 4,
    category: "Account & Authentication",
    question: "How do I create an account?",
    answer: "You can create an account by clicking 'Get Started' on our homepage. You can sign up using your email and password, or use the 'Continue with Google' option for quick registration. Fill in your profile information and verify your email to get started."
  },
  {
    id: 5,
    category: "Account & Authentication",
    question: "Can I use Google Sign-In?",
    answer: "Yes! We support 'Continue with Google' for quick and secure registration. This allows you to create an account using your Google credentials without needing to remember another password."
  },
  {
    id: 6,
    category: "Account & Authentication",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link in your email. Click the link and follow the instructions to create a new password."
  },
  // Assessments
  {
    id: 7,
    category: "Assessments",
    question: "What are mental health assessments?",
    answer: "Our assessments are scientifically-designed questionnaires that help evaluate your mental health across different dimensions including depression, anxiety, stress, and overall well-being. These assessments provide insights into your current mental state."
  },
  {
    id: 8,
    category: "Assessments",
    question: "How often should I take assessments?",
    answer: "You can take assessments whenever you want to check your mental health status. Many users find it helpful to take assessments regularly (weekly or monthly) to track changes and progress over time."
  },
  {
    id: 9,
    category: "Assessments",
    question: "Are my assessment results confidential?",
    answer: "Absolutely. Your assessment results are private and only visible to you, and to a mental health expert if you choose to consult with one. Your data is never shared without your explicit consent."
  },
  {
    id: 10,
    category: "Assessments",
    question: "What do the assessment results mean?",
    answer: "Assessment results provide scores and insights about your mental health status. Results help identify areas of concern and can guide recommendations for self-care or professional consultation. We provide detailed explanations with each result."
  },
  // Mood Tracking
  {
    id: 11,
    category: "Mood Tracking",
    question: "How does mood tracking work?",
    answer: "Mood tracking allows you to log your emotional state daily. You can record your mood, intensity, and factors that influenced it. Over time, you'll identify patterns and triggers that affect your well-being."
  },
  {
    id: 12,
    category: "Mood Tracking",
    question: "Why should I track my mood?",
    answer: "Tracking your mood helps you develop self-awareness about your emotional patterns. This information is valuable for identifying stress triggers, recognizing improvement, and providing context during consultations with mental health experts."
  },
  {
    id: 13,
    category: "Mood Tracking",
    question: "Can I export my mood data?",
    answer: "You can view your mood history and trends in your dashboard. This data helps you and your consultant understand your mental health patterns over time."
  },
  // Mindfulness & Content
  {
    id: 14,
    category: "Content & Mindfulness",
    question: "What mindfulness content is available?",
    answer: "We offer guided meditations, breathing exercises, and mindfulness techniques. Our content library includes resources for stress relief, anxiety management, better sleep, and overall well-being. Content is regularly updated with new materials."
  },
  {
    id: 15,
    category: "Content & Mindfulness",
    question: "How long are mindfulness sessions?",
    answer: "Our mindfulness sessions vary in length from 5 to 30 minutes, allowing you to choose based on your availability. You can do quick 5-minute breathing exercises or longer meditations depending on your needs."
  },
  {
    id: 16,
    category: "Content & Mindfulness",
    question: "Can I download mindfulness content?",
    answer: "You can access mindfulness content directly through the platform. Some content may be available for offline access on mobile devices, though internet streaming is the primary method."
  },
  // Consultations
  {
    id: 17,
    category: "Consultations",
    question: "How do I book a consultation with an expert?",
    answer: "Visit the Experts page to browse available mental health professionals. Check their availability, expertise, and rates. Click to book a slot, and you'll receive confirmation with details about your appointment."
  },
  {
    id: 18,
    category: "Consultations",
    question: "What qualifications do the experts have?",
    answer: "All experts on our platform are qualified mental health professionals including psychologists, counselors, and psychiatrists. Each professional has verified credentials and relevant experience in mental health care."
  },
  {
    id: 19,
    category: "Consultations",
    question: "How are consultations conducted?",
    answer: "Consultations are conducted through our secure video platform. You'll receive a link at the scheduled time to join the session. Ensure you have a quiet, private space and stable internet connection."
  },
  {
    id: 20,
    category: "Consultations",
    question: "What if I need to reschedule or cancel?",
    answer: "You can cancel or reschedule appointments from your dashboard. Most professionals allow cancellations up to 24 hours before the appointment without penalty. Check the specific expert's cancellation policy."
  },
  {
    id: 21,
    category: "Consultations",
    question: "How much does a consultation cost?",
    answer: "Consultation rates vary by expert and expertise level. You can see pricing for each professional on their profile before booking. We offer flexible payment options and some may offer discounts for package bookings."
  },
  // Premium
  {
    id: 22,
    category: "Premium",
    question: "Do I need to pay for basic features?",
    answer: "Many features are available for free including mood tracking, assessment tools, and browsing content. Premium features like exclusive mindfulness content, expert consultations, and advanced analytics require payment."
  },
  {
    id: 23,
    category: "Premium",
    question: "What's included in premium membership?",
    answer: "Premium membership includes unlimited assessments, exclusive mindfulness content, priority booking with experts, advanced mood analytics, and ad-free experience. Different plans are available at various price points."
  },
  // Technical
  {
    id: 24,
    category: "Technical",
    question: "What devices can I use SwasthyaManas on?",
    answer: "SwasthyaManas is accessible on desktop computers, tablets, and smartphones through your web browser. We're continuously working on mobile apps for iOS and Android."
  },
  {
    id: 25,
    category: "Technical",
    question: "What should I do if I encounter a technical issue?",
    answer: "If you experience technical problems, try clearing your browser cache, disabling browser extensions, or using a different browser. If issues persist, contact our support team with details about the problem."
  },
  {
    id: 26,
    category: "Technical",
    question: "Is there customer support available?",
    answer: "Yes, we have a dedicated support team available to help. You can reach us through the Contact Us page, email, or through the help section in your dashboard."
  }
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["General", "Account & Authentication", "Assessments", "Mood Tracking", "Content & Mindfulness", "Consultations", "Premium", "Technical"];
  
  const filteredFAQs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs;

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F0F4F1] dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-[#7C9A82] dark:bg-slate-800 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/90 text-lg">Find answers to common questions about SwasthyaManas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#2D3436] dark:text-white mb-4 uppercase tracking-wide">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-[#7C9A82] text-white shadow-md"
                  : "bg-white dark:bg-slate-800 text-[#2D3436] dark:text-white border border-[#E8F0E9] dark:border-slate-700 hover:border-[#7C9A82] dark:hover:border-emerald-400"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#7C9A82] text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-[#2D3436] dark:text-white border border-[#E8F0E9] dark:border-slate-700 hover:border-[#7C9A82] dark:hover:border-emerald-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-[#E8F0E9] dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full flex items-start justify-between p-6 text-left hover:bg-[#FAF7F2] dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white mb-1">
                    {faq.question}
                  </h3>
                  <p className="text-xs font-medium text-[#7C9A82] dark:text-emerald-400 uppercase tracking-wide">
                    {faq.category}
                  </p>
                </div>
                <ChevronDown
                  size={24}
                  className={`text-[#7C9A82] dark:text-emerald-400 flex-shrink-0 transition-transform duration-300 ${
                    expandedId === faq.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === faq.id && (
                <div className="px-6 pb-6 border-t border-[#E8F0E9] dark:border-slate-700 pt-4">
                  <p className="text-[#475569] dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-900 dark:to-emerald-800 rounded-2xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Didn't find your answer?</h2>
          <p className="text-white/90 mb-6 text-lg">
            Can't find what you're looking for? Our support team is here to help. Get in touch with us today.
          </p>
          <button className="bg-white text-[#7C9A82] dark:text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
