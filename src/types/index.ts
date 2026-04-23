export interface Lead {
  id?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  service_interest?: string;
  created_at?: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: Record<string, string>;
  tags: string[];
  hero_image?: string;
  published_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  published: boolean;
  ai_generated: boolean;
  created_at: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
  href: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
}
