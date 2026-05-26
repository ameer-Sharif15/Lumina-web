"use client";

import {
  Camera,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Shield,
  Trash2,
} from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "May 13, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content:
        "We collect information you provide directly to us when you create an account, such as your full name, email address, school affiliation, and professional details (subject, grade level). We also collect data generated through your use of the app, including lesson plans and teaching materials.",
    },
    {
      title: "2. Camera & Media Permissions",
      icon: Camera,
      content:
        "Lumina AI requests access to your device's camera and photo library. This is used exclusively for: (a) capturing or uploading profile photographs, and (b) scanning physical teaching materials or documents to be processed by our AI for lesson plan generation. We do not access your camera in the background or store images without your explicit action.",
    },
    {
      title: "3. How We Use Your Data",
      icon: Eye,
      content:
        "Your data is used to provide and improve our services, specifically: to personalize your experience, to generate AI-assisted lesson plans, to facilitate the teacher referral program, and to communicate important system updates. We use anonymized, aggregated data for platform analytics.",
    },
    {
      title: "4. AI Processing & Third Parties",
      icon: Globe,
      content:
        "Lumina AI uses advanced Artificial Intelligence models to assist in generating content. By using the app, you acknowledge that the text you input may be processed by third-party AI providers. We do not sell your personal information to third parties. We may share data with service providers (e.g., hosting, database management) who are contractually bound to protect your information.",
    },
    {
      title: "5. Data Security",
      icon: Lock,
      content:
        "We implement industry-standard security measures, including encryption and secure socket layers (SSL), to protect your data from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure.",
    },
    {
      title: "6. Data Deletion & Rights",
      icon: Trash2,
      content:
        "You have the right to access, correct, or delete your personal information at any time. You can request account deletion directly through the app settings or by contacting our support team. Upon deletion, your personal data will be removed from our active databases within 30 days.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[12px] font-bold uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4" />
            Legal Document
          </div>
          <h1 className="text-display-md font-bold text-on-surface mb-4">
            Privacy Policy
          </h1>
          <p className="text-body-base text-outline max-w-xl mx-auto">
            Your privacy is paramount. This policy explains how Lumina AI
            collects, uses, and protects your information as a teacher on our
            platform.
          </p>
          <div className="mt-8 text-[12px] font-bold text-outline uppercase tracking-tighter">
            Last Updated: {lastUpdated}
          </div>
        </header>

        {/* Content */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="glass-card ambient-shadow p-8 rounded-3xl border border-outline-variant/50 bg-white group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-title-sm font-bold text-on-surface">
                    {section.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-outline-variant text-center space-y-4">
          <p className="text-body-sm text-outline">
            If you have any questions regarding this Privacy Policy, please
            contact us at:
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant rounded-full text-on-surface font-bold text-[14px] hover:shadow-lg transition-all cursor-pointer">
            <FileText className="w-4 h-4 text-primary" />
            helloluminai@gmail.com
          </div>
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-[11px] font-bold text-outline uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Data Processing Agreement
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
