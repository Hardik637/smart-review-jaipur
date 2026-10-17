import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateReviewParams {
  businessName: string;
  category: string;
  location?: string | null;
  selectedTopics: string[];
  selectedServices: string[];
  customerComment?: string | null;
  tone?: "short" | "natural" | "detailed";
  rating?: number;
}

export interface GeneratedReviewResult {
  review: string;
  source: "gemini" | "smart_nlp";
}

export const MIXED_REVIEW_ANGLES = [
  {
    vibe: "Hit or Miss",
    guidance: "Balanced 3-star review. Some parts were okay, but other aspects were lacking.",
  },
  {
    vibe: "Decent but Flawed",
    guidance: "Average visit. Highlight what was acceptable and what needs noticeable improvement.",
  },
];

export const CRITICAL_REVIEW_ANGLES = [
  {
    vibe: "Disappointed Customer",
    guidance: "1-2 star review. Frustrated or dissatisfied with quality, service, or long delays.",
  },
  {
    vibe: "Poor Service & Attentiveness",
    guidance: "1-2 star review. Staff was slow, dismissive, or inattentive. Expected better.",
  },
  {
    vibe: "Quality & Value Issue",
    guidance: "1-2 star review. Subpar experience and not worth the cost or wait time.",
  },
];

// ---------------------------------------------------------------------------
// 1. DYNAMIC TOPIC & SERVICE HUMANIZERS
// ---------------------------------------------------------------------------

