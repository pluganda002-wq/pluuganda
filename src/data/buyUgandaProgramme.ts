/** Buy Uganda, Build Uganda — local product categories and sample business directory. */

export type BuyUgandaCategory = {
  id: string;
  name: string;
  tagline: string;
  examples: string;
  coverImage: string;
};

export type BuyUgandaBusiness = {
  id: string;
  name: string;
  categoryId: string;
  district: string;
  tag: string;
  summary: string;
  products: string;
  coverImage: string;
};

export const BUY_UGANDA_CATEGORIES: BuyUgandaCategory[] = [
  {
    id: "agro",
    name: "Agro & food",
    tagline: "Farm to table — Ugandan produce and packaged foods",
    examples: "Arabica & Robusta coffee, tea, fruits, honey, sesame, vanilla",
    coverImage: "/buy-uganda/agro-cover.jpg",
  },
  {
    id: "fashion",
    name: "Fashion & crafts",
    tagline: "Heritage textiles, leather, baskets and jewellery",
    examples: "Kitenge, bark cloth, Ankole leather, sisal baskets, beads",
    coverImage: "/buy-uganda/fashion-cover.jpg",
  },
  {
    id: "build",
    name: "Build & home",
    tagline: "Materials and furnishings made in Uganda",
    examples: "Bricks, tiles, timber furniture, metal works, eco housing",
    coverImage: "/buy-uganda/build-cover.jpg",
  },
  {
    id: "tech",
    name: "Innovation & services",
    tagline: "Ugandan apps, fintech and professional services",
    examples: "Mobile money integrators, agritech, logistics, creative studios",
    coverImage: "/buy-uganda/tech-cover.jpg",
  },
];

export const BUY_UGANDA_BUSINESSES: BuyUgandaBusiness[] = [
  {
    id: "ug-coffee-collective",
    name: "Uganda Coffee Collective",
    categoryId: "agro",
    district: "Mbale · Bugisu",
    tag: "Verified local",
    summary: "Specialty Arabica from Mt. Elgon slopes — direct farmer batches and export grading.",
    products: "Green & roasted coffee · farmer cooperatives",
    coverImage: "/buy-uganda/supplier-coffee.jpg",
  },
  {
    id: "kampala-green-foods",
    name: "Kampala Green Foods",
    categoryId: "agro",
    district: "Kampala",
    tag: "Agro-processing",
    summary: "Cold-pressed juices, dried fruit and hygienic packaging for urban retailers.",
    products: "Fruit pulp · snack packs · private label",
    coverImage: "/buy-uganda/supplier-foods.jpg",
  },
  {
    id: "busoga-honey-hub",
    name: "Busoga Honey Hub",
    categoryId: "agro",
    district: "Jinja · Busoga",
    tag: "MSME",
    summary: "Traceable honey and beeswax from community apiaries along the Nile corridor.",
    products: "Raw honey · beeswax · propolis",
    coverImage: "/buy-uganda/agro-cover.jpg",
  },
  {
    id: "nile-craft-export",
    name: "Nile Craft Export Hub",
    categoryId: "fashion",
    district: "Jinja",
    tag: "Artisan",
    summary: "Curated crafts for domestic retail and ethical export — sisal, wood and recycled art.",
    products: "Baskets · home décor · gift sets",
    coverImage: "/buy-uganda/supplier-crafts.jpg",
  },
  {
    id: "ankole-leather-works",
    name: "Ankole Leather Works",
    categoryId: "fashion",
    district: "Mbarara",
    tag: "Made in Uganda",
    summary: "Footwear, belts and bags using Western Region tanning traditions.",
    products: "Leather goods · corporate gifts",
    coverImage: "/buy-uganda/supplier-leather.jpg",
  },
  {
    id: "kigezi-weavers",
    name: "Kigezi Weavers Cooperative",
    categoryId: "fashion",
    district: "Kabale",
    tag: "Cooperative",
    summary: "Hand-loomed textiles and school uniform fabric woven by women's groups.",
    products: "Kitenge rolls · scarves · uniforms",
    coverImage: "/buy-uganda/fashion-cover.jpg",
  },
  {
    id: "tororo-brickworks",
    name: "Tororo Brickworks",
    categoryId: "build",
    district: "Tororo",
    tag: "Manufacturer",
    summary: "Interlocking soil-stabilised bricks for affordable housing projects.",
    products: "ISSB blocks · pavers · on-site training",
    coverImage: "/buy-uganda/build-cover.jpg",
  },
  {
    id: "kampala-furniture-lab",
    name: "Kampala Furniture Lab",
    categoryId: "build",
    district: "Kampala",
    tag: "SME",
    summary: "Custom timber furniture using certified Mukono and Mpigi plantations.",
    products: "Office sets · cabinetry · fittings",
    coverImage: "/tourism/cities-3.jpg",
  },
  {
    id: "nebbi-metal-fab",
    name: "West Nile Metal Fabricators",
    categoryId: "build",
    district: "Nebbi",
    tag: "Industrial",
    summary: "Gates, trusses and agricultural implements for district infrastructure drives.",
    products: "Steel gates · irrigation frames",
    coverImage: "/tourism/adventure-cover.jpg",
  },
  {
    id: "pearl-fintech",
    name: "Pearl Fintech Studio",
    categoryId: "tech",
    district: "Kampala",
    tag: "Innovation",
    summary: "Payments and savings APIs for SACCOs and patriot savings circles.",
    products: "Wallet SDK · SACCO dashboards",
    coverImage: "/buy-uganda/tech-cover.jpg",
  },
  {
    id: "mara-logistics",
    name: "Mara Last-Mile Logistics",
    categoryId: "tech",
    district: "Gulu · Northern",
    tag: "Logistics",
    summary: "District-to-door delivery for agro-inputs and verified local products.",
    products: "Fleet dispatch · warehouse slots",
    coverImage: "/tourism/cities-1.jpg",
  },
  {
    id: "creative-nile-studio",
    name: "Creative Nile Studio",
    categoryId: "tech",
    district: "Entebbe",
    tag: "Creative",
    summary: "Brand, campaign and documentary production for Ugandan enterprises.",
    products: "Media kits · product launches · training",
    coverImage: "/buy-uganda/hero-cover.jpg",
  },
];