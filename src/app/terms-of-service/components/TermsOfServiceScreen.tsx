'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms / قبول الشروط',
    content: `By accessing or using hnChat ("the Platform") at hnchat.net, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.

These Terms apply to all visitors, users, and others who access or use the Platform. We reserve the right to update these Terms at any time.

باستخدامك لمنصة hnChat على hnchat.net، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.`,
  },
  {
    id: 'eligibility',
    title: 'Eligibility / الأهلية',
    content: `You must be at least 13 years old to use hnChat. By using the Platform, you represent and warrant that:
• You are at least 13 years of age
• You have the legal capacity to enter into these Terms
• You will comply with all applicable laws and regulations
• You are not prohibited from using the Platform under any applicable law

يجب أن يكون عمرك 13 عاماً على الأقل لاستخدام hnChat. باستخدامك للمنصة، فإنك تؤكد أنك تستوفي هذه المتطلبات وأنك لست ممنوعاً من استخدام المنصة بموجب أي قانون.`,
  },
  {
    id: 'account',
    title: 'User Accounts / حسابات المستخدمين',
    content: `When you create an account with us, you must:
• Provide accurate, complete, and current information
• Maintain the security of your password
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account

You may not use another user's account without permission. We reserve the right to terminate accounts that violate these Terms.

عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة والحفاظ على أمان كلمة المرور وإخطارنا فوراً بأي وصول غير مصرح به. أنت مسؤول عن جميع الأنشطة التي تتم تحت حسابك.`,
  },
  {
    id: 'content',title: 'User Content / محتوى المستخدم',
    content: `You retain ownership of content you post on hnChat. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform.

You are solely responsible for your content. You agree NOT to post content that:
• Is illegal, harmful, threatening, or abusive
• Infringes on intellectual property rights
• Contains spam, malware, or deceptive material
• Violates any person's privacy
• Is sexually explicit or violent without appropriate age restrictions

We reserve the right to remove any content that violates these Terms.

تحتفظ بملكية المحتوى الذي تنشره. بنشر المحتوى، تمنحنا ترخيصاً لاستخدامه وعرضه على المنصة. أنت مسؤول عن محتواك ويجب ألا ينتهك القوانين أو حقوق الآخرين.`,
  },
  {
    id: 'prohibited',
    title: 'Prohibited Activities / الأنشطة المحظورة',
    content: `You agree not to engage in any of the following:
• Violating any applicable laws or regulations
• Impersonating any person or entity
• Harassing, bullying, or intimidating other users
• Attempting to gain unauthorized access to our systems
• Using bots, scrapers, or automated tools without permission
• Sending spam or unsolicited messages
• Manipulating engagement metrics (fake likes, views, followers)
• Interfering with the proper functioning of the Platform
• Circumventing rate limits or security measures

Violation of these rules may result in immediate account suspension or termination.

يُحظر عليك انتهاك القوانين، وانتحال شخصية الآخرين، والتحرش، واستخدام الروبوتات، وإرسال البريد العشوائي، والتلاعب بمقاييس التفاعل، والتدخل في عمل المنصة.`,
  },
  {
    id: 'intellectual',
    title: 'Intellectual Property / الملكية الفكرية',
    content: `The Platform and its original content (excluding user-generated content), features, and functionality are owned by hnChat and are protected by international copyright, trademark, and other intellectual property laws.

Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.

المنصة ومحتواها الأصلي (باستثناء المحتوى الذي ينشئه المستخدمون) مملوكة لـ hnChat ومحمية بموجب قوانين حقوق الملكية الفكرية الدولية.`,
  },
  {
    id: 'privacy',
    title: 'Privacy / الخصوصية',
    content: `Your use of hnChat is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.

By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.

استخدامك لـ hnChat يخضع أيضاً لسياسة الخصوصية الخاصة بنا. يرجى مراجعة سياسة الخصوصية لفهم ممارساتنا في جمع واستخدام معلوماتك.`,
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer of Warranties / إخلاء المسؤولية',
    content: `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

We do not warrant that:
• The Platform will be uninterrupted or error-free
• Defects will be corrected
• The Platform is free of viruses or harmful components
• The results of using the Platform will meet your requirements

تُقدَّم المنصة "كما هي" دون أي ضمانات صريحة أو ضمنية. لا نضمن أن المنصة ستكون خالية من الأخطاء أو الانقطاعات.`,
  },
  {
    id: 'limitation',
    title: 'Limitation of Liability / تحديد المسؤولية',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, hnChat SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL.

Our total liability to you for any claims arising from these Terms shall not exceed the amount you paid us in the past 12 months (or $10 if you have not made any payments).

إلى أقصى حد يسمح به القانون، لن تكون hnChat مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية.`,
  },
  {
    id: 'termination',
    title: 'Termination / الإنهاء',
    content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms.

Upon termination, your right to use the Platform will immediately cease. You may also delete your account at any time through your account settings.

All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.

يمكننا إنهاء أو تعليق حسابك فوراً لأي سبب، بما في ذلك انتهاك هذه الشروط. يمكنك أيضاً حذف حسابك في أي وقت.`,
  },
  {
    id: 'governing',
    title: 'Governing Law / القانون الحاكم',
    content: `These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.

Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.

تخضع هذه الشروط للقوانين المعمول بها. يتم حل أي نزاعات تنشأ عن هذه الشروط أو استخدامك للمنصة من خلال التحكيم الملزم.`,
  },
  {
    id: 'contact',
    title: 'Contact Us / تواصل معنا',
    content: `If you have any questions about these Terms of Service, please contact us:

Email: legal@hnchat.net
Website: https://hnchat.net
Privacy: privacy@hnchat.net

إذا كانت لديك أي أسئلة حول شروط الخدمة هذه، يرجى التواصل معنا عبر البريد الإلكتروني: legal@hnchat.net`,
  },
];

export default function TermsOfServiceScreen() {
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
            <h1 className="text-xl font-bold text-white">Terms of Service / شروط الخدمة</h1>
            <p className="text-xs text-gray-400">Last Updated: April 21, 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Intro Banner */}
        <div className="bg-blue-900/30 border border-blue-700/40 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-lg font-bold text-blue-300">Terms of Service</h2>
              <p className="text-sm text-blue-400">شروط الخدمة</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Please read these Terms carefully before using hnChat. By using our platform, you agree to be bound by these Terms.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/privacy-policy" className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors">
              Privacy Policy / سياسة الخصوصية →
            </Link>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-8 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Table of Contents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections?.map((s, i) => (
              <a
                key={s?.id}
                href={`#${s?.id}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
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
                  <span className="text-blue-500 font-bold text-sm w-6">{index + 1}.</span>
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
            <a href="mailto:legal@hnchat.net" className="text-blue-400 hover:text-blue-300">
              legal@hnchat.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