function humanizeTopic(topic: string, category: string): { clause: string; highlight: string; experience: string } {
  const t = topic.toLowerCase().trim();
  const cat = (category || "").toLowerCase();

  // NUTRITION / SUPPLEMENTS
  if (cat.includes("nutrition") || cat.includes("supplement") || cat.includes("protein")) {
    if (t.includes("seal") || t.includes("batch") || t.includes("verif")) {
      return {
        clause: "the scratch codes and batch numbers verify right away on the official brand website",
        highlight: "authentic sealed packaging and verifiable batch numbers",
        experience: "I checked the scratch code and batch QR code on the tub right at the counter, and it verified instantly as 100% genuine",
      };
    }
    if (t.includes("genuine") || t.includes("authentic") || t.includes("100%")) {
      return {
        clause: "all the supplements are 100% genuine with official importer holographic tags",
        highlight: "guaranteed authentic products without having to worry about counterfeits",
        experience: "the stock is 100% authentic, backed by legitimate importer seals and genuine batch dates",
      };
    }
    if (t.includes("recommend") || t.includes("honest") || t.includes("knowledge") || t.includes("advice")) {
      return {
        clause: "the owner gives honest, goal-oriented advice instead of pushing high-margin products",
        highlight: "knowledgeable, transparent advice tailored to my fitness and recovery goals",
        experience: "the staff took time to understand my workout routine and gave genuinely honest recommendations without any pushy sales pitch",
      };
    }
    if (t.includes("price") || t.includes("rate") || t.includes("value") || t.includes("cost") || t.includes("discount")) {
      return {
        clause: "their rates easily match or beat online supplement deals with immediate in-hand pickup",
        highlight: "super competitive pricing with the peace of mind of an authorized dealer",
        experience: "the pricing was better than top online portals and I walked out with genuine product in hand",
      };
    }
    if (t.includes("variety") || t.includes("brand") || t.includes("flavor") || t.includes("stock")) {
      return {
        clause: "they stock a massive selection of leading domestic and imported fitness brands and fresh flavors",
        highlight: "wide variety of top whey proteins, creatines, and daily fitness essentials",
        experience: "they maintain fresh inventory with an extensive choice of flavors and authentic brands",
      };
    }
    if (t.includes("quick") || t.includes("fast") || t.includes("bill") || t.includes("service")) {
      return {
        clause: "the counter service was fast, polite, and completely seamless",
        highlight: "swift billing and courteous customer assistance",
        experience: "the checkout was quick, courteous, and hassle-free",
      };
    }
    return {
      clause: `they place strong emphasis on ${topic.toLowerCase()}`,
      highlight: `quality ${topic.toLowerCase()}`,
      experience: `really appreciated their attention to ${topic.toLowerCase()}`,
    };
  }

  // GYM / FITNESS
  if (cat.includes("gym") || cat.includes("fitness") || cat.includes("workout") || cat.includes("crossfit")) {
    if (t.includes("equip") || t.includes("machine") || t.includes("weight")) {
      return {
        clause: "the machines have excellent biomechanics and they have plenty of sturdy squat racks and free weights",
        highlight: "modern imported equipment and well-maintained lifting stations",
        experience: "the machine biomechanics and dumbbell range make heavy training super effective",
      };
    }
    if (t.includes("train") || t.includes("coach") || t.includes("guidance")) {
      return {
        clause: "the trainers pay close attention to posture and offer helpful workout pointers",
        highlight: "attentive and supportive trainers who guide without being pushy",
        experience: "the coaching staff is very supportive, always ready to guide on form and workout splits",
      };
    }
    if (t.includes("vibe") || t.includes("atmosphere") || t.includes("energy")) {
      return {
        clause: "the energy on the floor is motivating and the music keeps you focused throughout",
        highlight: "high-energy workout atmosphere and respectful gym community",
        experience: "the workout vibe is super motivating with great energy and dedicated lifters",
      };
    }
    if (t.includes("clean") || t.includes("hygiene") || t.includes("space")) {
      return {
        clause: "the workout floor is spacious, clean, and properly ventilated",
        highlight: "spotless gym hygiene and well-organized equipment",
        experience: "everything is kept thoroughly clean and the gym floor has ample workout space",
      };
    }
    return {
      clause: `their ${topic.toLowerCase()} is top notch`,
      highlight: `great ${topic.toLowerCase()}`,
      experience: `very impressed with their ${topic.toLowerCase()}`,
    };
  }

  // SPORTSWEAR & CUSTOM PRINTING
  if (cat.includes("sport") || cat.includes("garment") || cat.includes("activewear") || cat.includes("jersey") || cat.includes("cloth") || cat.includes("print") || cat.includes("gift")) {
    if (t.includes("fabric") || t.includes("material") || t.includes("cloth") || t.includes("comfort")) {
      return {
        clause: "the fabric is lightweight, breathable, and holds up great through tough workouts",
        highlight: "premium sweat-wicking cloth and durable stitching",
        experience: "the cloth quality is top notch — breathable, flexible, and doesn't lose shape after washing",
      };
    }
    if (t.includes("print") || t.includes("mug") || t.includes("gift") || t.includes("mirror") || t.includes("pillow")) {
      return {
        clause: "the sublimation print clarity is crystal sharp with vibrant, long-lasting colors",
        highlight: "vibrant photo clarity and premium finish on personalized gifting",
        experience: "the customized printing turned out stunning with crisp details and rich colors",
      };
    }
    if (t.includes("fit") || t.includes("size") || t.includes("design")) {
      return {
        clause: "the activewear fits true to size with modern athletic cuts",
        highlight: "perfect athletic fit and comfortable stretch",
        experience: "the sizing is spot on and the designs look modern and stylish",
      };
    }
    return {
      clause: `the ${topic.toLowerCase()} exceeded expectations`,
      highlight: `high quality ${topic.toLowerCase()}`,
      experience: `really pleased with the ${topic.toLowerCase()}`,
    };
  }

  // SOLAR & ENGINEERING
  if (cat.includes("solar") || cat.includes("energy") || cat.includes("engineer") || cat.includes("electrical")) {
    if (t.includes("bill") || t.includes("saving") || t.includes("generation")) {
      return {
        clause: "our monthly electricity bills dropped to near zero right after commissioning",
        highlight: "drastic electricity bill reduction and steady solar unit generation",
        experience: "our power bills have plummeted and the solar generation numbers match the project estimates perfectly",
      };
    }
    if (t.includes("subsidy") || t.includes("meter") || t.includes("discom") || t.includes("paperwork")) {
      return {
        clause: "they handled the entire PM Surya Ghar subsidy paperwork and discom net metering seamlessly",
        highlight: "hassle-free government subsidy approvals and quick net meter installation",
        experience: "the team took care of all the discom liaisoning and subsidy portal paperwork without any headache for us",
      };
    }
    if (t.includes("structure") || t.includes("wiring") || t.includes("install") || t.includes("quality")) {
      return {
        clause: "they used a heavy-duty galvanized mounting structure and clean conduit wiring",
        highlight: "robust galvanized mounting and neat, professional electrical cabling",
        experience: "the structural fabrication is solid galvanized steel and the inverter wiring is exceptionally neat",
      };
    }
    return {
      clause: `the ${topic.toLowerCase()} was executed with thorough engineering precision`,
      highlight: `professional ${topic.toLowerCase()}`,
      experience: `the team demonstrated great expertise in ${topic.toLowerCase()}`,
    };
  }

  // SALON & BEAUTY
  if (cat.includes("salon") || cat.includes("beauty") || cat.includes("makeup") || cat.includes("spa") || cat.includes("parlour") || cat.includes("hair")) {
    if (t.includes("makeup") || t.includes("bridal") || t.includes("party")) {
      return {
        clause: "the makeup was radiant and natural without feeling cakey, and lasted flawlessly all evening",
        highlight: "elegant, skin-like makeup finish and great photo payoff",
        experience: "my makeup looked elegant and natural throughout the event and I received endless compliments",
      };
    }
    if (t.includes("skin") || t.includes("facial") || t.includes("glow")) {
      return {
        clause: "my skin feels refreshed, supple, and glowing with zero redness or irritation",
        highlight: "instant natural glow and deeply nourishing skincare",
        experience: "the facial gave my skin an instant radiant glow using gentle, premium products",
      };
    }
    if (t.includes("wax") || t.includes("thread") || t.includes("painless") || t.includes("gentle")) {
      return {
        clause: "the beautician had very gentle hands and used hygienic, single-use strips for a virtually painless session",
        highlight: "gentle, virtually painless waxing and hygienic standards",
        experience: "such gentle and careful service with proper hygiene and sanitized tools",
      };
    }
    return {
      clause: `the ${topic.toLowerCase()} was done with wonderful care`,
      highlight: `delightful ${topic.toLowerCase()}`,
      experience: `thoroughly enjoyed the relaxing ${topic.toLowerCase()}`,
    };
  }

  // CAFE / RESTAURANT
  if (cat.includes("cafe") || cat.includes("restaurant") || cat.includes("food") || cat.includes("bakery") || cat.includes("coffee")) {
    if (t.includes("taste") || t.includes("food") || t.includes("delicious") || t.includes("flavor")) {
      return {
        clause: "everything was freshly prepared, well-seasoned, and full of flavor",
        highlight: "rich flavors and freshly made items",
        experience: "the taste and freshness were spot on from the very first bite",
      };
    }
    if (t.includes("coffee") || t.includes("beverage") || t.includes("drink")) {
      return {
        clause: "the coffee had a rich aroma and perfectly balanced brew",
        highlight: "top-notch coffee brew and refreshing drinks",
        experience: "the coffee was rich, smooth, and brewed to perfection",
      };
    }
    if (t.includes("vibe") || t.includes("ambience") || t.includes("atmosphere")) {
      return {
        clause: "the atmosphere is warm, cozy, and perfect for catching up or unwinding",
        highlight: "cozy aesthetic ambiance and relaxing seating",
        experience: "loved the cozy vibe and pleasant background music",
      };
    }
    return {
      clause: `their ${topic.toLowerCase()} was truly enjoyable`,
      highlight: `great ${topic.toLowerCase()}`,
      experience: `really liked the ${topic.toLowerCase()}`,
    };
  }

  // DEFAULT / GENERAL
  return {
    clause: `their ${topic.toLowerCase()} was carried out with complete professionalism`,
    highlight: `dependable ${topic.toLowerCase()}`,
    experience: `consistently satisfied with their ${topic.toLowerCase()}`,
  };
}

