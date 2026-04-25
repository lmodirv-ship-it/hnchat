import React from 'react';

interface SchemaOrgProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

export default function SchemaOrg({ schema }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);


}

// Pre-built schemas for common pages
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'hnChat',
  url: 'https://hnchat.net',
  logo: "https://img.rocket.new/generatedImages/rocket_gen_img_10491cce8-1767660840273.png",
  description: 'hnChat is the ultimate super app combining social networking, short video, live streaming, AI assistant, marketplace, crypto trading, and more.',
  sameAs: ['https://hnchat.net'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://hnchat.net/sign-up-login'
  }
};

export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'hnChat',
  url: 'https://hnchat.net',
  description: 'The ultimate super app: social networking, short videos, live streaming, AI, marketplace, crypto, and more.',
  applicationCategory: 'SocialNetworkingApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '99',
    priceCurrency: 'USD',
    offerCount: '4'
  },
  featureList: [
  'Social Feed & Posts',
  'Short Videos (TikTok-style)',
  'Live Streaming',
  'Real-time Chat & Messaging',
  'AI Assistant (GPT-4, Claude, Gemini)',
  'Marketplace & eCommerce',
  'Crypto Trading',
  'Voice Rooms',
  'Games Hub',
  'Stories'],

  author: {
    '@type': 'Organization',
    name: 'hnChat',
    url: 'https://hnchat.net'
  }
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
  {
    '@type': 'Question',
    name: 'What is hnChat?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'hnChat is a super app that combines social networking, short videos, live streaming, AI assistant, marketplace, crypto trading, voice rooms, and games — all in one platform.'
    }
  },
  {
    '@type': 'Question',
    name: 'Is hnChat free to use?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, hnChat has a free plan. Premium subscription plans with advanced features are available starting from a low monthly fee.'
    }
  },
  {
    '@type': 'Question',
    name: 'What AI models does hnChat support?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'hnChat AI Hub supports GPT-4, Claude, and Gemini — all accessible from one unified interface.'
    }
  },
  {
    '@type': 'Question',
    name: 'Can I sell products on hnChat?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, hnChat has a built-in marketplace where you can buy and sell products directly within your social feed.'
    }
  },
  {
    '@type': 'Question',
    name: 'Does hnChat support crypto trading?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, hnChat includes a crypto trading feature (hnTrade) where you can track and trade cryptocurrencies without leaving the app.'
    }
  }]

};

export const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'hnChat Super App',
  operatingSystem: 'Web',
  applicationCategory: 'SocialNetworkingApplication',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1'
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
};