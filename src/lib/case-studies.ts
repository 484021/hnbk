export interface CaseStudyResult {
  label: string;
  value: string;
  description: string;
}

export interface CaseStudyData {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  location: string;
  summary: string;
  resultSummary: string;
  challenge: string;
  solution: string;
  whatWeBuilt: string[];
  results: CaseStudyResult[];
  tags: string[];
  published_at: string;
  demoHref?: string;
}

export const caseStudies: CaseStudyData[] = [
  {
    id: "1",
    slug: "instagram-content-automation",
    title: "AI-Powered Instagram Content Pipeline",
    client: "Nova Social",
    industry: "Marketing Agency",
    location: "Toronto, ON",
    summary:
      "Replaced a full-time manual content workflow with an AI pipeline that researches, generates, and auto-publishes Instagram content every day.",
    resultSummary: "20+ hrs/week saved · Deployed in 2 weeks",
    challenge:
      "Nova Social's content team was nearly consumed by manual production — researching trends, scripting captions, sourcing visuals in Photoshop, and manually scheduling every post. A full-time employee was almost entirely tied to this cycle, leaving no capacity for strategy, new client acquisition, or creative growth. The agency needed to maintain consistent, high-quality Instagram output without the operational overhead.",
    solution:
      "HNBK built an end-to-end Instagram content automation pipeline in two weeks. The system autonomously researches trending topics daily, generates branded post copy and captions, produces visual assets using Google Veo, and auto-schedules and publishes to Instagram — without any manual intervention.",
    whatWeBuilt: [
      "Trend research agent using Gemini Nano to surface daily topic ideas aligned to the brand",
      "Post copy and caption generation with consistent brand voice and hashtag strategy",
      "Visual asset creation via Google Veo (text-to-image and short-form video)",
      "Automated quality review checkpoint before scheduling",
      "Auto-publish pipeline via the Meta Graph API with retry logic",
    ],
    results: [
      {
        label: "Time Saved",
        value: "20+ hrs/wk",
        description: "50% of a full-time employee's workweek reclaimed",
      },
      {
        label: "Build Time",
        value: "2 weeks",
        description: "From kickoff to live production pipeline",
      },
      {
        label: "Posting Cadence",
        value: "Daily",
        description: "Consistent daily posts maintained automatically",
      },
      {
        label: "Team Impact",
        value: "1 FTE freed",
        description: "Content creator redeployed to strategy and client growth",
      },
    ],
    tags: ["AI Agents", "Content Automation", "Gemini", "Instagram API"],
    published_at: "2026-04-01",
    demoHref: "/demo/instagram-pipeline",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudyData | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}