function cleanServiceName(service: string): string {
  // Strip redundant brackets like "Whey Protein (Isolate & Concentrate)" -> "whey protein" or cleaner phrasing
  let s = service.trim();
  s = s.replace(/\s*\([^)]*\)/g, ""); // strip parens for fluid readability
  return s.trim().toLowerCase();
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// 2. MODULAR COMBINATORIAL SYNTHESIS ENGINE (60,000+ Permutations Per Category)
// ---------------------------------------------------------------------------

export function generateSmartTemplateReview(params: GenerateReviewParams): string {
  const {
    businessName,
    category = "general",
    location = "",
    selectedTopics = [],
    selectedServices = [],
    customerComment = "",
    tone = "natural",
    rating = 5,
  } = params;

  const validRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  const isNegative = validRating <= 2;
  const isMixed = validRating === 3;
  const locStr = location && location.trim().length > 0 ? ` in ${location.trim()}` : "";
  const catLower = (category || "").toLowerCase();

  const primaryTopicRaw = selectedTopics[0] || (isNegative ? "Service" : isMixed ? "Quality" : "Quality & Service");
  const secondaryTopicRaw = selectedTopics[1] || "";
  const humanizedPrimary = humanizeTopic(primaryTopicRaw, category);
  const humanizedSecondary = secondaryTopicRaw ? humanizeTopic(secondaryTopicRaw, category) : null;

  const primaryServiceRaw = selectedServices[0] ? cleanServiceName(selectedServices[0]) : "";
  const secondaryServiceRaw = selectedServices[1] ? cleanServiceName(selectedServices[1]) : "";

  const commentAddon = customerComment && customerComment.trim().length > 0
    ? ` ${customerComment.trim().replace(/[.]+$/, "")}.`
    : "";

  // -------------------------------------------------------------------------
  // A. NEGATIVE REVIEWS (1 & 2 Stars)
  // -------------------------------------------------------------------------
  if (isNegative) {
    const negOpenings = [
      `Had a really disappointing experience with ${businessName}.`,
      `Expected much better from ${businessName}, but was let down.`,
      `Very dissatisfied with my visit to ${businessName}.`,
      `Unfortunately, our experience here fell far below expectations.`,
      `Sad to say that ${businessName} did not deliver on what was promised.`,
      `Not happy with the way things were handled at ${businessName}.`,
    ];

    const negBodies = [
      `The staff was unresponsive and the ${humanizedPrimary.highlight} was not up to standard.`,
      `We faced long delays and found the ${humanizedPrimary.highlight} completely substandard.`,
      `There was zero coordination and the service felt totally indifferent to customer concerns.`,
      `The quality was poor and nobody at the counter seemed interested in resolving the issue.`,
    ];

    const negClosings = [
      `Definitely not worth the money or the hassle.${commentAddon}`,
      `Hope the management takes customer feedback seriously and makes immediate improvements.${commentAddon}`,
      `Won't be returning anytime soon.${commentAddon}`,
      `Really frustrating visit overall.${commentAddon}`,
    ];

    if (tone === "short") {
      return `${pickRandom(negOpenings)} ${pickRandom(negClosings)}`;
    }
    return `${pickRandom(negOpenings)} ${pickRandom(negBodies)} ${pickRandom(negClosings)}`;
  }

  // -------------------------------------------------------------------------
  // B. MIXED REVIEWS (3 Stars)
  // -------------------------------------------------------------------------
  if (isMixed) {
    const mixedOpenings = [
      `An average experience at ${businessName}.`,
      `Visited ${businessName} recently and had mixed feelings.`,
      `Decent spot, though there is clear room for improvement.`,
      `Fair visit overall, but not quite what I was hoping for.`,
    ];

    const mixedBodies = [
      `While some aspects were acceptable, the ${humanizedPrimary.highlight} was somewhat inconsistent.`,
      `The ${humanizedPrimary.highlight} was okay, but the response time and overall coordination could be better.`,
      `Good potential here, but the execution on ${humanizedPrimary.highlight} felt a bit rushed.`,
    ];

    const mixedClosings = [
      `An okay option if you're nearby, but needs a bit more consistency.${commentAddon}`,
      `Might consider giving them another chance down the line.${commentAddon}`,
      `Average 3-star experience overall.${commentAddon}`,
    ];

    if (tone === "short") {
      return `${pickRandom(mixedOpenings)} ${pickRandom(mixedClosings)}`;
    }
    return `${pickRandom(mixedOpenings)} ${pickRandom(mixedBodies)} ${pickRandom(mixedClosings)}`;
  }

  // -------------------------------------------------------------------------
  // C. POSITIVE REVIEWS (4-5 Stars) - DYNAMIC COMBINATORIAL GENERATORS
  // -------------------------------------------------------------------------

  // 1. NUTRITION & SUPPLEMENT STORE
  if (catLower.includes("nutrition") || catLower.includes("supplement") || catLower.includes("protein")) {
    const openings = [
      `Finding authentic supplements locally used to be a gamble, but ${businessName}${locStr} has completely solved that.`,
      `Hands down the most trustworthy supplement store${locStr}.`,
      `Been visiting ${businessName} for my workout nutrition and the experience has been consistently top notch.`,
      `Dropped by ${businessName} today to restock my supplements and was thoroughly impressed.`,
      `If you're serious about fitness and want guaranteed original products, ${businessName} is the go-to place.`,
      `Had a really smooth shopping experience at ${businessName} today.`,
      `Really glad to have an authorized, dependable dealer like ${businessName} in the area.`,
      `My workout partner suggested I check out ${businessName}, and it lived up to every expectation.`,
      `Always a pleasure dealing with the team at ${businessName}.`,
      `100% satisfied with my visit to ${businessName} today.`,
      `Stopped by ${businessName} to pick up my fitness essentials and the service was flawless.`,
      `Finally a genuine fitness nutrition shop${locStr} that athletes and lifters can truly rely on.`,
      `Super impressed with the setup and professionalism at ${businessName}.`,
      `Every lifter knows how crucial genuine supplements are, and ${businessName} delivers on that promise every time.`,
      `Quick, transparent, and completely dependable — that's my experience with ${businessName}.`,
      `Visited ${businessName} for the first time today and came away completely convinced.`,
      `Top tier customer service and authentic stock at ${businessName}.`,
      `You can shop at ${businessName} with total peace of mind.`,
    ];

    const bodies = [
      humanizedPrimary.experience + ".",
      `What impressed me most is that ${humanizedPrimary.clause}.`,
      `Their focus on ${humanizedPrimary.highlight} gives immense confidence in every purchase.`,
      `Checked the authentication hologram and batch details on the spot — completely genuine and verified.`,
      `The owner took time to understand my workout goals and gave honest recommendations instead of pushing costly products.`,
      `All products carry official importer tags and genuine tamper-evident seals, leaving zero doubt about authenticity.`,
      `Their pricing is very competitive — easily matches or beats online portals with immediate in-hand pickup.`,
      `The collection is extensive with all major imported and Indian fitness brands readily available in fresh batches.`,
      `What stands out most is their honesty and deep knowledge about nutrition and workout recovery.`,
      `The batch verification was completely transparent and done right in front of me before billing.`,
      `They carry a great range of fresh flavors and authentic stock with valid expiration dates.`,
      `The team answered all my questions patiently and helped me select the right stack for my routine.`,
      `Every single tub has an authentic importer barcode you can verify directly on the brand portal.`,
      `No marketing hype or unnecessary sales talk, just genuine guidance and authentic products.`,
      `Compared their rates with top fitness sites and got a better deal right here with authentic seals.`,
      `The quality of stock is unmatched and everything is properly stored in a clean environment.`,
      `Really appreciated the transparent batch check and courteous attitude at the counter.`,
      `It's rare to find a store where the owner genuinely cares about your fitness journey rather than just making a quick sale.`,
    ];

    const serviceHighlights = primaryServiceRaw
      ? [
          `Got their ${primaryServiceRaw}, and the quality and mixability are spot on.`,
          `Picked up ${primaryServiceRaw} today and it's already showing great recovery results.`,
          `Their stock of ${primaryServiceRaw} is completely genuine with fresh batch dates.`,
          `Specifically bought ${primaryServiceRaw} and couldn't be happier with the purchase.`,
          `Grabbed some ${primaryServiceRaw} at a very reasonable rate.`,
          `The ${primaryServiceRaw} they recommended has been working wonders for my daily routine.`,
          `Really satisfied with the ${primaryServiceRaw} I purchased here.`,
          `Found exactly the ${primaryServiceRaw} I was looking for without any waiting.`,
          `High quality ${primaryServiceRaw} with proper seal and valid bill.`,
          `Purchased ${primaryServiceRaw} and the taste and mixability are fantastic.`,
          `Their collection of ${primaryServiceRaw} is definitely the best around.`,
          `The ${primaryServiceRaw} came with full official importer verification.`,
        ]
      : [];

    const closings = [
      `Will definitely be buying all my future supplement stacks from here.${commentAddon}`,
      `Easily a 5-star store for any athlete or gym-goer.${commentAddon}`,
      `Highly recommend to everyone looking for 100% original fitness nutrition!${commentAddon}`,
      `Keep up the honest work and great service!${commentAddon}`,
      `10/10 for quality, authenticity, and customer care.${commentAddon}`,
      `Definitely coming back next month for my restock.${commentAddon}`,
      `A trustworthy dealer that genuinely values customer health and satisfaction.${commentAddon}`,
      `No need to order online anymore when you have such a reliable local store.${commentAddon}`,
      `Can't recommend them enough to all my workout buddies!${commentAddon}`,
      `Great experience overall and total peace of mind with my purchase.${commentAddon}`,
      `Hands down the best place for genuine supplements.${commentAddon}`,
      `Five stars all the way — dependable, authentic, and courteous.${commentAddon}`,
      `Will be recommending this store to all lifters at my gym.${commentAddon}`,
      `Solid experience from start to finish.${commentAddon}`,
      `Deserves all 5 stars for maintaining genuine standards in this market.${commentAddon}`,
      `Super happy with my purchase and the customer support.${commentAddon}`,
      `A must-visit store for genuine fitness nutrition!${commentAddon}`,
      `Trustworthy shop, genuine products, and great prices — what more could you ask for!${commentAddon}`,
    ];

    if (tone === "short") {
      const shortPicks = [
        `100% genuine supplements and best prices in town! ${humanizedPrimary.highlight} is authentic.${commentAddon} 10/10.`,
        `Awesome store! Verified the importer seal on my purchase right at the counter.${commentAddon} Definitely coming back.`,
        `Super helpful guidance on workout nutrition. ${businessName} is totally dependable.${commentAddon}`,
        `Best spot${locStr} for original whey protein and gym essentials.${commentAddon} Great service!`,
        `Honest advice, genuine products, and fast billing. Verified the batch code myself.${commentAddon} Highly recommend!`,
      ];
      return pickRandom(shortPicks);
    }

    const opening = pickRandom(openings);
    const body = pickRandom(bodies);
    const service = serviceHighlights.length > 0 ? " " + pickRandom(serviceHighlights) : "";
    const closing = pickRandom(closings);

    if (tone === "detailed") {
      const secondBody = humanizedSecondary ? ` ${humanizedSecondary.experience}.` : ` The billing was quick and everything was handled with complete honesty.`;
      return `${opening} ${body}${secondBody}${service} ${closing}`;
    }

    return `${opening} ${body}${service} ${closing}`;
  }

  // 2. GYM & FITNESS CENTER
  if (catLower.includes("gym") || catLower.includes("fitness") || catLower.includes("workout") || catLower.includes("crossfit")) {
    const openings = [
      `Working out at ${businessName} has been an incredible experience.`,
      `Hands down one of the best gyms${locStr}.`,
      `Joined ${businessName} recently and I'm totally loving the training environment.`,
      `If you're serious about your workout goals, ${businessName} is the perfect place.`,
      `Really impressed with the equipment setup and positive energy at ${businessName}.`,
      `Been training here for several months and my strength progress has been phenomenal.`,
      `Great facility, motivating members, and dedicated management at ${businessName}.`,
      `A top-tier fitness club that offers incredible value for the membership.`,
    ];

    const bodies = [
      humanizedPrimary.experience + ".",
      `The machines are biomechanically smooth and they have plenty of free weights and squat racks.`,
      `The trainers genuinely pay attention to proper lifting form and keep everyone motivated.`,
      `The workout floor is spacious, clean, and has great airflow throughout high-intensity sessions.`,
      `What I appreciate most is that ${humanizedPrimary.clause}.`,
      `Everything from dumbbell racks to cable stations is well maintained and organized.`,
    ];

    const closings = [
      `Worth every rupee of the membership.${commentAddon}`,
      `Easily a 5-star gym experience for anyone in the area.${commentAddon}`,
      `Highly recommend to beginners and serious lifters alike!${commentAddon}`,
      `Keep up the great work and high training energy!${commentAddon}`,
      `10/10 training atmosphere and great coaching.${commentAddon}`,
    ];

    if (tone === "short") {
      return `${pickRandom(openings)} ${humanizedPrimary.highlight} is top class.${commentAddon} 10/10.`;
    }
    return `${pickRandom(openings)} ${pickRandom(bodies)} ${pickRandom(closings)}`;
  }

  // 3. SPORTSWEAR & CUSTOM PRINTING / GIFTS
  if (catLower.includes("sport") || catLower.includes("garment") || catLower.includes("activewear") || catLower.includes("jersey") || catLower.includes("cloth") || catLower.includes("print") || catLower.includes("gift")) {
    const isGiftFocus = primaryTopicRaw.toLowerCase().includes("gift") || primaryTopicRaw.toLowerCase().includes("mug") || primaryTopicRaw.toLowerCase().includes("print");

    if (isGiftFocus) {
      const giftOpenings = [
        `Ordered custom gifts from ${businessName} and was blown away by the quality.`,
        `Best shop${locStr} for personalized gifting and customized printing!`,
        `Had a wonderful experience with ${businessName} for customized items.`,
        `Needed a personalized gift on short notice and ${businessName} delivered beyond expectations.`,
      ];
      const giftBodies = [
        humanizedPrimary.experience + ".",
        `The sublimation print clarity is super sharp and the colors came out vibrant.`,
        `The packaging was secure and the design alignment was executed to perfection.`,
      ];
      const giftClosings = [
        `Made for a truly memorable gift.${commentAddon} Highly recommend!`,
        `Will definitely be ordering all my personalized gifts from here.${commentAddon}`,
        `10/10 for print clarity, fast delivery, and honest pricing.${commentAddon}`,
      ];
      return `${pickRandom(giftOpenings)} ${pickRandom(giftBodies)} ${pickRandom(giftClosings)}`;
    }

    const sportOpenings = [
      `Bought activewear from ${businessName} and the cloth quality is top notch.`,
      `Really impressed with the sports apparel collection at ${businessName}.`,
      `Such a reliable store for workout wear and sports jerseys${locStr}.`,
      `Great variety of gym clothes, tracksuits, and activewear at ${businessName}.`,
      `My workout partner recommended ${businessName} for gym wear, and it lived up to expectations.`,
    ];
    const sportBodies = [
      humanizedPrimary.experience + ".",
      `The fabric is lightweight, breathable, and fits comfortably during intense gym workouts.`,
      `The stitching is solid and the material didn't fade or shrink after multiple washes.`,
      `The staff was very patient and helped me try out different fits and sizes.`,
    ];
    const sportClosings = [
      `Definitely coming back for more activewear.${commentAddon}`,
      `Great quality at honest prices — easily 5 stars!${commentAddon}`,
      `Highly recommend to all fitness enthusiasts and athletes.${commentAddon}`,
    ];
    return `${pickRandom(sportOpenings)} ${pickRandom(sportBodies)} ${pickRandom(sportClosings)}`;
  }

  // 4. SOLAR ENERGY & ENGINEERING
  if (catLower.includes("solar") || catLower.includes("energy") || catLower.includes("engineer") || catLower.includes("electrical")) {
    const solarOpenings = [
      `Got our rooftop solar plant installed by ${businessName} and the experience has been seamless.`,
      `Really impressed with the engineering team at ${businessName}.`,
      `Switching to solar with ${businessName} was one of our best decisions.`,
      `Outstanding solar EPC work by ${businessName}${locStr}!`,
      `Professional site survey and honest recommendations from ${businessName}.`,
    ];
    const solarBodies = [
      humanizedPrimary.experience + ".",
      `They guided us through the entire PM Surya Ghar subsidy and net metering process without any hassle.`,
      `The installation features a heavy-duty galvanized mounting structure and clean conduit wiring.`,
      `Our monthly electricity bills have plummeted and the solar generation numbers are right on target.`,
    ];
    const solarClosings = [
      `Truly dependable solar engineers.${commentAddon} 10/10 recommendation!`,
      `Highly recommended for both residential and commercial solar installations.${commentAddon}`,
      `Smooth subsidy paperwork, solid structure, and great customer care.${commentAddon}`,
    ];
    return `${pickRandom(solarOpenings)} ${pickRandom(solarBodies)} ${pickRandom(solarClosings)}`;
  }

  // 5. SALON & BEAUTY PARLOUR
  if (catLower.includes("salon") || catLower.includes("beauty") || catLower.includes("makeup") || catLower.includes("spa") || catLower.includes("parlour") || catLower.includes("hair")) {
    const salonOpenings = [
      `Had a wonderful experience with ${businessName}.`,
      `Best salon and beauty service${locStr}!`,
      `Loved my makeover session with ${businessName}.`,
      `Really impressed with the hygiene standards and gentle hands at ${businessName}.`,
      `So convenient, professional, and relaxing!`,
    ];
    const salonBodies = [
      humanizedPrimary.experience + ".",
      `The beautician was very sweet, gentle, and used sanitized single-use tools.`,
      `The products used were gentle on the skin with zero irritation or redness.`,
      `Everything was done with so much patience and attention to detail.`,
    ];
    const salonClosings = [
      `Definitely my go-to salon from now on!${commentAddon}`,
      `Left me feeling completely refreshed and glowing.${commentAddon} 10/10!`,
      `Highly recommended to all ladies looking for quality beauty care.${commentAddon}`,
    ];
    return `${pickRandom(salonOpenings)} ${pickRandom(salonBodies)} ${pickRandom(salonClosings)}`;
  }

  // 6. CAFE & RESTAURANT
  if (catLower.includes("cafe") || catLower.includes("restaurant") || catLower.includes("food") || catLower.includes("bakery") || catLower.includes("coffee")) {
    const cafeOpenings = [
      `Stopped by ${businessName} today and thoroughly enjoyed it!`,
      `Honestly one of the best spots around${locStr}.`,
      `Had a really pleasant time at ${businessName}.`,
      `Such a cozy and welcoming place!`,
      `Dropped in for a quick bite and was super impressed.`,
    ];
    const cafeBodies = [
      humanizedPrimary.experience + ".",
      `Everything was fresh, flavorful, and served with a smile.`,
      `The atmosphere is relaxing with comfortable seating and great vibe.`,
      `The staff was attentive and made sure our order arrived hot and fresh.`,
    ];
    const cafeClosings = [
      `Definitely making this a regular spot.${commentAddon}`,
      `Great food, welcoming staff, and fair prices.${commentAddon} 10/10!`,
      `Will definitely be bringing friends along next time.${commentAddon}`,
    ];
    return `${pickRandom(cafeOpenings)} ${pickRandom(cafeBodies)} ${pickRandom(cafeClosings)}`;
  }

  // 7. GENERAL / RETAIL SERVICES
  const genOpenings = [
    `Had a really positive experience with ${businessName}.`,
    `Great customer service and trustworthy work at ${businessName}.`,
    `Really glad I decided to go with ${businessName}${locStr}.`,
    `Always a pleasure dealing with a business that genuinely values customer satisfaction.`,
    `Prompt, professional, and reliable — that sums up ${businessName}.`,
  ];
  const genBodies = [
    humanizedPrimary.experience + ".",
    `The staff was courteous, took time to explain everything clearly, and delivered on schedule.`,
    `Quality of service was outstanding and the pricing was completely transparent.`,
  ];
  const genClosings = [
    `Will definitely use their services again.${commentAddon}`,
    `Highly recommended for anyone looking for reliable service in the area.${commentAddon}`,
    `Deserves a full 5-star rating for great work and honest pricing.${commentAddon}`,
  ];
  return `${pickRandom(genOpenings)} ${pickRandom(genBodies)} ${pickRandom(genClosings)}`;
}

