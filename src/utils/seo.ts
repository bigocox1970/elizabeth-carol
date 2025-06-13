export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export const seoConfig: Record<string, SEOConfig> = {
  home: {
    title: "Elizabeth Carol - Professional Clairvoyant & Psychic Medium in Oxford",
    description: "Elizabeth Carol, Oxford's trusted clairvoyant and psychic medium with 35+ years experience. Book psychic readings, tarot consultations, and spiritual guidance in Oxfordshire. Call 01865 361 786.",
    keywords: "clairvoyant Oxford, psychic medium Oxford, tarot reading Oxford, spiritual guidance Oxfordshire, psychic readings Oxford, mediumship Oxford",
    canonicalUrl: "https://www.elizabethcarol.co.uk/"
  },
  about: {
    title: "About Elizabeth Carol - 35+ Years as Oxford's Trusted Psychic Medium",
    description: "Meet Elizabeth Carol, Oxford's experienced clairvoyant and psychic medium. Born in Wales with 35+ years of spiritual practice, offering compassionate psychic readings and mediumship in Oxfordshire.",
    keywords: "Elizabeth Carol psychic medium, Oxford clairvoyant experience, Welsh spiritual heritage, psychic medium background Oxford",
    canonicalUrl: "https://www.elizabethcarol.co.uk/about"
  },
  services: {
    title: "Psychic Reading Services Oxford - Clairvoyant & Medium Services",
    description: "Professional psychic reading services in Oxford by Elizabeth Carol. One-to-one readings, group sessions, telephone consultations, tarot readings, and spiritual guidance. Book your reading today.",
    keywords: "psychic readings Oxford, clairvoyant services Oxford, tarot reading services, mediumship Oxford, spiritual consultations Oxfordshire",
    canonicalUrl: "https://www.elizabethcarol.co.uk/services"
  },
  testimonials: {
    title: "Client Testimonials - Elizabeth Carol Psychic Medium Oxford Reviews",
    description: "Read genuine testimonials from Elizabeth Carol's clients across Oxford and Oxfordshire. Discover why people trust her psychic readings, mediumship, and spiritual guidance for over 35 years.",
    keywords: "Elizabeth Carol reviews, psychic medium testimonials Oxford, clairvoyant reviews Oxfordshire, spiritual guidance feedback",
    canonicalUrl: "https://www.elizabethcarol.co.uk/testimonials"
  },
  blog: {
    title: "Spiritual Blog - Psychic Insights & Guidance by Elizabeth Carol",
    description: "Spiritual insights, psychic guidance, and wisdom from Elizabeth Carol's 35+ years as a professional medium. Explore articles on spiritual development, psychic abilities, and life guidance.",
    keywords: "spiritual blog, psychic insights, mediumship guidance, spiritual development articles, psychic wisdom Oxford",
    canonicalUrl: "https://www.elizabethcarol.co.uk/blog"
  },
  contact: {
    title: "Contact Elizabeth Carol - Book Psychic Reading Oxford",
    description: "Contact Elizabeth Carol to book your psychic reading in Oxford. Available for one-to-one sessions, group readings, telephone consultations. Call 01865 361 786 or book online.",
    keywords: "book psychic reading Oxford, contact Elizabeth Carol, psychic medium appointments Oxford, spiritual consultation booking",
    canonicalUrl: "https://www.elizabethcarol.co.uk/contact"
  },
  privacy: {
    title: "Privacy Policy - Elizabeth Carol Psychic Medium Oxford",
    description: "Privacy policy for Elizabeth Carol's psychic medium services in Oxford. Learn how we protect your personal information and maintain confidentiality in all spiritual consultations.",
    keywords: "privacy policy psychic medium, data protection spiritual services, confidentiality psychic readings",
    canonicalUrl: "https://www.elizabethcarol.co.uk/privacy"
  },
  terms: {
    title: "Terms of Service - Elizabeth Carol Psychic Medium Oxford",
    description: "Terms and conditions for Elizabeth Carol's psychic medium and clairvoyant services in Oxford. Understanding our service agreements and booking policies.",
    keywords: "terms conditions psychic medium, service agreement spiritual readings, booking policy Oxford clairvoyant",
    canonicalUrl: "https://www.elizabethcarol.co.uk/terms"
  }
};

export const getPageSEO = (page: string): SEOConfig => {
  return seoConfig[page] || seoConfig.home;
};

export const generateBlogPostSEO = (title: string, excerpt: string, slug: string): SEOConfig => {
  return {
    title: `${title} - Elizabeth Carol Spiritual Blog`,
    description: excerpt.length > 160 ? excerpt.substring(0, 157) + '...' : excerpt,
    keywords: `${title.toLowerCase()}, spiritual guidance, psychic insights, Elizabeth Carol blog`,
    canonicalUrl: `https://www.elizabethcarol.co.uk/blog/${slug}`
  };
}; 