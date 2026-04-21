'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const sections = [
  {
    id: 'intro',
    title: 'Introduction / مقدمة',
    content: `Welcome to hnChat ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at hnchat.net.

مرحباً بك في hnChat. نحن ملتزمون بحماية معلوماتك الشخصية وحقك في الخصوصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها والإفصاح عنها وحمايتها عند استخدامك لمنصتنا.`,
  },
  {
    id: 'collect',
    title: 'Information We Collect / المعلومات التي نجمعها',
    content: `We collect information you provide directly to us:
• Account information: name, email address, username, password
• Profile information: bio, profile photo, interests
• Content you create: posts, videos, comments, messages
• Communications with us

We also collect information automatically:
• Usage data: pages visited, features used, time spent
• Device information: IP address, browser type, operating system
• Analytics data via Google Analytics (GA4)
• Cookies and similar tracking technologies

نجمع المعلومات التي تقدمها لنا مباشرةً مثل: بيانات الحساب، معلومات الملف الشخصي، المحتوى الذي تنشئه، والاتصالات معنا. كما نجمع تلقائياً بيانات الاستخدام ومعلومات الجهاز وبيانات التحليلات.`,
  },
  {
    id: 'use',
    title: 'How We Use Your Information / كيف نستخدم معلوماتك',
    content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Personalize your content feed and recommendations
• Send you notifications and emails (welcome, re-engagement, weekly digest)
• Analyze usage patterns to improve user experience
• Detect and prevent fraud and abuse
• Comply with legal obligations

نستخدم المعلومات التي نجمعها لتقديم خدماتنا وتحسينها، وتخصيص المحتوى، وإرسال الإشعارات والبريد الإلكتروني، وتحليل أنماط الاستخدام، واكتشاف الاحتيال، والامتثال للالتزامات القانونية.`,
  },
  {
    id: 'sharing',
    title: 'Information Sharing / مشاركة المعلومات',
    content: `We do not sell your personal information. We may share your information with:
• Service providers: Supabase (database), Brevo (email), Google Analytics (analytics)
• Legal authorities when required by law
• Other users only for public content you choose to share

We require all third parties to respect the security of your personal data and to treat it in accordance with the law.

نحن لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك مع مزودي الخدمة (Supabase، Brevo، Google Analytics) والسلطات القانونية عند الاقتضاء، والمستخدمين الآخرين للمحتوى العام فقط.`,
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking / ملفات تعريف الارتباط والتتبع',
    content: `We use cookies and similar tracking technologies to:
• Keep you logged in (authentication cookies)
• Remember your preferences
• Analyze how you use our platform (Google Analytics)
• Improve performance and personalization

You can control cookies through your browser settings. Disabling cookies may affect some features of our platform.

نستخدم ملفات تعريف الارتباط لإبقائك مسجلاً الدخول وتذكر تفضيلاتك وتحليل استخدامك للمنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.`,
  },
  {
    id: 'rights',
    title: 'Your Rights / حقوقك',
    content: `You have the right to:
• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your personal information
• Object to processing of your personal information
• Data portability — receive your data in a portable format
• Withdraw consent at any time

To exercise these rights, contact us at: privacy@hnchat.net

لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها وطلب حذفها والاعتراض على معالجتها ونقل بياناتك وسحب موافقتك في أي وقت. للتواصل: privacy@hnchat.net`,
  },
  {
    id: 'security',
    title: 'Data Security / أمان البيانات',
    content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
• Encrypted data transmission (HTTPS/TLS)
• Secure database storage via Supabase with Row Level Security (RLS)
• Regular security audits
• Limited employee access to personal data

However, no method of transmission over the Internet is 100% secure.

نطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية، بما في ذلك تشفير نقل البيانات وتخزين قاعدة البيانات الآمن وعمليات التدقيق الأمني المنتظمة.`,
  },
  {
    id: 'retention',
    title: 'Data Retention / الاحتفاظ بالبيانات',
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us.

Analytics data is retained for 26 months as per Google Analytics default settings. Email engagement data is retained for 12 months.

نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. يمكنك طلب حذف حسابك وبياناتك المرتبطة به في أي وقت.`,
  },
  {
    id: 'children',
    title: "Children\'s Privacy / خصوصية الأطفال",
    content: `hnChat is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child under 13, please contact us immediately at privacy@hnchat.net.

hnChat غير موجه للأطفال دون سن 13 عاماً. إذا كنت تعتقد أننا جمعنا معلومات من طفل دون 13 عاماً عن غير قصد، يرجى التواصل معنا فوراً.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy / التغييرات على هذه السياسة',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically. قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ"آخر تحديث".`,
  },
  {
    id: 'contact',
    title: 'Contact Us / تواصل معنا',
    content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us:

Email: privacy@hnchat.net
Website: https://hnchat.net

إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارسات الخصوصية لدينا، يرجى التواصل معنا عبر البريد الإلكتروني: privacy@hnchat.net`,
  },
];

export default function PrivacyPolicyScreen() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/home-feed" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Privacy Policy / سياسة الخصوصية</h1>
            <p className="text-xs text-gray-400">Last Updated: April 21, 2026</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro Banner */}
        <div className="bg-purple-900/30 border border-purple-700/40 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h2 className="text-lg font-bold text-purple-300">Your Privacy Matters</h2>
              <p className="text-sm text-purple-400">خصوصيتك تهمنا</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            At hnChat, we believe privacy is a fundamental right. This policy explains exactly how we handle your data — transparently and responsibly.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-8 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Table of Contents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections?.map((s, i) => (
              <a
                key={s?.id}
                href={`#${s?.id}`}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
              >
                <span className="text-gray-600 text-xs">{i + 1}.</span>
                {s?.title?.split('/')?.[0]?.trim()}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections?.map((section, index) => (
            <div
              key={section?.id}
              id={section?.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setActiveSection(activeSection === section?.id ? null : section?.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-500 font-bold text-sm w-6">{index + 1}.</span>
                  <span className="font-semibold text-white">{section?.title}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === section?.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeSection === section?.id && (
                <div className="px-5 pb-5 border-t border-gray-800">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line pt-4">
                    {section?.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/privacy-policy" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/terms-of-service" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 hnChat. All rights reserved. |{' '}
            <a href="mailto:privacy@hnchat.net" className="text-purple-400 hover:text-purple-300">
              privacy@hnchat.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