// ---------------------------------------------------------------------------
// 3. GOOGLE GEMINI AI GENERATION WITH MODEL FAILOVER & THINKING SHIELD
// ---------------------------------------------------------------------------

let cachedGenAI: GoogleGenerativeAI | null = null;
function getGenAI(apiKey: string): GoogleGenerativeAI {
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
  }
  return cachedGenAI;
}

function timeoutAfter<T>(promise: Promise<T>, ms: number, message = "Timeout"): Promise<T> {
  let timer: NodeJS.Timeout;
  const timerPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timerPromise]).finally(() => clearTimeout(timer));
}

async function callGeminiModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string,
  timeoutMs: number
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.95,
      // @ts-ignore - thinkingBudget: 0 stops Gemini 2.5 from wasting tokens on hidden thinking
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 350,
    },
  });

  const result = await timeoutAfter(
    model.generateContent(prompt),
    timeoutMs,
    `Gemini (${modelName}) timed out after ${timeoutMs}ms`
  );

  const text = result.response.text().trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

async function generateWithGemini(
  apiKey: string,
  params: GenerateReviewParams
): Promise<string> {
  const genAI = getGenAI(apiKey);
  const rating = params.rating ? Math.min(5, Math.max(1, Math.round(params.rating))) : 5;
  const isNegative = rating <= 2;
  const isMixed = rating === 3;

  const toneLength = {
    short: "1-2 punchy, natural sentences (around 18-25 words).",
    natural: "2-3 conversational sentences (around 35-45 words). Sounds like a real customer on their phone.",
    detailed: "3-4 sentences with natural detail (around 55-70 words). Sounds like a helpful Google Local Guide.",
  }[params.tone || "natural"];

  const randomStyles = [
    "Customer who values authenticity and checked the product seals or verified genuine quality.",
    "Regular customer or local resident who appreciates honest recommendations and fair rates.",
    "First-time buyer who was pleasantly surprised by the quick service and helpful advice.",
    "Customer who compared options or prices and found this business to be the best choice in the area.",
    "Passionate enthusiast who is really happy with the performance, quality, and results.",
  ];
  const selectedStyle = pickRandom(randomStyles);

  let sentimentInstructions = "";
  if (isNegative) {
    const angle = pickRandom(CRITICAL_REVIEW_ANGLES);
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS A NEGATIVE ${rating}-STAR REVIEW.
- Angle: ${angle.vibe} (${angle.guidance})
- Express genuine customer disappointment, frustration, or dissatisfaction with this business.
- Point out what went wrong honestly (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "slow service, subpar quality"}).
- ABSOLUTELY BANNED WORDS FOR NEGATIVE REVIEWS: Do NOT say "loved", "great", "10/10", "amazing", "superb", "highly recommend", "definitely coming back", "best".
- End naturally for a negative review (e.g. "Really expected better.", "Needs serious improvement.", "Won't be returning anytime soon.", "Hope management takes note of this.").`;
  } else if (isMixed) {
    const angle = pickRandom(MIXED_REVIEW_ANGLES);
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS AN AVERAGE / MIXED 3-STAR REVIEW.
- Angle: ${angle.vibe} (${angle.guidance})
- Balanced perspective. Mention what was okay, but point out what fell short or was underwhelming (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "service could be better"}).
- ABSOLUTELY BANNED: Do NOT give 10/10 or say "perfect" or "flawless".
- End naturally for a 3-star review (e.g. "Decent spot, but has room for improvement.", "Average experience overall.", "Okay, but could be better.").`;
  } else {
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS A POSITIVE ${rating}-STAR REVIEW.
- Warm, enthusiastic, authentic appreciation for the highlights (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "great quality and friendly service"}).
- End naturally for a positive review (e.g. "Definitely coming back!", "10/10!", "Highly recommend!", "Will be back for sure!").`;
  }

  const prompt = `You are a real local customer writing an authentic Google Maps review on your smartphone for "${params.businessName}" (${params.category}${params.location ? `, located in ${params.location}` : ""}).

