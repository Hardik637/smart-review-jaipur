export interface CategoryConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  defaultServices: string[];
  positiveTopics: string[];
  issueTopics: string[];
  sampleBusinessName: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "cafe",
    name: "Café & Bakery",
    emoji: "☕",
    description: "Cafes, coffee roasters, bakeries, tearooms",
    defaultServices: ["Specialty Coffee", "Artisan Bakery", "All-Day Breakfast", "Desserts", "Cold Brews", "Sandwiches"],
    positiveTopics: ["Coffee Quality", "Fresh Bakery Items", "Friendly Baristas", "Cozy Ambience", "Fast Wi-Fi & Work Friendly", "Cleanliness", "Quick Service", "Value for Money"],
    issueTopics: ["Waiting Time", "Food Temperature", "Coffee Taste", "Seating Availability", "Noise Level", "Pricing"],
    sampleBusinessName: "The Roast & Bean Co."
  },
  {
    id: "restaurant",
    name: "Restaurant & Diner",
    emoji: "🍽️",
    description: "Fine dining, casual dining, family restaurants, bistros",
    defaultServices: ["Dine-In", "Signature Dishes", "Cocktails & Drinks", "Weekend Brunch", "Chef's Specials", "Desserts"],
    positiveTopics: ["Delicious Food", "Great Flavors", "Attentive Staff", "Warm Hospitality", "Vibrant Atmosphere", "Hygiene & Cleanliness", "Generous Portions", "Great Presentation"],
    issueTopics: ["Order Delay", "Food Quality", "Service Inattention", "Table Cleanliness", "Billing Discrepancy", "Noise"],
    sampleBusinessName: "Urban Spice Bistro"
  },
  {
    id: "snacks",
    name: "Indian Snacks, Chaat & Fast Food",
    emoji: "🥟",
    description: "Indian snacks, samosas, dosas, chole bhature, pav bhaji, chaat & sweets",
    defaultServices: [
      "Crispy Samosa & Kachori",
      "Special Chole Bhature",
      "Masala Dosa & South Indian",
      "Pav Bhaji & Vada Pav",
      "Pani Puri & Dahi Chaat",
      "Fresh Jalebi & Gulab Jamun",
      "Traditional Mithai & Sweets",
      "Kulhad Chai & Lassi"
    ],
    positiveTopics: [
      "Crispy & Piping Hot",
      "Authentic Desi Flavors",
      "Fresh Chutneys & Sambhar",
      "Spotless Hygiene & Cleanliness",
      "Fast Counter Service",
      "Generous Portion & Fillings",
      "Pure Ghee / Quality Oil",
      "Pocket-Friendly & Great Value"
    ],
    issueTopics: [
      "Food Served Cold / Soggy",
      "Too Oily / Greasy",
      "Chutney / Sambhar Quality",
      "Long Waiting Time in Rush Hours",
      "Table / Counter Cleanliness",
      "Spice Level Too High"
    ],
    sampleBusinessName: "Shree Krishna Sweets & Snacks"
  },
  {
    id: "salon",
    name: "Salon & Beauty Parlour",
    emoji: "💇‍♀️",
    description: "Hair salons, beauty parlours, beauticians, nail studios & makeup artists",
    defaultServices: [
      "Bridal & Party Makeup",
      "Hydra Facial & Skin Glow",
      "Hair Spa & Keratin Treatment",
      "Hair Cut & Styling",
      "Waxing & Painless Threading",
      "Manicure & Pedicure",
      "Bleach & D-Tan Treatment",
      "At-Home Beauty & Parlour Service"
    ],
    positiveTopics: [
      "Flawless & Long-Lasting Makeup",
      "Visible Skin Glow & Facial",
      "Gentle & Painless Service",
      "Spotless Hygiene & Sanitized Tools",
      "Polite & Expert Beautician",
      "Punctual At-Home Service",
      "Soft & Silky Hair Transformation",
      "Fair & Pocket-Friendly Rates"
    ],
    issueTopics: [
      "Appointment Delay",
      "Makeup Not Long Lasting",
      "Skin Sensitivity / Redness",
      "Pricing Discrepancy"
    ],
    sampleBusinessName: "Diva Beauty Salon"
  },
  {
    id: "gym",
    name: "Gym & Fitness Club",
    emoji: "🏋️",
    description: "Fitness centers, crossfit boxes, yoga studios, personal training",
    defaultServices: ["Personal Training", "Strength Equipment", "Cardio Zone", "Group Fitness Classes", "Yoga & Pilates", "Nutrition Guidance"],
    positiveTopics: ["Modern Equipment", "Motivating Trainers", "Clean & Hygienic", "Positive Energy", "Spacious Floor", "Helpful Staff", "Great Workout Vibe", "Well Maintained"],
    issueTopics: ["Crowded Peak Hours", "Equipment Maintenance", "Locker Room Cleanliness", "Trainer Availability", "Air Conditioning"],
    sampleBusinessName: "IronPeak Fitness"
  },
  {
    id: "nutrition",
    name: "Supplements & Sports Nutrition",
    emoji: "⚡",
    description: "Protein powder, gym supplements, sports nutrition, health food & vitamins",
    defaultServices: [
      "Whey Protein (Isolate & Concentrate)",
      "Creatine Monohydrate & Pre-Workout",
      "Mass Gainer & Weight Management",
      "BCAA, EAA & Muscle Recovery",
      "Multivitamins & Omega 3 Fish Oil",
      "High Protein Peanut Butter & Healthy Oats",
      "Authentic Imported & Indian Brands",
      "Diet & Supplement Guidance"
    ],
    positiveTopics: [
      "100% Genuine & Authentic Products",
      "Original Seal & Batch Verification",
      "Best Prices in Sambhaji Nagar",
      "Knowledgeable & Honest Advice",
      "Huge Variety of Top Brands",
      "Friendly & Helpful Staff",
      "Clean Store & Fast Billing",
      "Great Taste & Flavor Suggestions"
    ],
    issueTopics: [
      "Specific Flavor Out of Stock",
      "Peak Rush Waiting",
      "Limited Stock on Select Brands",
      "Pricing on Certain Imports"
    ],
    sampleBusinessName: "Altus Nutrition"
  },
  {
    id: "sportswear",
    name: "Sports Wear, Garments & Activewear",
    emoji: "👟",
    description: "Gym wear, sports jerseys, tracksuits, athletic garments, dry-fit t-shirts & sports accessories",
    defaultServices: [
      "Gym Wear & Compression T-Shirts",
      "Tracksuits & Joggers",
      "Sports Jerseys & Team Kits",
      "Dry-Fit & Breathable Garments",
      "Cricket & Football Apparel",
      "Shorts & Training Gear",
      "Custom Jersey Printing",
      "Custom Mug Printing",
      "Custom Gifts & Sublimation",
      "Customized Mirrors & Frames",
      "Custom Photo Pillows & Cushions",
      "Sports Shoes & Accessories"
    ],
    positiveTopics: [
      "Premium Fabric & Stitch Quality",
      "Comfortable & Breathable Fit",
      "Huge Variety & Trendy Designs",
      "Pocket-Friendly & Best Prices",
      "Durable & Colorfast Material",
      "Vibrant Print Quality & Finishing",
      "Creative Custom Gift Designs",
      "Helpful & Polite Staff",
      "All Sizes Available",
      "Fast Billing & Great Shopping Experience"
    ],
    issueTopics: [
      "Specific Size Out of Stock",
      "Limited Color Variety",
      "Peak Rush Waiting",
      "Trial Room Waiting"
    ],
    sampleBusinessName: "Aarambh Sports"
  },
  {
    id: "hotel",
    name: "Hotel & Resort",
    emoji: "🏨",
    description: "Boutique hotels, luxury resorts, homestays, bed & breakfast",
    defaultServices: ["Room Stay", "Complimentary Breakfast", "Room Service", "Swimming Pool", "Spa & Wellness", "Concierge"],
    positiveTopics: ["Spotless & Comfortable Room", "Courteous Front Desk", "Delicious Breakfast", "Scenic View", "Fast Check-in / Check-out", "Quiet & Peaceful", "Prime Location", "Top Hospitality"],
    issueTopics: ["Check-in Delay", "Room Cleanliness", "AC/Hot Water Issue", "Breakfast Variety", "Staff Response"],
    sampleBusinessName: "Serene Palms Boutique Resort"
  },
  {
    id: "dental",
    name: "Dental Clinic",
    emoji: "🦷",
    description: "Dentists, orthodontic clinics, smile care centers",
    defaultServices: ["Dental Checkup & Cleaning", "Root Canal Treatment", "Teeth Whitening", "Invisalign / Braces", "Dental Implants", "Painless Extraction"],
    positiveTopics: ["Painless Treatment", "Gentle & Caring Doctor", "Sterilized & Clean Clinic", "Clear Explanation", "Short Waiting Time", "Friendly Reception", "High-Tech Equipment", "Great Outcome"],
    issueTopics: ["Long Waiting Time", "Post-treatment Discomfort", "Pricing Transparency", "Follow-up Delay"],
    sampleBusinessName: "Apex Smile Dental Care"
  },
  {
    id: "healthcare",
    name: "Medical Clinic / Hospital",
    emoji: "🩺",
    description: "Doctors, specialized clinics, diagnostic centers, pediatricians",
    defaultServices: ["General Consultation", "Specialist Diagnosis", "Health Checkup Packages", "Diagnostic Tests", "Vaccination", "Emergency Care"],
    positiveTopics: ["Knowledgeable Doctor", "Patient & Compassionate Care", "Accurate Diagnosis", "Organized Staff", "Clean & Sanitized Clinic", "Prompt Attention", "Smooth Process"],
    issueTopics: ["Appointment Delay", "Staff Behavior", "Crowded Waiting Area", "Communication Gap"],
    sampleBusinessName: "CareFirst Health Clinic"
  },
  {
    id: "auto",
    name: "Automobile Service & Detailing",
    emoji: "🚗",
    description: "Car service centers, bike mechanics, auto detailing, tire shops",
    defaultServices: ["Periodic Maintenance", "Deep Interior Cleaning", "Ceramic Coating / PPF", "Brake & Suspension", "Wheel Alignment", "AC Service"],
    positiveTopics: ["Transparent Pricing", "Timely Delivery", "Skilled Mechanics", "Thorough Inspection", "Smooth Car Drive", "Clear Explanation of Work", "Honest Advice", "Quality Parts"],
    issueTopics: ["Delivery Delay", "Cost Higher than Estimate", "Unresolved Issue", "Cleanliness after Service"],
    sampleBusinessName: "Precision Auto Care"
  },
  {
    id: "retail",
    name: "Retail Store & Boutique",
    emoji: "🛍️",
    description: "Clothing stores, footwear, electronics, gift shops, organic markets",
    defaultServices: ["Curated Collection", "Personal Shopping Assistance", "Easy Exchange / Returns", "Custom Fitting", "Gift Wrapping"],
    positiveTopics: ["Great Variety & Collection", "Helpful & Non-Pushy Staff", "Quality Products", "Fair Prices", "Aesthetic Store Ambiance", "Smooth Billing", "Fresh Stock"],
    issueTopics: ["Limited Sizes/Stock", "Billing Queue", "Return Policy", "Staff Inattentiveness"],
    sampleBusinessName: "Velvet Bloom Boutique"
  },
  {
    id: "services",
    name: "Local Service Business",
    emoji: "🔧",
    description: "Plumbing, electricians, AC repair, home cleaning, pest control",
    defaultServices: ["On-Site Repair", "Emergency Service", "Installation", "Deep Cleaning", "Preventive Maintenance"],
    positiveTopics: ["Punctual Arrival", "Fast & Effective Fix", "Polite & Professional Technician", "Fair & Upfront Pricing", "Left Area Clean", "Reliable Workmanship"],
    issueTopics: ["Late Arrival", "Unresolved Problem", "Pricing Disagreement", "Communication"],
    sampleBusinessName: "SwiftPro Home Services"
  },
  {
    id: "solar",
    name: "Solar Energy & Engineering Solutions",
    emoji: "☀️",
    description: "Solar EPC, rooftop solar panels, on-grid inverters, fire safety & electrical engineering",
    defaultServices: [
      "Residential Rooftop Solar Installation",
      "Commercial & Industrial Solar EPC",
      "On-Grid & Hybrid Solar Inverter Setup",
      "PM Surya Ghar Subsidy & Net Metering",
      "Solar Water Heating & Pumping",
      "Certified Site Survey & Load Audit",
      "Fire Safety Engineering & Hydrants",
      "Solar Maintenance & Performance Check"
    ],
    positiveTopics: [
      "Significant Electricity Bill Savings",
      "Seamless Subsidy & Net Metering Approval",
      "Top-Tier Solar Panels & Inverters",
      "Punctual & Clean Installation",
      "Knowledgeable & Transparent Engineers",
      "Fast After-Sales Service & Support",
      "Strong Mounting Structure & Wiring",
      "Clear Guidance on Solar ROI"
    ],
    issueTopics: [
      "Discom Net Metering Delay",
      "Installation Scheduling Delay",
      "Subsidy Processing Wait Time",
      "Roof Space Constraints"
    ],
    sampleBusinessName: "S.M. Engineering"
  }
];

export function getCategoryById(id: string): CategoryConfig {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}
