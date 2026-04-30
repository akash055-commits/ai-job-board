export const PROFILE_MEMORY_MARKDOWN = `
# Akash Chaurasia

## Professional Summary
Growth and performance marketing operator with strong product instincts. Currently manages high-scale paid acquisition and measurement systems at Housing.com across Meta, Google, RTB, Criteo, and Taboola. Prior experience spans product management, GTM, operations, analytics, and startup execution.

## Experience Signals
- Growth Associate at Housing.com, owning INR 3Cr+ monthly spend across 36 cities.
- Product Manager at Pinnacle Infotech building internal talent systems, GTM motions, and analytics dashboards.
- Earlier product and growth internships at Leapfinance and Krishi Network.
- IIT Kharagpur graduate with strong analytical depth.

## Skill Clusters
- Performance Marketing: Meta Ads, Google Ads, attribution, incrementality, campaign structure, lead gen.
- Product and Growth: experimentation, CRM, funnel optimization, PRDs, GTM, DAU growth.
- Data and MarTech: SQL, Python, Postgres, AWS Glue, Athena, QuickSight, Pixel, SDK, CAPI, Branch.
- AI and Automation: Claude, ChatGPT, Gemini, Kling, Veo, prompt engineering, creative automation.

## Targeting Preferences
- Roles: Growth, Product, Growth Product, Performance Marketing, Founder’s Office with GTM scope.
- Company types: early-stage startups, high-ownership teams, consumer tech, marketplaces, SaaS, proptech, fintech, AI-enabled products.
- Locations: Gurugram, Delhi NCR, Bengaluru, Remote.

## De-prioritize
- Pure brand marketing without experimentation ownership.
- Roles that are junior internship-only or exclusively field-sales.
`.trim();

export type UserProfile = {
  name: string;
  headline: string;
  currentLocation: string;
  preferredLocations: string[];
  targetRoles: string[];
  targetRoleTypes: Array<"GROWTH" | "PRODUCT" | "MARKETING" | "FOUNDERS_OFFICE" | "OPERATIONS">;
  industries: string[];
  mustHaveSignals: string[];
  avoidSignals: string[];
  skills: string[];
  seniorityRange: string[];
  memory: string;
};

export const userProfile: UserProfile = {
  name: "Akash Chaurasia",
  headline: "Growth / Product / Performance Marketing operator for high-ownership startup roles",
  currentLocation: "Gurugram, Haryana, India",
  preferredLocations: ["Gurugram", "Delhi NCR", "Bengaluru", "Remote", "Hybrid"],
  targetRoles: [
    "Growth Manager",
    "Senior Growth Associate",
    "Growth Lead",
    "Performance Marketing Manager",
    "Product Manager",
    "Growth Product Manager",
    "Founder's Office"
  ],
  targetRoleTypes: ["GROWTH", "PRODUCT", "MARKETING", "FOUNDERS_OFFICE", "OPERATIONS"],
  industries: ["consumer tech", "marketplace", "proptech", "fintech", "saas", "ai"],
  mustHaveSignals: [
    "experimentation",
    "ownership",
    "0-1",
    "startup",
    "growth",
    "product thinking",
    "analytics"
  ],
  avoidSignals: ["internship", "field sales", "telecalling", "brand executive", "campus ambassador"],
  skills: [
    "meta ads",
    "google ads",
    "performance marketing",
    "growth",
    "product",
    "gtm",
    "crm",
    "sql",
    "python",
    "postgres",
    "aws",
    "experimentation",
    "incrementality",
    "attribution",
    "capi",
    "pixel",
    "moengage",
    "branch",
    "analytics",
    "prompt engineering"
  ],
  seniorityRange: ["associate", "manager", "lead", "senior"],
  memory: PROFILE_MEMORY_MARKDOWN
};