Star Rating: ${rating}/5
Perspective Angle: ${selectedStyle}
Selected Customer Highlights: ${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "Great quality, genuine service"}
Specific Items/Services: ${params.selectedServices.length > 0 ? params.selectedServices.join(", ") : "None"}
Customer Note: ${params.customerComment ? `"${params.customerComment}"` : "None"}
Target Length: ${toneLength}

${sentimentInstructions}

CRITICAL ANTI-REPETITION RULES (VERY IMPORTANT):
1. NEVER start the review with "Super clean and well-stocked store!" or "Picked up some...".
2. NEVER use rigid formulaic phrases like "Picked up some [feature]".
   - If mentioning "Original Seal & Batch Verification", speak naturally: "I checked the scratch code and batch number right at the counter and it verified instantly on the brand portal."
   - If mentioning "Knowledgeable, Honest & Transparent Recommendation", speak naturally: "The owner gave genuine, honest advice for my goals rather than pushing expensive products."
3. Every single review must have a completely unique opening sentence and conversational flow.
4. Do NOT use corporate AI clichés: "truly shines", "testament to", "delightful", "impressed beyond measure", "wonderfully", "epitome of", "chilled here".
5. Match the business context accurately (${params.category}):
   - If supplement/nutrition store: talk about verified seals, batch QR codes, genuine protein mixability, honest non-pushy advice, authorized dealer peace of mind.
   - If gym: talk about machines, dumbbells, trainers, motivating floor vibe.
   - If salon: talk about glowing skin, natural makeup finish, gentle hands, relaxing parlour hygiene.
   - If solar: talk about power bill reduction, PM Surya Ghar subsidy, net metering, heavy duty GI structure.
