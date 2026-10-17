import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@thecoffeehouse.com" },
    update: {},
    create: {
      email: "demo@thecoffeehouse.com",
      password: "password123", // For demo
    },
  });

  // 2. Create Demo Business
  const cafeCategory = CATEGORIES.find((c) => c.id === "cafe") || CATEGORIES[0];

  const business = await prisma.business.upsert({
    where: { slug: "the-coffee-house" },
    update: {},
    create: {
      userId: demoUser.id,
      name: "The Coffee House",
      slug: "the-coffee-house",
      category: "cafe",
      location: "Downtown Plaza, 4th Avenue",
      description: "Artisan specialty coffee roastery & fresh sourdough bakery.",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      brandColor: "#4f46e5",
      phone: "+91 98765 43210",
      monthlyAiQuota: 500,
      aiCallsThisMonth: 42,
    },
  });

  // 3. Add Services
  for (const s of cafeCategory.defaultServices) {
    await prisma.businessService.create({
      data: {
        businessId: business.id,
        name: s,
      },
    });
  }

  // 4. Add Topics
  for (const t of cafeCategory.positiveTopics) {
    await prisma.businessTopic.create({
      data: {
        businessId: business.id,
        name: t,
        type: "positive",
      },
    });
  }

  for (const t of cafeCategory.issueTopics) {
    await prisma.businessTopic.create({
      data: {
        businessId: business.id,
        name: t,
        type: "issue",
      },
    });
  }

  // 5. Seed Some Sample Analytics Events & Reviews for a thriving dashboard look
  const sampleReviews = [
    {
      topics: ["Coffee Quality", "Friendly Baristas", "Cozy Ambience"],
      services: ["Specialty Coffee", "Artisan Bakery"],
      comment: "Best pour-over in town!",
      review: "Had a fantastic experience at The Coffee House! The specialty coffee and artisan bakery items were top notch. The friendly baristas and cozy ambience really stood out to me. Best pour-over in town! Will definitely be coming back again soon.",
      status: "opened_google",
    },
    {
      topics: ["Quick Service", "Cleanliness", "Value for Money"],
      services: ["All-Day Breakfast", "Cold Brew"],
      comment: "",
      review: "Really impressed with The Coffee House. The all-day breakfast and cold brew was great, and the cleanliness and quick service made the visit smooth and enjoyable. 5 stars!",
      status: "copied",
    },
    {
      topics: ["Fast Wi-Fi & Work Friendly", "Coffee Quality"],
      services: ["Specialty Coffee"],
      comment: "Super quiet on weekdays, great place to work.",
      review: "Visited The Coffee House recently and loved it. The coffee quality was exceptional and it's a very fast Wi-Fi and work-friendly environment. Looking forward to my next visit!",
      status: "opened_google",
    },
  ];

  for (const r of sampleReviews) {
    await prisma.reviewSession.create({
      data: {
        businessId: business.id,
        rating: 5,
        selectedTopics: JSON.stringify(r.topics),
        selectedServices: JSON.stringify(r.services),
        customerComment: r.comment,
        generatedReview: r.review,
        status: r.status,
      },
    });
  }

  // Sample feedback
  await prisma.feedback.create({
    data: {
      businessId: business.id,
      customerName: "Rahul Sharma",
      customerPhone: "9876543210",
      message: "Loved the cappuccino! Just a small note: the AC near table 4 was a bit too cold today.",
      issueTopics: JSON.stringify(["Seating Availability"]),
      status: "unread",
    },
  });

  // Seed events
  for (let i = 0; i < 48; i++) {
    await prisma.analyticsEvent.create({
      data: {
        businessId: business.id,
        eventType: i % 3 === 0 ? "google_clicked" : i % 2 === 0 ? "review_copied" : "scan",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
