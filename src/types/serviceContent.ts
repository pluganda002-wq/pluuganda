import type { TourismPackage } from "@/data/tourismProgramme";

export type GalleryImage = { id: string; src: string; caption?: string };

export type PillarEntry = { id: string; title: string; body: string };

export type TourismRegionEntry = {
  id: string;
  name: string;
  highlights: string;
  tip: string;
  coverImage: string;
  gallery: GalleryImage[];
};

export type YouthForumEventEntry = {
  id: string;
  title: string;
  dateLabel: string;
  dateIso: string;
  location: string;
  spots: number;
  summary: string;
  coverImage?: string;
  gallery?: GalleryImage[];
};

export type FeaturedSupplierEntry = {
  id: string;
  name: string;
  district: string;
  tag: string;
  coverImage?: string;
  gallery?: GalleryImage[];
};

export type CharityDriveEntry = {
  id: string;
  name: string;
  raised: string;
  goal: string;
  summary?: string;
  coverImage: string;
  gallery: GalleryImage[];
};

export type ServiceListingEntry = {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  coverImage: string;
  gallery: GalleryImage[];
  link?: string;
};

export type ServiceModuleId =
  | "tourism"
  | "youth"
  | "buy-uganda"
  | "charity"
  | "csr"
  | "education"
  | "tv"
  | "mobility"
  | "leadership"
  | "projects";

export type ServiceContentData = {
  tourism: {
    pillars: PillarEntry[];
    regions: TourismRegionEntry[];
    packages: TourismPackage[];
  };
  youth: {
    pillars: PillarEntry[];
    forums: YouthForumEventEntry[];
  };
  "buy-uganda": {
    pillars: PillarEntry[];
    featured: FeaturedSupplierEntry[];
  };
  charity: { drives: CharityDriveEntry[] };
  csr: { listings: ServiceListingEntry[] };
  education: { listings: ServiceListingEntry[] };
  tv: { listings: ServiceListingEntry[] };
  mobility: { listings: ServiceListingEntry[] };
  leadership: { listings: ServiceListingEntry[] };
  projects: { listings: ServiceListingEntry[] };
};

export type ServiceContentSection =
  | "pillars"
  | "regions"
  | "packages"
  | "forums"
  | "featured"
  | "drives"
  | "listings";