6. Output ONLY the raw review text. No quotes. No preamble.`;

  // Try gemini-2.5-flash first with 7,500ms timeout.
  // If it hits rate limit (429) or errors, failover to gemini-3.6-flash.
  try {
    return await callGeminiModel(genAI, "gemini-2.5-flash", prompt, 7500);
  } catch (err: any) {
    const isRateLimit = err?.message?.includes("429") || err?.status === 429;
    console.warn(`Gemini 2.5-flash failed (${isRateLimit ? "429 Rate Limit" : err?.message}), attempting failover to gemini-3.6-flash...`);
    try {
      return await callGeminiModel(genAI, "gemini-3.6-flash", prompt, 6000);
    } catch (fallbackErr: any) {
      console.warn("Gemini failover also failed, will use smart combinatorial NLP:", fallbackErr?.message);
      throw fallbackErr;
    }
  }
}

// ---------------------------------------------------------------------------
// 4. UNIFIED GENERATION PIPELINE
// ---------------------------------------------------------------------------

export async function generateCustomerReview(params: GenerateReviewParams): Promise<GeneratedReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const review = await generateWithGemini(apiKey, params);
      if (review && review.length > 15) {
        return { review, source: "gemini" };
      }
    } catch (err) {
      // Gracefully fall through to smart dynamic NLP engine
    }
  }

  return {
    review: generateSmartTemplateReview(params),
    source: "smart_nlp",
  };
}

export const generateReview = generateCustomerReview;
