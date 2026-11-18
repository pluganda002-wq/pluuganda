import { TOURISM_PACKAGES, TOURISM_PILLARS } from "@/data/tourismProgramme";
import { YOUTH_FORUM_EVENTS, YOUTH_PILLARS } from "@/data/youthProgramme";
import { BUBU_FEATURED, BUBU_PILLARS } from "@/data/plu";
import type { GalleryImage, ServiceContentData } from "@/types/serviceContent";

function img(id: string, src: string, caption?: string): GalleryImage {
  return { id, src, caption };
}

function pillarsFrom(
  items: readonly { id?: string; title: string; body?: string; text?: string }[]
) {
  return items.map((p, i) => ({
    id: "id" in p && p.id ? String(p.id) : `pillar-${i}`,
    title: p.title,
    body: ("body" in p && p.body) || ("text" in p && p.text) || "",
  }));
}

export const DEFAULT_SERVICE_CONTENT: ServiceContentData = {
  tourism: {
    pillars: pillarsFrom(TOURISM_PILLARS),
    packages: [...TOURISM_PACKAGES],
    regions: [
      {
        id: "wildlife",
        name: "Wildlife & parks",
        highlights: "Murchison Falls, Queen Elizabeth, Bwindi gorilla trekking, Kidepo",
        tip: "Book through licensed operators; respect park rules and communities.",
        coverImage: "/tourism/wildlife-cover.jpg",
        gallery: [
          img("w1", "/tourism/wildlife-cover.jpg", "Mountain gorilla — Bwindi Impenetrable Forest"),
          img("w2", "/tourism/wildlife-1.jpg", "Elephant family — Queen Elizabeth National Park"),
          img("w3", "/tourism/wildlife-2.jpg", "Murchison Falls — Victoria Nile"),
          img("w4", "/tourism/wildlife-3.jpg", "Kidepo Valley National Park"),
        ],
      },
      {
        id: "culture",
        name: "Culture & heritage",
        highlights: "Kasubi Tombs, Ndere Centre, regional kingdom sites, local festivals",
        tip: "Combine visits with district barazas and community service where scheduled.",
        coverImage: "/tourism/culture-cover.jpg",
        gallery: [
          img("c1", "/tourism/culture-cover.jpg", "Kasubi Tombs — Kampala"),
          img("c2", "/tourism/culture-1.jpg", "Ndere Centre cultural show"),
          img("c3", "/tourism/culture-2.jpg", "Ekitaguriro traditional dance"),
          img("c4", "/tourism/culture-3.jpg", "Mugaba Palace heritage site"),
        ],
      },
      {
        id: "adventure",
        name: "Adventure & nature",
        highlights: "Source of the Nile, Rwenzori hikes, Ssese Islands, crater lakes",
        tip: "Use registered guides; share itineraries with your district mobiliser when on PLU trips.",
        coverImage: "/tourism/adventure-cover.jpg",
        gallery: [
          img("a1", "/tourism/adventure-cover.jpg", "River Nile — Jinja"),
          img("a2", "/tourism/adventure-1.jpg", "Rwenzori Mountains"),
          img("a3", "/tourism/adventure-2.jpg", "Lake Bunyonyi"),
          img("a4", "/tourism/adventure-3.jpg", "Murchison Falls"),
        ],
      },
      {
        id: "cities",
        name: "City experiences",
        highlights: "Kampala nightlife & markets, Entebbe lakefront, Jinja adventure hub",
        tip: "UGo Ride and Tugende partners (when live) support safe movement between venues.",
        coverImage: "/tourism/cities-cover.jpg",
        gallery: [
          img("ci1", "/tourism/cities-cover.jpg", "Kampala city streets"),
          img("ci2", "/tourism/cities-1.jpg", "Lake Victoria — Entebbe"),
          img("ci3", "/tourism/cities-2.jpg", "Owino Market, Kampala"),
          img("ci4", "/tourism/cities-3.jpg", "Nile at Jinja"),
        ],
      },
    ],
  },
  youth: {
    pillars: pillarsFrom(YOUTH_PILLARS),
    forums: YOUTH_FORUM_EVENTS.map((ev) => ({ ...ev })),
  },
  "buy-uganda": {
    pillars: pillarsFrom(BUBU_PILLARS.map((p) => ({ title: p.title, body: p.text }))),
    featured: BUBU_FEATURED.map((f, i) => ({
      id: `supplier-${i}`,
      name: f.name,
      district: f.district,
      tag: f.tag,
      coverImage: "/branding/plu-services-hero.png",
      gallery: [],
    })),
  },
  charity: {
    drives: [
      {
        id: "medical-outreach",
        name: "Medical outreach — rural clinics",
        raised: "UGX 12.4M",
        goal: "UGX 20M",
        summary: "Volunteer clinicians and supplies for upcountry health centres.",
        coverImage: "/branding/plu-hero-banner.png",
        gallery: [img("ch1", "/branding/plu-hero-banner.png", "Community clinic day")],
      },
      {
        id: "school-supplies",
        name: "School supplies — term three",
        raised: "UGX 8.1M",
        goal: "UGX 15M",
        summary: "Books and desks for Patriot League partner schools.",
        coverImage: "/branding/plu-services-hero.png",
        gallery: [],
      },
      {
        id: "clean-water",
        name: "Clean water — community boreholes",
        raised: "UGX 22M",
        goal: "UGX 30M",
        summary: "Boreholes and maintenance training in water-stressed parishes.",
        coverImage: "/branding/field-evidence-default.jpg",
        gallery: [img("ch2", "/branding/field-evidence-default.jpg", "Borehole commissioning")],
      },
    ],
  },
  csr: {
    listings: [
      {
        id: "csr-partnerships",
        title: "Corporate partnerships",
        subtitle: "Responsible business",
        body: "Align CSR spend with PLU district development priorities.",
        coverImage: "/branding/plu-services-hero.png",
        gallery: [],
      },
    ],
  },
  education: {
    listings: [
      {
        id: "civic-literacy",
        title: "Civic literacy modules",
        subtitle: "PISG & constitution",
        body: "Short courses for patriots and district mobilisers.",
        coverImage: "/branding/plu-hero-banner.png",
        gallery: [],
      },
    ],
  },
  tv: {
    listings: [
      {
        id: "plu-tv-live",
        title: "PLU TV live",
        subtitle: "@plutv1",
        body: "Official broadcasts and civic education replays.",
        coverImage: "/branding/plu-services-hero.png",
        gallery: [],
        link: "https://www.youtube.com/@plutv1",
      },
    ],
  },
  mobility: {
    listings: [
      {
        id: "ugo",
        title: "UGo Ride",
        subtitle: "City mobility",
        body: "PLU-partnered ride options for events and tourism.",
        coverImage: "/branding/ugo-ride.png",
        gallery: [],
        link: "/ugo",
      },
      {
        id: "tugende",
        title: "Tugende",
        subtitle: "Safe boda",
        body: "Verified boda transport for last-mile movement.",
        coverImage: "/branding/tugende-safe-boda.png",
        gallery: [],
        link: "/tugende",
      },
    ],
  },
  leadership: {
    listings: [
      {
        id: "rankings",
        title: "Patriot rankings",
        subtitle: "Recognition",
        body: "District and national leaderboards from verified duties.",
        coverImage: "/branding/plu-metallic-gold-ref.png",
        gallery: [],
        link: "/leadership",
      },
    ],
  },
  projects: {
    listings: [
      {
        id: "citizen-reviews",
        title: "Citizen project reviews",
        subtitle: "Integrity tracker",
        body: "Review public projects and publish updates.",
        coverImage: "/branding/plu-service-points-icon.png",
        gallery: [],
        link: "/projects",
      },
    ],
  },
};