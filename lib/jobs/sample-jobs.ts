import { JobSource } from "@/lib/domain";
import type { JobInput } from "@/lib/types";

export const sampleJobs: JobInput[] = [
  {
    title: "Growth Manager",
    company: "Sprinto",
    location: "Bengaluru / Remote",
    description:
      "Own paid acquisition, lifecycle experimentation, attribution, CRM and channel scaling for a fast-growing SaaS startup. High ownership, cross-functional work with product and data.",
    applyLink: "https://jobs.lever.co/sprinto/example-growth-manager",
    source: JobSource.COMPANY_PAGE,
    sourceLink: "https://jobs.lever.co/sprinto",
    datePosted: new Date("2026-04-21")
  },
  {
    title: "Senior Product Manager, Growth",
    company: "Razorpay",
    location: "Bengaluru",
    description:
      "Lead growth loops, funnel experiments, product analytics and monetization initiatives for a high-scale fintech product. Looking for product thinkers with experimentation depth.",
    applyLink: "https://job-boards.greenhouse.io/razorpay/example-growth-pm",
    source: JobSource.WELLFOUND,
    sourceLink: "https://wellfound.com/jobs/example-growth-pm",
    datePosted: new Date("2026-04-20")
  },
  {
    title: "Performance Marketing Lead",
    company: "Noise",
    location: "Gurugram",
    description:
      "Scale Meta and Google campaigns, own attribution, improve CAC efficiency and partner with creative, product and analytics. Consumer-tech brand, fast decision-making and visible ROI.",
    applyLink: "https://www.linkedin.com/jobs/view/example-noise-performance",
    source: JobSource.LINKEDIN,
    sourceLink: "https://www.linkedin.com/jobs/search/?keywords=performance%20marketing%20lead",
    datePosted: new Date("2026-04-22")
  },
  {
    title: "Founder's Office - Growth",
    company: "Mysa",
    location: "Remote",
    description:
      "Drive GTM strategy, set up dashboards, own revenue experiments, and work directly with founders across product, growth, and operations. Ideal for a builder who likes ambiguity.",
    applyLink: "https://instahyre.com/job/example-founders-office-growth",
    source: JobSource.INSTAHYRE,
    sourceLink: "https://instahyre.com/candidate/opportunities/",
    datePosted: new Date("2026-04-19")
  },
  {
    title: "Growth Product Manager",
    company: "CRED",
    location: "Bengaluru",
    description:
      "Shape lifecycle journeys, activation, engagement and retention experiments. Need strong analytics, product intuition and business impact orientation.",
    applyLink: "https://www.indeed.com/viewjob?jk=example-cred-growth-product",
    source: JobSource.INDEED,
    sourceLink: "https://www.indeed.com/jobs?q=growth+product+manager",
    datePosted: new Date("2026-04-18")
  },
  {
    title: "Marketing Manager - Brand Partnerships",
    company: "LargeCo",
    location: "Mumbai",
    description:
      "Drive offline branding, celebrity partnerships and event marketing. Limited analytics ownership and no product or performance marketing scope.",
    applyLink: "https://www.naukri.com/job-listings-example-brand-partnerships",
    source: JobSource.NAUKRI,
    sourceLink: "https://www.naukri.com/marketing-manager-jobs",
    datePosted: new Date("2026-04-20")
  },
  {
    title: "Business Operations Associate",
    company: "Zepto",
    location: "Bengaluru",
    description:
      "Work on marketplace analytics, growth levers, pricing experiments and process design for a high-growth consumer startup. SQL and cross-functional execution preferred.",
    applyLink: "https://wellfound.com/jobs/example-bizops-zepto",
    source: JobSource.WELLFOUND,
    sourceLink: "https://wellfound.com/jobs",
    datePosted: new Date("2026-04-17")
  },
  {
    title: "Growth Associate",
    company: "Airblack",
    location: "Gurugram / Hybrid",
    description:
      "Run acquisition experiments, manage Meta campaigns, improve CRM journeys and collaborate closely with product. Startup, high ownership, rapid iteration, strong consumer focus.",
    applyLink: "https://www.linkedin.com/jobs/view/example-airblack-growth-associate",
    source: JobSource.LINKEDIN,
    sourceLink: "https://www.linkedin.com/jobs/search/?keywords=growth%20associate",
    datePosted: new Date("2026-04-22")
  }
];
