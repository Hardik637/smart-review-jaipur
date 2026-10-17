import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Mock business data for demo or fallback
export const DEMO_BUSINESS = {
  id: "welurik-media",
  userId: "demo-user-id",
  name: "welurik.media",
  slug: "welurik-media",
  category: "services",
  location: "Nagpur, Maharashtra",
  description: "Performance marketing, web design, SEO, and ROI-driven growth.",
  logoUrl: "",
  googleReviewUrl: "https://g.page/r/CQwNStINFiQ2EBM/review",
  brandColor: "#6366f1",
  phone: "+91 98765 43210",
  monthlyAiQuota: 500,
  aiCallsThisMonth: 12,
  services: [
    { id: "s1", name: "Web Development", businessId: "welurik-media" },
    { id: "s2", name: "SEO & Google Ranking", businessId: "welurik-media" },
    { id: "s3", name: "Performance Marketing", businessId: "welurik-media" },
    { id: "s4", name: "Social Media Growth", businessId: "welurik-media" },
    { id: "s5", name: "UI/UX Design", businessId: "welurik-media" },
  ],
  topics: [
    { id: "t1", name: "Exceptional ROI & Results", type: "positive", businessId: "welurik-media" },
    { id: "t2", name: "Fast Communication & Support", type: "positive", businessId: "welurik-media" },
    { id: "t3", name: "Stunning Website Design", type: "positive", businessId: "welurik-media" },
    { id: "t4", name: "Creative Strategy & Execution", type: "positive", businessId: "welurik-media" },
    { id: "t5", name: "Professional & Reliable Team", type: "positive", businessId: "welurik-media" },
    { id: "t6", name: "On-Time Project Delivery", type: "positive", businessId: "welurik-media" },
    { id: "t7", name: "Project Timeline", type: "issue", businessId: "welurik-media" },
    { id: "t8", name: "Scope Clarification", type: "issue", businessId: "welurik-media" },
  ],
};
