import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bath,
  Bed,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Dumbbell,
  Eye,
  FileCheck2,
  Filter,
  Heart,
  Home,
  IndianRupee,
  KeyRound,
  Landmark,
  LayoutGrid,
  List,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
  Search,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  Star,
  TreePine,
  Upload,
  User,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

type Screen = "home" | "search" | "post" | "saved" | "profile" | "detail" | "login" | "signup" | "admin" | "explore" | "match";
type Purpose = "BUY" | "RENT" | "COMMERCIAL" | "PG" | "PLOT" | "PROJECT";
type OwnerType = "Owner" | "Broker" | "Builder";
type ViewMode = "list" | "map";
type OwnerDashboardTab = "listings" | "approvals";
type MatchIntent = Purpose | "ANY";
type MatchBudget = "ANY" | "BUY_UNDER_50L" | "BUY_50L_1CR" | "BUY_1CR_PLUS" | "RENT_UNDER_50K";
type MatchVibe = "CALM" | "COMMUTE" | "FAMILY" | "INVESTMENT";

interface Property {
  id: string;
  title: string;
  projectName?: string;
  purpose: Purpose;
  listingType: "RENT" | "SALE";
  type: string;
  price: number;
  city: string;
  locality: string;
  bhk: string;
  area: number;
  areaUnit: string;
  furnishing: string;
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  amenities: string[];
  description: string;
  image: string;
  ownerName: string;
  ownerPhone: string;
  ownerId?: string;
  ownerType: OwnerType;
  status: "APPROVED" | "PENDING_REVIEW" | "DRAFT" | "REJECTED";
  possession: "Immediate" | "Ready to Move" | "Under Construction" | "Within 3 Months";
  verified: boolean;
  noBrokerage: boolean;
  featured: boolean;
  rera?: string;
  securityDeposit?: number;
  maintenanceCharges?: number;
  maintenanceIncluded?: boolean;
  availableFrom?: string;
  leasePeriodMonths?: number;
  preferredTenants?: string;
  priceNegotiable?: boolean;
  bookingAmount?: number;
  loanAvailable?: boolean;
  propertyAge?: number;
  ownershipType?: string;
  pgMonthlyRentPerBed?: number;
  pgSharingType?: string;
  pgFoodIncluded?: boolean;
  genderPreference?: string;
  commercialPricingType?: "RENT" | "SALE";
  commercialUsage?: string;
  commercialCarpetArea?: number;
  commercialBuiltUpArea?: number;
  plotArea?: number;
  plotAreaUnit?: string;
  boundaryWall?: boolean;
  cornerPlot?: boolean;
  approvedBy?: string;
  projectPriceMin?: number;
  projectPriceMax?: number;
  projectPossessionDate?: string;
  projectTowerCount?: number;
  projectConfigurations?: string;
  videoRef: string;
  videoUrl?: string;
  videoFileName?: string;
  submittedAt?: string;
  reviewNote?: string;
  postedDays: number;
  views: number;
  leads: number;
  liked: boolean;
  nearby: string[];
  priceTrend: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type LoginCredentials = {
  email: string;
  password: string;
};

type SignupInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type DbProfile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email?: string | null;
  is_admin?: boolean | null;
};

type DbPropertyRow = {
  id: string;
  owner_id: string;
  title: string;
  project_name: string | null;
  purpose: Purpose;
  listing_type: "RENT" | "SALE";
  property_type: string;
  price: number | string;
  city: string;
  locality: string;
  bhk: string | null;
  area: number | string | null;
  area_unit: string | null;
  furnishing: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: boolean | null;
  possession: Property["possession"];
  rera: string | null;
  security_deposit: number | string | null;
  maintenance_charges: number | string | null;
  maintenance_included: boolean | null;
  available_from: string | null;
  lease_period_months: number | null;
  preferred_tenants: string | null;
  price_negotiable: boolean | null;
  booking_amount: number | string | null;
  loan_available: boolean | null;
  property_age: number | null;
  ownership_type: string | null;
  pg_monthly_rent_per_bed: number | string | null;
  pg_sharing_type: string | null;
  pg_food_included: boolean | null;
  gender_preference: string | null;
  commercial_pricing_type: "RENT" | "SALE" | null;
  commercial_usage: string | null;
  commercial_carpet_area: number | string | null;
  commercial_built_up_area: number | string | null;
  plot_area: number | string | null;
  plot_area_unit: string | null;
  boundary_wall: boolean | null;
  corner_plot: boolean | null;
  approved_by: string | null;
  project_price_min: number | string | null;
  project_price_max: number | string | null;
  project_possession_date: string | null;
  project_tower_count: number | null;
  project_configurations: string | null;
  description: string | null;
  image_url: string | null;
  seller_type: OwnerType;
  status: Property["status"];
  review_note: string | null;
  submitted_at: string | null;
  verified: boolean | null;
  no_brokerage: boolean | null;
  featured: boolean | null;
  views: number | null;
  leads: number | null;
  price_trend: string | null;
  created_at: string | null;
  profiles?: DbProfile | DbProfile[] | null;
  property_amenities?: Array<{ amenity: string }> | null;
  property_nearby?: Array<{ name: string; sort_order: number | null }> | null;
  property_media?: Array<{
    storage_path: string;
    stored_filename?: string | null;
    original_filename: string | null;
    media_type: "VIDEO" | "IMAGE";
    upload_status: string;
    is_primary: boolean | null;
    duplicate_status: string | null;
  }> | null;
};

const PROPERTY_SELECT = `
  id,
  owner_id,
  title,
  project_name,
  purpose,
  listing_type,
  property_type,
  price,
  city,
  locality,
  bhk,
  area,
  area_unit,
  furnishing,
  bedrooms,
  bathrooms,
  parking,
  possession,
  rera,
  security_deposit,
  maintenance_charges,
  maintenance_included,
  available_from,
  lease_period_months,
  preferred_tenants,
  price_negotiable,
  booking_amount,
  loan_available,
  property_age,
  ownership_type,
  pg_monthly_rent_per_bed,
  pg_sharing_type,
  pg_food_included,
  gender_preference,
  commercial_pricing_type,
  commercial_usage,
  commercial_carpet_area,
  commercial_built_up_area,
  plot_area,
  plot_area_unit,
  boundary_wall,
  corner_plot,
  approved_by,
  project_price_min,
  project_price_max,
  project_possession_date,
  project_tower_count,
  project_configurations,
  description,
  image_url,
  seller_type,
  status,
  review_note,
  submitted_at,
  verified,
  no_brokerage,
  featured,
  views,
  leads,
  price_trend,
  created_at,
  profiles!properties_owner_id_fkey(first_name,last_name,phone,email,is_admin),
  property_amenities(amenity),
  property_nearby(name,sort_order),
  property_media(storage_path,stored_filename,original_filename,media_type,upload_status,is_primary,duplicate_status)
`;

const PROPERTY_SELECT_WITHOUT_STORED_FILENAME = PROPERTY_SELECT.replace(
  "property_media(storage_path,stored_filename,original_filename,media_type,upload_status,is_primary,duplicate_status)",
  "property_media(storage_path,original_filename,media_type,upload_status,is_primary,duplicate_status)"
);

function getDbProfile(row: DbPropertyRow): DbProfile | null {
  if (Array.isArray(row.profiles)) return row.profiles[0] || null;
  return row.profiles || null;
}

function daysSince(value: string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.max(0, Math.floor((Date.now() - time) / 86400000));
}

function mapDbProperty(row: DbPropertyRow, savedIds = new Set<string>()): Property {
  const profile = getDbProfile(row);
  const video = row.property_media?.find((media) => media.media_type === "VIDEO" && media.upload_status !== "DELETED" && media.is_primary) ||
    row.property_media?.find((media) => media.media_type === "VIDEO" && media.upload_status !== "DELETED");
  const ownerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "InstaHouse seller";

  return {
    id: row.id,
    title: row.title,
    projectName: row.project_name || undefined,
    purpose: row.purpose,
    listingType: row.listing_type,
    type: row.property_type,
    price: Number(row.price) || 0,
    city: row.city,
    locality: row.locality,
    bhk: row.bhk || "N/A",
    area: Number(row.area) || 0,
    areaUnit: row.area_unit || "Sq Ft",
    furnishing: row.furnishing || "N/A",
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    parking: Boolean(row.parking),
    amenities: row.property_amenities?.map((item) => item.amenity).filter(Boolean) || [],
    description: row.description || "",
    image: row.image_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&h=1100&fit=crop&auto=format",
    ownerName,
    ownerPhone: profile?.phone || "",
    ownerId: row.owner_id,
    ownerType: row.seller_type,
    status: row.status,
    possession: row.possession,
    verified: Boolean(row.verified),
    noBrokerage: Boolean(row.no_brokerage),
    featured: Boolean(row.featured),
    rera: row.rera || undefined,
    securityDeposit: row.security_deposit ? Number(row.security_deposit) : undefined,
    maintenanceCharges: row.maintenance_charges ? Number(row.maintenance_charges) : undefined,
    maintenanceIncluded: Boolean(row.maintenance_included),
    availableFrom: row.available_from || undefined,
    leasePeriodMonths: row.lease_period_months || undefined,
    preferredTenants: row.preferred_tenants || undefined,
    priceNegotiable: Boolean(row.price_negotiable),
    bookingAmount: row.booking_amount ? Number(row.booking_amount) : undefined,
    loanAvailable: Boolean(row.loan_available),
    propertyAge: row.property_age || undefined,
    ownershipType: row.ownership_type || undefined,
    pgMonthlyRentPerBed: row.pg_monthly_rent_per_bed ? Number(row.pg_monthly_rent_per_bed) : undefined,
    pgSharingType: row.pg_sharing_type || undefined,
    pgFoodIncluded: Boolean(row.pg_food_included),
    genderPreference: row.gender_preference || undefined,
    commercialPricingType: row.commercial_pricing_type || undefined,
    commercialUsage: row.commercial_usage || undefined,
    commercialCarpetArea: row.commercial_carpet_area ? Number(row.commercial_carpet_area) : undefined,
    commercialBuiltUpArea: row.commercial_built_up_area ? Number(row.commercial_built_up_area) : undefined,
    plotArea: row.plot_area ? Number(row.plot_area) : undefined,
    plotAreaUnit: row.plot_area_unit || undefined,
    boundaryWall: Boolean(row.boundary_wall),
    cornerPlot: Boolean(row.corner_plot),
    approvedBy: row.approved_by || undefined,
    projectPriceMin: row.project_price_min ? Number(row.project_price_min) : undefined,
    projectPriceMax: row.project_price_max ? Number(row.project_price_max) : undefined,
    projectPossessionDate: row.project_possession_date || undefined,
    projectTowerCount: row.project_tower_count || undefined,
    projectConfigurations: row.project_configurations || undefined,
    videoRef: video?.storage_path || "",
    videoFileName: video?.stored_filename || video?.original_filename || undefined,
    submittedAt: row.submitted_at || undefined,
    reviewNote: row.review_note || undefined,
    postedDays: daysSince(row.created_at),
    views: row.views || 0,
    leads: row.leads || 0,
    liked: savedIds.has(row.id),
    nearby: row.property_nearby?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((item) => item.name).filter(Boolean) || [],
    priceTrend: row.price_trend || "Pending",
  };
}

function profileToUser(id: string, profile?: DbProfile | null, phoneFallback = ""): User {
  return {
    id,
    firstName: profile?.first_name || "Demo",
    lastName: profile?.last_name || "User",
    email: profile?.email || "demo@instahouse.com",
    phone: profile?.phone || phoneFallback,
  };
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

async function getFunctionErrorMessage(error: unknown, fallback: string) {
  const context = error && typeof error === "object" && "context" in error ? (error as { context?: Response }).context : null;
  if (!context) return fallback;

  try {
    const body = (await context.clone().json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

async function getFileSha256(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeStorageName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
}

function isHttpVideoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSignableVideoPath(value: string) {
  return !isHttpVideoUrl(value) && (value.includes("/") || /\.(mp4|webm|mov|m4v)$/i.test(value));
}

async function attachSignedVideoUrls(items: Property[]) {
  if (!supabase || items.length === 0) return items;

  const itemsWithDirectUrls = items.map((item) => (
    item.videoRef && isHttpVideoUrl(item.videoRef)
      ? { ...item, videoUrl: item.videoRef }
      : item
  ));

  const paths = Array.from(new Set(
    itemsWithDirectUrls
      .map((item) => item.videoRef)
      .filter((path) => path && isSignableVideoPath(path))
  ));
  if (paths.length === 0) return itemsWithDirectUrls;

  try {
    const { data, error } = await supabase.storage.from("property-videos").createSignedUrls(paths, 60 * 60);
    if (error) {
      console.error("Could not create signed video URLs", error);
      return itemsWithDirectUrls;
    }

    const signedUrls = new globalThis.Map<string, string>();
    data?.forEach((item) => {
      if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
    });

    return itemsWithDirectUrls.map((item) => ({
      ...item,
      videoUrl: item.videoRef ? signedUrls.get(item.videoRef) || item.videoUrl : item.videoUrl,
    }));
  } catch (error) {
    console.error("Could not create signed video URLs", error);
    return itemsWithDirectUrls;
  }
}

const CITIES = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];
const BHK_OPTIONS = ["Any BHK", "1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const OWNER_TYPES: Array<"Any Seller" | OwnerType> = ["Any Seller", "Owner", "Broker", "Builder"];

const PURPOSES: Array<{ key: Purpose; label: string; icon: ReactNode; hint: string }> = [
  { key: "BUY", label: "Buy", icon: <Home size={16} />, hint: "Ready homes" },
  { key: "RENT", label: "Rent", icon: <KeyRound size={16} />, hint: "Flats & villas" },
  { key: "COMMERCIAL", label: "Commercial", icon: <BriefcaseBusiness size={16} />, hint: "Shops & offices" },
  { key: "PG", label: "PG", icon: <User size={16} />, hint: "Co-living" },
  { key: "PLOT", label: "Plots", icon: <Map size={16} />, hint: "Land parcels" },
  { key: "PROJECT", label: "Projects", icon: <Building2 size={16} />, hint: "New launches" },
];

const MATCH_INTENTS: Array<{ key: MatchIntent; label: string; caption: string; icon: ReactNode }> = [
  { key: "ANY", label: "Best fit", caption: "Open to ideas", icon: <Sparkles size={15} /> },
  { key: "BUY", label: "Buy", caption: "Own a home", icon: <Home size={15} /> },
  { key: "RENT", label: "Rent", caption: "Move soon", icon: <KeyRound size={15} /> },
  { key: "PG", label: "PG", caption: "Shared living", icon: <User size={15} /> },
  { key: "PLOT", label: "Plots", caption: "Build later", icon: <Map size={15} /> },
  { key: "PROJECT", label: "Projects", caption: "New launches", icon: <Building2 size={15} /> },
];

const MATCH_BUDGETS: Array<{ key: MatchBudget; label: string; caption: string }> = [
  { key: "ANY", label: "Flexible", caption: "Show strong matches" },
  { key: "BUY_UNDER_50L", label: "Under 50L", caption: "Compact buys" },
  { key: "BUY_50L_1CR", label: "50L-1Cr", caption: "Family homes" },
  { key: "BUY_1CR_PLUS", label: "1Cr+", caption: "Premium homes" },
  { key: "RENT_UNDER_50K", label: "Rent <50k", caption: "Monthly rent" },
];

const MATCH_VIBES: Array<{ key: MatchVibe; label: string; caption: string }> = [
  { key: "CALM", label: "Calm", caption: "Light, space, quiet" },
  { key: "COMMUTE", label: "Easy commute", caption: "Metro, hubs, access" },
  { key: "FAMILY", label: "Family ready", caption: "Schools, security" },
  { key: "INVESTMENT", label: "Growth", caption: "Demand and upside" },
];

const AMENITY_ICONS: Record<string, ReactNode> = {
  Gym: <Dumbbell size={14} />,
  Security: <Shield size={14} />,
  "Power Backup": <Zap size={14} />,
  Garden: <TreePine size={14} />,
  Parking: <Car size={14} />,
  Wifi: <Wifi size={14} />,
};

const MARKET_TOOLS = [
  { label: "EMI", value: "₹48.6k/mo", icon: <Calculator size={17} />, caption: "For ₹52L loan" },
  { label: "Price Check", value: "₹9,850/sq ft", icon: <BarChart3 size={17} />, caption: "Metro median" },
  { label: "Home Loan", value: "8.45%", icon: <Landmark size={17} />, caption: "Indicative rate" },
  { label: "Documents", value: "6 checks", icon: <FileCheck2 size={17} />, caption: "Before booking" },
];

const LOCALITY_INSIGHTS = [
  { name: "Whitefield", city: "Bengaluru", avgRent: "₹28k-65k", avgSale: "₹11,200/sq ft", demand: "High", commute: "IT corridor access" },
  { name: "Andheri West", city: "Mumbai", avgRent: "₹55k-1.4L", avgSale: "₹31,500/sq ft", demand: "Premium", commute: "Metro and airport access" },
  { name: "Golf Course Road", city: "Delhi NCR", avgRent: "₹48k-1.2L", avgSale: "₹18,900/sq ft", demand: "Rising", commute: "Corporate hub nearby" },
];

const MOCK_PROPERTIES: Property[] = [
  {
    id: "p001",
    title: "Sunlit 3BHK Apartment in Whitefield",
    projectName: "Urban Grove",
    purpose: "RENT",
    listingType: "RENT",
    type: "Apartment",
    price: 52000,
    city: "Bengaluru",
    locality: "Whitefield",
    bhk: "3 BHK",
    area: 1450,
    areaUnit: "Sq Ft",
    furnishing: "Semi Furnished",
    bedrooms: 3,
    bathrooms: 2,
    parking: true,
    amenities: ["Lift", "Power Backup", "Security", "CCTV", "Parking"],
    description:
      "Bright 3BHK on the 4th floor with cross ventilation, modular kitchen, power backup, and a society gate. Good fit for families who need schools, hospitals, and daily stores close by.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Rajesh Sharma",
    ownerPhone: "+91 98765 43210",
    ownerType: "Owner",
    status: "APPROVED",
    possession: "Immediate",
    verified: true,
    noBrokerage: true,
    featured: true,
    videoRef: "bengaluru-whitefield-apartment-p001",
    postedDays: 2,
    views: 847,
    leads: 36,
    liked: false,
    nearby: ["ITPL", "Metro station", "Schools", "Daily market"],
    priceTrend: "+7.8% YoY",
  },
  {
    id: "p002",
    title: "Premium Villa for Sale in Jubilee Hills",
    projectName: "Lakeview Estate",
    purpose: "BUY",
    listingType: "SALE",
    type: "Villa",
    price: 28000000,
    city: "Hyderabad",
    locality: "Jubilee Hills",
    bhk: "4 BHK",
    area: 3200,
    areaUnit: "Sq Ft",
    furnishing: "Fully Furnished",
    bedrooms: 4,
    bathrooms: 4,
    parking: true,
    amenities: ["Garden", "Swimming Pool", "Gym", "Security", "CCTV", "Power Backup", "Gas Pipeline"],
    description:
      "Independent villa on a 3600 sqft plot with private garden, rooftop terrace, marble flooring, smart lighting, and a premium modular kitchen. Clear title and ready possession.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Priya Agarwal",
    ownerPhone: "+91 99001 22334",
    ownerType: "Owner",
    status: "APPROVED",
    possession: "Ready to Move",
    verified: true,
    noBrokerage: true,
    featured: true,
    rera: "RERA-IN-2026-HYD-118",
    videoRef: "hyderabad-jubileehills-villa-p002",
    postedDays: 5,
    views: 1243,
    leads: 51,
    liked: true,
    nearby: ["Film Nagar", "ORR access", "Premium cafes", "International schools"],
    priceTrend: "+11.2% YoY",
  },
  {
    id: "p003",
    title: "Cozy 2BHK near Hinjewadi IT Park",
    purpose: "RENT",
    listingType: "RENT",
    type: "Apartment",
    price: 28000,
    city: "Pune",
    locality: "Hinjewadi",
    bhk: "2 BHK",
    area: 980,
    areaUnit: "Sq Ft",
    furnishing: "Unfurnished",
    bedrooms: 2,
    bathrooms: 2,
    parking: true,
    amenities: ["Lift", "Security", "Parking", "Water Supply"],
    description:
      "Well-maintained 2BHK in a gated community, just 5 minutes from the IT park. Newly painted, practical layout, and ideal for working couples or a small family.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Ankit Verma",
    ownerPhone: "+91 98112 55678",
    ownerType: "Broker",
    status: "APPROVED",
    possession: "Immediate",
    verified: true,
    noBrokerage: false,
    featured: false,
    videoRef: "pune-hinjewadi-apartment-p003",
    postedDays: 8,
    views: 562,
    leads: 18,
    liked: false,
    nearby: ["IT Park", "Metro line", "Bus stop", "Supermarket"],
    priceTrend: "+6.1% YoY",
  },
  {
    id: "p004",
    title: "Ground Floor Shop in Karol Bagh Market",
    purpose: "COMMERCIAL",
    listingType: "SALE",
    type: "Shop",
    price: 12500000,
    city: "Delhi NCR",
    locality: "Karol Bagh",
    bhk: "N/A",
    area: 420,
    areaUnit: "Sq Ft",
    furnishing: "Unfurnished",
    bedrooms: 0,
    bathrooms: 1,
    parking: false,
    amenities: ["Power Backup", "CCTV", "Security"],
    description:
      "Ground floor commercial shop on a busy market road with strong frontage and daily footfall. Suitable for retail, medical, food, or service business.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Suresh Gupta",
    ownerPhone: "+91 97131 88900",
    ownerType: "Owner",
    status: "APPROVED",
    possession: "Ready to Move",
    verified: true,
    noBrokerage: true,
    featured: false,
    videoRef: "delhi-karolbagh-shop-p004",
    postedDays: 12,
    views: 390,
    leads: 12,
    liked: false,
    nearby: ["Karol Bagh Market", "Metro station", "Public parking", "Main road"],
    priceTrend: "+5.4% YoY",
  },
  {
    id: "p005",
    title: "Independent House in Indiranagar",
    purpose: "BUY",
    listingType: "SALE",
    type: "Independent House",
    price: 17500000,
    city: "Bengaluru",
    locality: "Indiranagar",
    bhk: "3 BHK",
    area: 2100,
    areaUnit: "Sq Ft",
    furnishing: "Semi Furnished",
    bedrooms: 3,
    bathrooms: 3,
    parking: true,
    amenities: ["Garden", "Parking", "Power Backup", "Water Supply", "Security"],
    description:
      "Independent ground plus one house with front garden and covered parking for two vehicles. Peaceful location with quick access to retail streets, offices, and metro connectivity.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Meena Sahu",
    ownerPhone: "+91 98301 44567",
    ownerType: "Owner",
    status: "APPROVED",
    possession: "Ready to Move",
    verified: true,
    noBrokerage: true,
    featured: true,
    videoRef: "bengaluru-indiranagar-house-p005",
    postedDays: 3,
    views: 729,
    leads: 28,
    liked: false,
    nearby: ["Metro station", "100 Feet Road", "Schools", "Clinics"],
    priceTrend: "+9.4% YoY",
  },
  {
    id: "p006",
    title: "Fully Furnished Studio near Hitec City",
    purpose: "PG",
    listingType: "RENT",
    type: "Studio / Co-living",
    price: 18000,
    city: "Hyderabad",
    locality: "Hitec City",
    bhk: "1 RK",
    area: 380,
    areaUnit: "Sq Ft",
    furnishing: "Fully Furnished",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    amenities: ["Wifi", "Lift", "Security", "Water Supply", "Power Backup"],
    description:
      "Compact furnished studio for working professionals. Bed, wardrobe, geyser, WiFi, and maintenance included in the rent.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Deepa Pandey",
    ownerPhone: "+91 97001 23456",
    ownerType: "Owner",
    status: "APPROVED",
    possession: "Immediate",
    verified: true,
    noBrokerage: true,
    featured: false,
    videoRef: "hyderabad-hiteccity-studio-p006",
    postedDays: 1,
    views: 1089,
    leads: 44,
    liked: true,
    nearby: ["Cyber Towers", "Metro station", "Food courts", "Shared transport"],
    priceTrend: "+4.2% YoY",
  },
  {
    id: "p007",
    title: "Corner Residential Plot on Sarjapur Road",
    purpose: "PLOT",
    listingType: "SALE",
    type: "Plot",
    price: 7500000,
    city: "Bengaluru",
    locality: "Sarjapur Road",
    bhk: "N/A",
    area: 1800,
    areaUnit: "Sq Ft",
    furnishing: "N/A",
    bedrooms: 0,
    bathrooms: 0,
    parking: false,
    amenities: ["Water Supply"],
    description:
      "Corner residential plot with 40 feet road width on two sides. Clear title, approved layout, and strong investment potential in a stable residential pocket.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Vikas Tiwari",
    ownerPhone: "+91 94255 67890",
    ownerType: "Broker",
    status: "APPROVED",
    possession: "Ready to Move",
    verified: false,
    noBrokerage: false,
    featured: false,
    rera: "RERA-IN-2026-PLOT-044",
    videoRef: "bengaluru-sarjapur-plot-p007",
    postedDays: 15,
    views: 281,
    leads: 9,
    liked: false,
    nearby: ["Residential colony", "Outer Ring Road", "Schools", "Upcoming metro"],
    priceTrend: "+8.1% YoY",
  },
  {
    id: "p008",
    title: "Luxury 4BHK Penthouse on Golf Course Road",
    purpose: "RENT",
    listingType: "RENT",
    type: "Penthouse",
    price: 120000,
    city: "Delhi NCR",
    locality: "Golf Course Road",
    bhk: "4 BHK",
    area: 3800,
    areaUnit: "Sq Ft",
    furnishing: "Fully Furnished",
    bedrooms: 4,
    bathrooms: 4,
    parking: true,
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "Lift", "Security", "CCTV", "Power Backup", "Garden", "Parking"],
    description:
      "Premium penthouse with panoramic city views, designer kitchen, home theatre, and a large private terrace. Society includes pool, gym, and clubhouse.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Amit Chandrakar",
    ownerPhone: "+91 98200 11223",
    ownerType: "Builder",
    status: "APPROVED",
    possession: "Within 3 Months",
    verified: true,
    noBrokerage: false,
    featured: true,
    rera: "RERA-IN-2026-GGN-223",
    videoRef: "delhincr-golfcourse-penthouse-p008",
    postedDays: 7,
    views: 2140,
    leads: 73,
    liked: false,
    nearby: ["Rapid Metro", "Premium schools", "Restaurants", "Cyber City"],
    priceTrend: "+13.5% YoY",
  },
  {
    id: "p009",
    title: "New Launch 2/3BHK Homes in Thane West",
    projectName: "Meridian Residences",
    purpose: "PROJECT",
    listingType: "SALE",
    type: "New Project",
    price: 8600000,
    city: "Mumbai",
    locality: "Thane West",
    bhk: "2/3 BHK",
    area: 1120,
    areaUnit: "Sq Ft",
    furnishing: "Unfurnished",
    bedrooms: 2,
    bathrooms: 2,
    parking: true,
    amenities: ["Clubhouse", "Garden", "Security", "Lift", "Power Backup", "Parking"],
    description:
      "RERA-registered new launch with multiple towers, efficient floor plans, clubhouse, landscaped greens, and construction-linked payment plan.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Meridian Developers",
    ownerPhone: "+91 90011 88221",
    ownerType: "Builder",
    status: "APPROVED",
    possession: "Under Construction",
    verified: true,
    noBrokerage: false,
    featured: true,
    rera: "RERA-IN-2026-PROJ-901",
    videoRef: "mumbai-thane-meridian-project-p009",
    postedDays: 4,
    views: 1660,
    leads: 61,
    liked: false,
    nearby: ["Metro corridor", "Shopping mall", "Wide roads", "Upcoming school"],
    priceTrend: "+10.9% YoY",
  },
  {
    id: "p010",
    title: "Grade-A Office Space in BKC",
    purpose: "COMMERCIAL",
    listingType: "RENT",
    type: "Commercial Office",
    price: 250000,
    city: "Mumbai",
    locality: "Bandra Kurla Complex",
    bhk: "N/A",
    area: 1900,
    areaUnit: "Sq Ft",
    furnishing: "Fully Furnished",
    bedrooms: 0,
    bathrooms: 2,
    parking: true,
    amenities: ["Lift", "Security", "Power Backup", "Parking", "CCTV"],
    description:
      "Plug-and-play office with reception, cabins, workstations, conference room, pantry, and reserved parking. Suitable for IT, consulting, and regional teams.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=1100&fit=crop&auto=format",
    ownerName: "Kunal Realty",
    ownerPhone: "+91 90077 33445",
    ownerType: "Broker",
    status: "APPROVED",
    possession: "Immediate",
    verified: true,
    noBrokerage: false,
    featured: false,
    videoRef: "mumbai-bkc-office-p010",
    postedDays: 6,
    views: 512,
    leads: 16,
    liked: false,
    nearby: ["BKC", "Airport", "Hotels", "Restaurants"],
    priceTrend: "+6.7% YoY",
  },
];

function formatPrice(price: number, listingType: "RENT" | "SALE") {
  if (listingType === "RENT") return `₹${price.toLocaleString("en-IN")}/mo`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

function compactNumber(value: number) {
  if (value > 999) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function purposeLabel(purpose: Purpose) {
  return PURPOSES.find((p) => p.key === purpose)?.label || purpose;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "accent" | "success" }) {
  const classes = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-emerald-500/12 text-emerald-700",
  };

  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[tone]}`}>{children}</span>;
}

function BottomNav({ screen, onNav, isLoggedIn }: { screen: Screen; onNav: (s: Screen) => void; isLoggedIn: boolean }) {
  const items: Array<{ key: Screen; icon: ReactNode; label: string }> = [
    { key: "home", icon: <Home size={21} />, label: "Home" },
    { key: "search", icon: <Search size={21} />, label: "Search" },
    { key: "post", icon: <Plus size={25} />, label: "Post" },
    { key: "saved", icon: <Heart size={21} />, label: "Saved" },
    { key: "profile", icon: <User size={21} />, label: isLoggedIn ? "Profile" : "Login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-[430px] items-center justify-around border-t border-border bg-card px-2 pb-5 pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] md:top-0 md:right-auto md:bottom-0 md:mx-0 md:w-24 md:max-w-none md:flex-col md:justify-start md:gap-3 md:border-r md:border-t-0 md:px-3 md:py-5 md:shadow-[12px_0_30px_rgba(15,23,42,0.06)]">
      <div className="mb-3 hidden h-12 w-12 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 md:flex">
        IH
      </div>
      {items.map((item) => {
        const active = screen === item.key;
        const isPost = item.key === "post";
        return (
          <button
            key={item.key}
            onClick={() => onNav(isPost && !isLoggedIn ? "login" : item.key)}
            className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-colors md:w-full md:py-2 ${
              active ? "text-primary md:bg-primary/10" : "text-muted-foreground hover:text-foreground md:hover:bg-muted"
            } ${isPost ? "-mt-7 md:mt-0" : ""}`}
          >
            <span className={isPost ? "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 md:h-12 md:w-12" : ""}>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold md:text-[11px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function ListingCard({
  property,
  onDetail,
  onLike,
  compact = false,
}: {
  property: Property;
  onDetail: () => void;
  onLike: (id: string) => void;
  compact?: boolean;
}) {
  const [playingInlineVideo, setPlayingInlineVideo] = useState(false);

  useEffect(() => {
    setPlayingInlineVideo(false);
  }, [property.id, property.videoUrl]);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card text-left shadow-[0_8px_30px_rgba(15,35,34,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_44px_rgba(15,35,34,0.10)]">
      <div
        onClick={() => {
          if (property.videoUrl) {
            setPlayingInlineVideo(true);
            return;
          }
          onDetail();
        }}
        className={`relative h-44 bg-muted md:h-48 lg:h-52 ${property.videoUrl ? "cursor-pointer" : ""}`}
      >
        {property.videoUrl ? (
          <video
            src={property.videoUrl}
            controls={playingInlineVideo}
            autoPlay={playingInlineVideo}
            muted={!playingInlineVideo}
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <img src={property.image} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        {!playingInlineVideo && <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />}
        {!playingInlineVideo && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {property.verified && (
              <Badge tone="success">
                <BadgeCheck size={12} /> Verified
              </Badge>
            )}
            {property.noBrokerage && <Badge tone="primary">No brokerage</Badge>}
          </div>
        )}
        {!playingInlineVideo && (
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <span className="rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-foreground shadow-sm">
              {formatPrice(property.price, property.listingType)}
            </span>
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {purposeLabel(property.purpose)}
            </span>
          </div>
        )}
      </div>
      <button onClick={onDetail} className="block w-full text-left">
        <div className="p-3">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
              {property.title}
            </h3>
            {property.featured && <Star size={16} className="mt-0.5 flex-shrink-0 fill-accent text-accent" />}
          </div>
          <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} className="text-primary" />
            {property.locality}, {property.city}
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
            <span className="rounded-lg bg-muted px-2 py-1">{property.bhk}</span>
            <span className="rounded-lg bg-muted px-2 py-1">{property.area} {property.areaUnit}</span>
          </div>
        </div>
      </button>
      <div className="flex border-t border-border">
        <button onClick={() => onLike(property.id)} className="flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Heart size={15} fill={property.liked ? "currentColor" : "none"} className={property.liked ? "text-rose-500" : ""} />
          {property.liked ? "Saved" : "Save"}
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 border-l border-border py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Share2 size={15} /> Share
        </button>
        <button onClick={onDetail} className="flex flex-1 items-center justify-center gap-2 border-l border-border py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
          View <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

function HomeScreen({
  properties,
  onDetail,
  onLike,
  onSearch,
  onMatch,
  onExplore,
  onPost,
}: {
  properties: Property[];
  onDetail: (p: Property) => void;
  onLike: (id: string) => void;
  onSearch: (purpose?: Purpose) => void;
  onMatch: () => void;
  onExplore: () => void;
  onPost: () => void;
}) {
  const [activePurpose, setActivePurpose] = useState<Purpose>("BUY");
  const featured = properties.filter((p) => p.purpose === activePurpose || (activePurpose === "BUY" && p.listingType === "SALE")).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8">
      <header className="border-b border-border bg-card px-4 pb-5 pt-5 md:px-8 md:pb-7 md:pt-8 lg:px-10">
        <div className="content-shell">
          <div className="mb-5">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <Sparkles size={13} /> InstaHouse
              </div>
              <h1 className="max-w-3xl text-2xl font-bold leading-tight md:text-4xl" style={{ fontFamily: "Fraunces, serif" }}>
                Find a house in 30 seconds
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Tell InstaHouse how you want to live. Get a short, ranked list of verified homes with walkthrough videos and approval-backed listings.
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-2 md:max-w-4xl md:grid-cols-[minmax(0,1fr)_220px]">
            <button
              onClick={() => onSearch(activePurpose)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-secondary md:px-4 md:py-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Search size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Search city, locality, project</p>
                <p className="truncate text-xs text-muted-foreground">Mumbai, Whitefield, plot, shop, 3 BHK...</p>
              </div>
              <SlidersHorizontal size={17} className="text-muted-foreground" />
            </button>
            <button
              onClick={onMatch}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 md:py-4"
            >
              <Sparkles size={18} /> Find in 30 sec
            </button>
          </div>
        </div>
      </header>

      <section className="content-shell px-4 py-4 md:px-8 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>What are you looking for?</h2>
          <button onClick={() => onSearch()} className="text-xs font-semibold text-primary">All filters</button>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {PURPOSES.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePurpose(item.key)}
              className={`interactive-card rounded-lg border px-2 py-3 text-left ${
                activePurpose === item.key ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15" : "border-border bg-card text-foreground"
              }`}
            >
              <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-primary">{item.icon}</span>
              <span className="block text-sm font-bold">{item.label}</span>
              <span className={`block text-[10px] ${activePurpose === item.key ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{item.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-shell px-4 pb-4 md:px-8 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>{purposeLabel(activePurpose)} properties</h2>
            <p className="text-xs text-muted-foreground">Verified listings with owner, broker, and builder options</p>
          </div>
          <button onClick={() => onSearch(activePurpose)} className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-primary">View all</button>
        </div>
        <div className="flex snap-x gap-3 overflow-x-auto pb-1 hide-scrollbar md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {featured.map((property) => (
            <div key={property.id} className="w-[82%] flex-shrink-0 snap-start md:w-auto">
              <ListingCard property={property} onDetail={() => onDetail(property)} onLike={onLike} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="content-shell px-4 pb-4 md:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button onClick={onExplore} className="interactive-card rounded-lg bg-foreground p-4 text-left text-background">
            <Video size={20} className="mb-3" />
            <p className="text-sm font-bold">Video walkthroughs</p>
            <p className="text-xs opacity-75">Reels, but for real visits</p>
          </button>
          <button onClick={onPost} className="interactive-card rounded-lg bg-primary p-4 text-left text-primary-foreground">
            <ClipboardCheck size={20} className="mb-3" />
            <p className="text-sm font-bold">Post property</p>
            <p className="text-xs opacity-75">Owner, broker, builder</p>
          </button>
        </div>
      </section>

    </div>
  );
}

function propertyMatchesIntent(property: Property, intent: MatchIntent) {
  if (intent === "ANY") return true;
  if (property.purpose === intent) return true;
  if (intent === "BUY" && property.listingType === "SALE") return true;
  if (intent === "RENT" && property.listingType === "RENT") return true;
  return false;
}

function propertyMatchesBudget(property: Property, budget: MatchBudget) {
  switch (budget) {
    case "BUY_UNDER_50L":
      return property.listingType === "SALE" && property.price <= 5000000;
    case "BUY_50L_1CR":
      return property.listingType === "SALE" && property.price > 5000000 && property.price <= 10000000;
    case "BUY_1CR_PLUS":
      return property.listingType === "SALE" && property.price > 10000000;
    case "RENT_UNDER_50K":
      return property.listingType === "RENT" && property.price <= 50000;
    default:
      return true;
  }
}

function getVibeFit(property: Property, vibe: MatchVibe) {
  const signals = [property.title, property.type, property.locality, property.description, ...property.amenities, ...property.nearby]
    .join(" ")
    .toLowerCase();
  const has = (...terms: string[]) => terms.some((term) => signals.includes(term));

  if (vibe === "COMMUTE") {
    return has("metro", "station", "airport", "corridor", "hub", "bkc", "itpl", "access")
      ? { score: 18, reason: "Commute-friendly location" }
      : { score: 6, reason: "Balanced daily access" };
  }

  if (vibe === "FAMILY") {
    if (property.bedrooms >= 2 && has("school", "security", "garden", "hospital")) return { score: 18, reason: "Family-ready surroundings" };
    if (property.bedrooms >= 2) return { score: 10, reason: "Practical family layout" };
    return { score: 4, reason: "Compact living fit" };
  }

  if (vibe === "INVESTMENT") {
    const trend = Number.parseFloat(property.priceTrend.replace(/[^\d.-]/g, ""));
    if (property.purpose === "PROJECT" || property.purpose === "PLOT" || property.purpose === "COMMERCIAL" || trend >= 8) {
      return { score: 18, reason: "Growth-friendly asset" };
    }
    return { score: 8, reason: "Stable market signal" };
  }

  return has("garden", "terrace", "lake", "park", "villa", "open")
    ? { score: 18, reason: "Calmer, open-space feel" }
    : { score: 8, reason: "Easygoing home feel" };
}

function HomeMatchScreen({ properties, onBack, onDetail }: { properties: Property[]; onBack: () => void; onDetail: (p: Property) => void }) {
  const [intent, setIntent] = useState<MatchIntent>("ANY");
  const [city, setCity] = useState("Any City");
  const [budget, setBudget] = useState<MatchBudget>("ANY");
  const [vibe, setVibe] = useState<MatchVibe>("CALM");
  const [mustHaveVideo, setMustHaveVideo] = useState(true);

  const cities = useMemo(() => ["Any City", ...Array.from(new Set(properties.map((property) => property.city))).sort()], [properties]);
  const budgetLabel = MATCH_BUDGETS.find((item) => item.key === budget)?.label || "Flexible";
  const vibeLabel = MATCH_VIBES.find((item) => item.key === vibe)?.label || "Calm";

  const matches = useMemo(() => {
    return properties
      .filter((property) => !mustHaveVideo || Boolean(property.videoUrl))
      .map((property) => {
        let score = 38;
        const reasons: string[] = [];

        if (propertyMatchesIntent(property, intent)) {
          score += intent === "ANY" ? 6 : 18;
          reasons.push(intent === "ANY" ? "Strong overall fit" : `${purposeLabel(intent)} match`);
        } else {
          score -= 16;
        }

        if (city === "Any City") {
          score += 4;
        } else if (property.city === city) {
          score += 18;
          reasons.push(`In ${property.city}`);
        } else {
          score -= 12;
        }

        if (propertyMatchesBudget(property, budget)) {
          score += budget === "ANY" ? 4 : 15;
          if (budget !== "ANY") reasons.push("Inside budget");
        } else {
          score -= 10;
        }

        if (property.verified) {
          score += 10;
          reasons.push("Verified listing");
        }
        if (property.videoUrl) {
          score += 8;
          reasons.push("Short video ready");
        }
        if (property.noBrokerage) {
          score += 6;
          reasons.push("No brokerage");
        }

        const vibeFit = getVibeFit(property, vibe);
        score += vibeFit.score;
        reasons.push(vibeFit.reason);

        return {
          property,
          score: Math.max(52, Math.min(98, Math.round(score))),
          reasons: Array.from(new Set(reasons)).slice(0, 4),
        };
      })
      .sort((a, b) => b.score - a.score || Number(b.property.featured) - Number(a.property.featured))
      .slice(0, 4);
  }, [properties, intent, city, budget, vibe, mustHaveVideo]);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <header className="border-b border-border bg-card">
        <div className="content-shell px-4 py-5 md:px-8 md:py-7 lg:px-10">
          <button onClick={onBack} className="mb-5 flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <Sparkles size={13} /> 30-sec Match
              </div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl" style={{ fontFamily: "Fraunces, serif" }}>
                Your house shortlist, instantly
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Pick the life you want first. InstaHouse turns that into a clear shortlist of verified places with videos, trust signals, and fit reasons.
              </p>
            </div>
            <div className="soft-panel rounded-lg p-4">
              <p className="label-sm">Current match</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-card px-2 py-3">
                  <p className="text-sm font-bold text-primary">{matches[0]?.score || 0}%</p>
                  <p className="text-[10px] text-muted-foreground">fit</p>
                </div>
                <div className="rounded-lg bg-card px-2 py-3">
                  <p className="truncate text-sm font-bold text-primary">{city === "Any City" ? "Any" : city}</p>
                  <p className="text-[10px] text-muted-foreground">city</p>
                </div>
                <div className="rounded-lg bg-card px-2 py-3">
                  <p className="truncate text-sm font-bold text-primary">{vibeLabel}</p>
                  <p className="text-[10px] text-muted-foreground">vibe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="content-shell grid gap-4 px-4 py-4 md:grid-cols-[360px_minmax(0,1fr)] md:px-8 md:py-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-10">
        <aside className="soft-panel rounded-lg p-4 md:sticky md:top-6 md:self-start">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="label-sm">Preferences</p>
              <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Shape your match</h2>
            </div>
            <SlidersHorizontal size={19} className="text-primary" />
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground">I want to</p>
              <div className="grid grid-cols-2 gap-2">
                {MATCH_INTENTS.map((option) => {
                  const active = intent === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setIntent(option.key)}
                      className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                        {option.icon}
                      </span>
                      <span className="block text-sm font-bold">{option.label}</span>
                      <span className={`block text-[10px] ${active ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{option.caption}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label-sm">Preferred city</label>
              <select value={city} onChange={(event) => setCity(event.target.value)} className="input-field">
                {cities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground">Budget comfort</p>
              <div className="grid gap-2">
                {MATCH_BUDGETS.map((option) => {
                  const active = budget === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setBudget(option.key)}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold">{option.label}</span>
                        <span className="block text-[10px] text-muted-foreground">{option.caption}</span>
                      </span>
                      {active && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground">Home should feel</p>
              <div className="grid grid-cols-2 gap-2">
                {MATCH_VIBES.map((option) => {
                  const active = vibe === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setVibe(option.key)}
                      className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <span className="block text-sm font-bold">{option.label}</span>
                      <span className={`block text-[10px] ${active ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{option.caption}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setMustHaveVideo((value) => !value)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                mustHaveVideo ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/30"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${mustHaveVideo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Video size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Short video required</span>
                <span className="block truncate text-xs text-muted-foreground">Show homes that already have walkthroughs</span>
              </span>
              {mustHaveVideo && <Check size={16} />}
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Ranked homes</p>
              <h2 className="text-xl font-bold md:text-2xl" style={{ fontFamily: "Fraunces, serif" }}>Best matches for you</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetLabel} · {mustHaveVideo ? "with video" : "video optional"}
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="soft-panel rounded-lg p-8 text-center">
              <Home size={34} className="mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>No matches yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try a flexible budget or make videos optional to widen the discovery set.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map(({ property, score, reasons }, index) => (
                <article
                  key={property.id}
                  className={`interactive-card overflow-hidden rounded-lg border bg-card ${
                    index === 0
                      ? "border-primary/25 shadow-[0_18px_44px_rgba(15,35,34,0.10)] md:grid md:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)]"
                      : "border-border md:grid md:grid-cols-[220px_minmax(0,1fr)]"
                  }`}
                >
                  <div className={`relative bg-muted ${index === 0 ? "h-60 md:h-full md:min-h-[300px]" : "h-48 md:h-full md:min-h-[220px]"}`}>
                    <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {index === 0 && <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">Best match</span>}
                      <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-sm">{score}% fit</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                      <span className="text-lg font-black">{formatPrice(property.price, property.listingType)}</span>
                      <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{purposeLabel(property.purpose)}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {property.verified && (
                        <Badge tone="success">
                          <Shield size={12} /> Approved
                        </Badge>
                      )}
                      {property.videoUrl && (
                        <Badge tone="primary">
                          <Video size={12} /> Video
                        </Badge>
                      )}
                      {property.noBrokerage && <Badge tone="accent">No brokerage</Badge>}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-bold leading-snug" style={{ fontFamily: "Fraunces, serif" }}>{property.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} className="text-primary" /> {property.locality}, {property.city}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {reasons.map((reason) => (
                        <span key={reason} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                          {reason}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-muted px-2 py-2">
                        <p className="font-bold text-foreground">{property.bhk}</p>
                        <p className="text-[10px] text-muted-foreground">layout</p>
                      </div>
                      <div className="rounded-lg bg-muted px-2 py-2">
                        <p className="font-bold text-foreground">{property.area} {property.areaUnit}</p>
                        <p className="text-[10px] text-muted-foreground">area</p>
                      </div>
                      <div className="rounded-lg bg-muted px-2 py-2">
                        <p className="truncate font-bold text-foreground">{property.possession}</p>
                        <p className="text-[10px] text-muted-foreground">move-in</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDetail(property)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      View this match <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SearchScreen({
  properties,
  initialPurpose,
  onDetail,
  onLike,
}: {
  properties: Property[];
  initialPurpose: Purpose | "ALL";
  onDetail: (p: Property) => void;
  onLike: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState<Purpose | "ALL">(initialPurpose);
  const [city, setCity] = useState("All Cities");
  const [bhk, setBhk] = useState("Any BHK");
  const [seller, setSeller] = useState<(typeof OWNER_TYPES)[number]>("Any Seller");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxBudget, setMaxBudget] = useState("Any Budget");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [compare, setCompare] = useState<string[]>([]);
  const cityOptions = useMemo(() => ["All Cities", ...Array.from(new Set(properties.map((property) => property.city).filter(Boolean))).sort()], [properties]);
  const bhkOptions = useMemo(() => ["Any BHK", ...Array.from(new Set(properties.map((property) => property.bhk).filter(Boolean))).sort()], [properties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        [p.title, p.projectName || "", p.locality, p.city, p.type, p.bhk].some((item) => item.toLowerCase().includes(q));
      const matchesPurpose = purpose === "ALL" || p.purpose === purpose || (purpose === "BUY" && p.listingType === "SALE");
      const matchesCity = city === "All Cities" || p.city === city;
      const matchesBhk = bhk === "Any BHK" || p.bhk === bhk || (bhk === "4+ BHK" && p.bedrooms >= 4);
      const matchesSeller = seller === "Any Seller" || p.ownerType === seller;
      const matchesVerified = !verifiedOnly || p.verified;
      const matchesBudget =
        maxBudget === "Any Budget" ||
        (maxBudget === "Under 25L" && p.price <= 2500000) ||
        (maxBudget === "25L-50L" && p.price >= 2500000 && p.price <= 5000000) ||
        (maxBudget === "50L-1Cr" && p.price >= 5000000 && p.price <= 10000000) ||
        (maxBudget === "Rent <25k" && p.listingType === "RENT" && p.price < 25000);
      return matchesQuery && matchesPurpose && matchesCity && matchesBhk && matchesSeller && matchesVerified && matchesBudget;
    });
  }, [properties, query, purpose, city, bhk, seller, verifiedOnly, maxBudget]);

  function toggleCompare(id: string) {
    setCompare((items) => (items.includes(id) ? items.filter((x) => x !== id) : items.length < 4 ? [...items, id] : items));
  }

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8">
      <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 pb-3 pt-4 shadow-sm backdrop-blur md:px-8 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl" style={{ fontFamily: "Fraunces, serif" }}>Search properties</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} matches · {compare.length} selected to compare</p>
          </div>
          <div className="flex rounded-lg bg-muted p-1">
            <button onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode("map")} className={`rounded-md p-1.5 ${viewMode === "map" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              <Map size={16} />
            </button>
          </div>
        </div>

        <div className="relative mb-3 md:max-w-4xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locality, project, builder..."
            className="w-full rounded-lg border border-border bg-background py-3 pl-9 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar md:flex-wrap md:overflow-visible">
          <select value={purpose} onChange={(e) => setPurpose(e.target.value as Purpose | "ALL")} className="filter-select">
            <option value="ALL">All categories</option>
            {PURPOSES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="filter-select">
            {cityOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={bhk} onChange={(e) => setBhk(e.target.value)} className="filter-select">
            {bhkOptions.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="filter-select">
            {["Any Budget", "Under 25L", "25L-50L", "50L-1Cr", "Rent <25k"].map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={seller} onChange={(e) => setSeller(e.target.value as (typeof OWNER_TYPES)[number])} className="filter-select">
            {OWNER_TYPES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`flex-shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${verifiedOnly ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            Verified only
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="content-shell grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] md:px-8 lg:px-10">
          <div className="relative h-72 overflow-hidden rounded-lg border border-border bg-[#dfe9e6] md:sticky md:top-32 md:h-[calc(100vh-12rem)] md:min-h-[520px]">
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#c9d8d3_1px,transparent_1px),linear-gradient(90deg,#c9d8d3_1px,transparent_1px)] [background-size:36px_36px]" />
            {filtered.slice(0, 7).map((p, index) => (
              <button
                key={p.id}
                onClick={() => onDetail(p)}
                className="absolute rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg"
                style={{ left: `${12 + (index * 23) % 70}%`, top: `${18 + (index * 17) % 58}%` }}
              >
                {formatPrice(p.price, p.listingType).replace("/mo", "")}
              </button>
            ))}
            <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur">
              <p className="text-sm font-bold">Map discovery</p>
              <p className="text-xs text-muted-foreground">Prototype view with listing pins. Connect Google Maps/Mapbox when backend locations are ready.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {filtered.slice(0, 3).map((p) => (
              <ListingCard key={p.id} property={p} onDetail={() => onDetail(p)} onLike={onLike} compact />
            ))}
          </div>
        </div>
      ) : (
        <div className="content-shell grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-2 md:px-8 lg:grid-cols-3 lg:px-10">
          {compare.length > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 md:col-span-2 lg:col-span-3">
              <p className="text-sm font-bold text-primary">Compare {compare.length} properties</p>
              <p className="text-xs text-muted-foreground">Select up to 4 listings to compare price, area, seller type, and verification.</p>
            </div>
          )}
          {filtered.map((property) => (
            <div key={property.id}>
              <ListingCard property={property} onDetail={() => onDetail(property)} onLike={onLike} />
              <button
                onClick={() => toggleCompare(property.id)}
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-xs font-semibold ${
                  compare.includes(property.id) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {compare.includes(property.id) ? "Added to compare" : "Add to compare"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoExploreScreen({ properties, onDetail, onLike, onBack }: { properties: Property[]; onDetail: (p: Property) => void; onLike: (id: string) => void; onBack: () => void }) {
  return (
    <div className="relative h-full bg-black text-white md:flex md:items-center md:justify-center md:p-4">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-4">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur">
          <ChevronLeft size={21} />
        </button>
        <div className="text-right">
          <p className="text-sm font-bold">Video walkthroughs</p>
          <p className="text-[11px] text-white/65">Explore mode, not the whole app</p>
        </div>
      </header>

      <div className="h-full snap-y snap-mandatory overflow-y-auto hide-scrollbar md:h-full md:max-h-[calc(100vh-2rem)] md:w-[430px] md:overflow-y-auto md:rounded-lg md:shadow-2xl">
        {properties.filter((p) => p.videoUrl).map((property) => (
          <section key={property.id} className="relative h-full snap-start">
            {property.videoUrl ? (
              <video
                src={property.videoUrl}
                controls
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <img src={property.image} alt={property.title} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/20" />
            <div className="absolute bottom-24 left-4 right-20">
              <div className="mb-2 flex gap-2">
                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">{purposeLabel(property.purpose)}</span>
                {property.verified && <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">Verified</span>}
              </div>
              <h2 className="mb-1 text-xl font-bold leading-tight" style={{ fontFamily: "Fraunces, serif" }}>{property.title}</h2>
              <p className="mb-3 flex items-center gap-1 text-sm text-white/80"><MapPin size={13} /> {property.locality}, {property.city}</p>
              <p className="text-2xl font-bold">{formatPrice(property.price, property.listingType)}</p>
              <button onClick={() => onDetail(property)} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-foreground">
                View full listing
              </button>
            </div>
            <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
              <button onClick={() => onLike(property.id)} className="flex flex-col items-center gap-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur">
                  <Heart size={20} fill={property.liked ? "white" : "none"} />
                </span>
                <span className="text-[10px]">{property.liked ? "Saved" : "Save"}</span>
              </button>
              <div className="flex flex-col items-center gap-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur">
                  <Eye size={19} />
                </span>
                <span className="text-[10px]">{compactNumber(property.views)}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur">
                  <Share2 size={18} />
                </span>
                <span className="text-[10px]">Share</span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function PropertyDetail({ property, onBack, onLike }: { property: Property; onBack: () => void; onLike: (id: string) => void }) {
  const [showLead, setShowLead] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const emi = property.listingType === "SALE" ? Math.round((property.price * 0.0086)) : 0;

  useEffect(() => {
    setPlayingVideo(false);
  }, [property.id]);

  return (
    <div className="content-shell h-full overflow-y-auto pb-24 md:grid md:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] md:items-start md:gap-6 md:px-8 md:py-8 md:pb-8 lg:grid-cols-[minmax(440px,0.95fr)_minmax(0,1.05fr)] lg:px-10">
      <div
        onClick={() => {
          if (property.videoUrl) setPlayingVideo(true);
        }}
        className={`relative h-72 bg-muted md:sticky md:top-8 md:h-[calc(100vh-4rem)] md:min-h-[620px] md:overflow-hidden md:rounded-lg ${property.videoUrl ? "cursor-pointer" : ""}`}
      >
        {property.videoUrl ? (
          <video
            src={property.videoUrl}
            controls={playingVideo}
            autoPlay={playingVideo}
            muted={!playingVideo}
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
        )}
        {!(playingVideo && property.videoUrl) && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />}
        <button onClick={(event) => { event.stopPropagation(); onBack(); }} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
          <ChevronLeft size={21} />
        </button>
        <button onClick={(event) => { event.stopPropagation(); onLike(property.id); }} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
          <Heart size={19} fill={property.liked ? "currentColor" : "none"} />
        </button>
        {!playingVideo && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="primary">{purposeLabel(property.purpose)}</Badge>
              {property.verified && <Badge tone="success"><BadgeCheck size={12} /> Verified</Badge>}
              {property.rera && <Badge tone="accent">RERA</Badge>}
            </div>
            <h1 className="text-2xl font-bold leading-tight text-white" style={{ fontFamily: "Fraunces, serif" }}>{property.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/80"><MapPin size={13} /> {property.locality}, {property.city}</p>
          </div>
        )}
      </div>

      <div className="px-4 py-4 md:px-0 md:py-0">
        <div className="soft-panel mb-4 rounded-lg p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "Fraunces, serif" }}>{formatPrice(property.price, property.listingType)}</p>
              <p className="text-xs text-muted-foreground">{property.ownerType} listing · Posted {property.postedDays} days ago</p>
            </div>
            <Badge tone={property.noBrokerage ? "primary" : "neutral"}>{property.noBrokerage ? "No brokerage" : property.ownerType}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "BHK", value: property.bhk, icon: <Bed size={14} /> },
              { label: "Bath", value: property.bathrooms || "-", icon: <Bath size={14} /> },
              { label: "Area", value: property.area, icon: <LayoutGrid size={14} /> },
              { label: "Parking", value: property.parking ? "Yes" : "No", icon: <Car size={14} /> },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-muted p-2 text-center">
                <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-card text-primary">{item.icon}</div>
                <p className="truncate text-xs font-bold">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mb-4">
          <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>About this property</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <BarChart3 size={18} className="mb-2 text-primary" />
            <p className="text-sm font-bold">Price trend</p>
            <p className="text-sm text-primary">{property.priceTrend}</p>
            <p className="text-[11px] text-muted-foreground">Locality estimate</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <IndianRupee size={18} className="mb-2 text-primary" />
            <p className="text-sm font-bold">{property.listingType === "SALE" ? "EMI estimate" : "Move-in cost"}</p>
            <p className="text-sm text-primary">{property.listingType === "SALE" ? `₹${emi.toLocaleString("en-IN")}/mo` : `₹${(property.price * 2).toLocaleString("en-IN")}`}</p>
            <p className="text-[11px] text-muted-foreground">Indicative only</p>
          </div>
        </section>

        {property.amenities.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span key={amenity} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                  {AMENITY_ICONS[amenity] || <Star size={12} />}
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-4">
          <h2 className="mb-2 text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Nearby</h2>
          <div className="grid grid-cols-2 gap-2">
            {property.nearby.map((place) => (
              <span key={place} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
                <Navigation size={13} className="text-primary" /> {place}
              </span>
            ))}
          </div>
        </section>

        {!showLead ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowLead(true)} className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
              <Phone size={16} /> Contact seller
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3.5 text-sm font-bold text-primary transition-colors hover:bg-secondary">
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        ) : submitted ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <Check size={28} className="mx-auto mb-2 text-emerald-600" />
            <p className="font-bold">Enquiry sent</p>
            <p className="text-sm text-muted-foreground">{property.ownerName} will get your contact request at {phone}.</p>
          </div>
        ) : (
          <div className="soft-panel rounded-lg p-4">
            <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Contact {property.ownerType.toLowerCase()}</h2>
            <div className="flex flex-col gap-3">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number *" className="input-field" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="input-field" />
              <button disabled={phone.length < 10} onClick={() => setSubmitted(true)} className="rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-45">
                Send enquiry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedScreen({ properties, onDetail, onLike }: { properties: Property[]; onDetail: (p: Property) => void; onLike: (id: string) => void }) {
  const saved = properties.filter((p) => p.liked);

  return (
    <div className="h-full overflow-y-auto px-4 py-5 pb-24 md:px-8 md:pb-8 lg:px-10">
      <h1 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: "Fraunces, serif" }}>Saved properties</h1>
      <p className="mb-4 text-sm text-muted-foreground">Shortlist homes, compare details, and come back before contacting sellers.</p>

      {saved.length === 0 ? (
        <div className="soft-panel mt-16 rounded-lg p-6 text-center">
          <BookmarkCheck size={34} className="mx-auto mb-3 text-primary" />
          <p className="font-bold">No saved properties yet</p>
          <p className="text-sm text-muted-foreground">Tap Save on any listing to build your shortlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 md:col-span-2 lg:col-span-3">
            <p className="text-sm font-bold text-primary">Compare-ready shortlist</p>
            <p className="text-xs text-muted-foreground">Saved properties can become a side-by-side comparison table in the next backend pass.</p>
          </div>
          {saved.map((property) => (
            <ListingCard key={property.id} property={property} onDetail={() => onDetail(property)} onLike={onLike} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostPropertyScreen({ user, onBack, onSubmit }: { user: User; onBack: () => void; onSubmit: (property: Property, videoFile: File | null) => Promise<void> | void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [form, setForm] = useState({
    sellerType: "Owner",
    purpose: "RENT",
    title: "",
    type: "Apartment",
    city: "",
    locality: "",
    bhk: "2 BHK",
    area: "",
    price: "",
    furnishing: "Unfurnished",
    possession: "Immediate",
    rera: "",
    securityDeposit: "",
    maintenanceCharges: "",
    maintenanceIncluded: "No",
    availableFrom: "",
    leasePeriodMonths: "",
    preferredTenants: "Family",
    priceNegotiable: "No",
    bookingAmount: "",
    loanAvailable: "No",
    propertyAge: "",
    ownershipType: "Freehold",
    pgMonthlyRentPerBed: "",
    pgSharingType: "Single",
    pgFoodIncluded: "No",
    genderPreference: "Co-ed",
    commercialPricingType: "RENT",
    commercialUsage: "Office",
    commercialCarpetArea: "",
    commercialBuiltUpArea: "",
    plotArea: "",
    plotAreaUnit: "Sq Ft",
    boundaryWall: "No",
    cornerPlot: "No",
    approvedBy: "",
    projectPriceMin: "",
    projectPriceMax: "",
    projectPossessionDate: "",
    projectTowerCount: "",
    projectConfigurations: "",
    photos: false,
    video: false,
    videoFileName: "",
    ownershipProof: false,
  });

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleVideoUpload(file?: File) {
    if (!file) return;
    if (!agreementAccepted) {
      setVideoError("Accept the property consent agreement before uploading a video.");
      setVideoFile(null);
      update("video", false);
      update("videoFileName", "");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setVideoError("Please upload a valid short video file.");
      setVideoFile(null);
      update("video", false);
      update("videoFileName", "");
      return;
    }
    setVideoError("");
    setVideoFile(file);
    update("video", true);
    update("videoFileName", file.name);
  }

  async function handleSubmitForReview() {
    if (!agreementAccepted) {
      setVideoError("Accept the property consent agreement before submitting.");
      return;
    }
    if (!form.video || !form.videoFileName) {
      setVideoError("Short walkthrough video is mandatory before submitting.");
      return;
    }

    const propertyId = `owner-${Date.now()}`;
    const price = Number(form.price) || (form.purpose === "RENT" || form.purpose === "PG" ? 25000 : 7500000);
    const bedrooms = Number.parseInt(form.bhk, 10) || 0;
    const listingType = form.purpose === "RENT" || form.purpose === "PG"
      ? "RENT"
      : form.purpose === "COMMERCIAL"
      ? (form.commercialPricingType as "RENT" | "SALE")
      : "SALE";

    const submittedProperty: Property = {
      id: propertyId,
      title: form.title || `${form.bhk} ${form.type} in ${form.locality || form.city}`,
      purpose: form.purpose as Purpose,
      listingType,
      type: form.type,
      price,
      city: form.city,
      locality: form.locality || "Submitted locality",
      bhk: form.bhk,
      area: Number(form.area) || 1000,
      areaUnit: "Sq Ft",
      furnishing: form.purpose === "BUY" ? "N/A" : form.furnishing,
      bedrooms,
      bathrooms: bedrooms > 0 ? Math.min(bedrooms, 3) : 0,
      parking: true,
      amenities: ["Security", "Parking"],
      description: "Owner submitted listing waiting for manual approval.",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&h=1100&fit=crop&auto=format",
      ownerName: `${user.firstName} ${user.lastName}`,
      ownerPhone: user.phone,
      ownerId: user.id,
      ownerType: form.sellerType as OwnerType,
      status: "PENDING_REVIEW",
      possession: form.possession as Property["possession"],
      verified: false,
      noBrokerage: form.sellerType === "Owner",
      featured: false,
      rera: form.rera || undefined,
      securityDeposit: Number(form.securityDeposit) || undefined,
      maintenanceCharges: Number(form.maintenanceCharges) || undefined,
      maintenanceIncluded: form.maintenanceIncluded === "Yes",
      availableFrom: form.availableFrom || undefined,
      leasePeriodMonths: Number(form.leasePeriodMonths) || undefined,
      preferredTenants: form.preferredTenants || undefined,
      priceNegotiable: form.priceNegotiable === "Yes",
      bookingAmount: Number(form.bookingAmount) || undefined,
      loanAvailable: form.loanAvailable === "Yes",
      propertyAge: Number(form.propertyAge) || undefined,
      ownershipType: form.ownershipType || undefined,
      pgMonthlyRentPerBed: Number(form.pgMonthlyRentPerBed) || undefined,
      pgSharingType: form.pgSharingType || undefined,
      pgFoodIncluded: form.pgFoodIncluded === "Yes",
      genderPreference: form.genderPreference || undefined,
      commercialPricingType: form.commercialPricingType as "RENT" | "SALE" | undefined,
      commercialUsage: form.commercialUsage || undefined,
      commercialCarpetArea: Number(form.commercialCarpetArea) || undefined,
      commercialBuiltUpArea: Number(form.commercialBuiltUpArea) || undefined,
      plotArea: Number(form.plotArea) || undefined,
      plotAreaUnit: form.plotAreaUnit || undefined,
      boundaryWall: form.boundaryWall === "Yes",
      cornerPlot: form.cornerPlot === "Yes",
      approvedBy: form.approvedBy || undefined,
      projectPriceMin: Number(form.projectPriceMin) || undefined,
      projectPriceMax: Number(form.projectPriceMax) || undefined,
      projectPossessionDate: form.projectPossessionDate || undefined,
      projectTowerCount: Number(form.projectTowerCount) || undefined,
      projectConfigurations: form.projectConfigurations || undefined,
      videoRef: `pending/${propertyId}/${form.videoFileName}`,
      videoFileName: form.videoFileName,
      submittedAt: new Date().toISOString(),
      reviewNote: "Short video received. Waiting for manual admin approval.",
      postedDays: 0,
      views: 0,
      leads: 0,
      liked: false,
      nearby: ["To be verified"],
      priceTrend: "Pending",
    };

    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit(submittedProperty, videoFile);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit this listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check size={36} />
        </div>
        <h1 className="mb-2 text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Listing submitted</h1>
        <p className="mb-6 text-sm text-muted-foreground">Your short video and listing details are saved in the review queue. An admin must approve it before it appears publicly.</p>
        <button onClick={onBack} className="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground">Back to marketplace</button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 pb-3 pt-4 md:px-8 lg:px-10">
        <button onClick={onBack} className="text-muted-foreground"><ChevronLeft size={22} /></button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>Post property</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4 · Posting as {user.firstName}</p>
        </div>
        <div className="hidden items-center gap-1.5 md:flex">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className={`h-2 rounded-full transition-all ${index + 1 <= step ? "w-8 bg-primary" : "w-3 bg-muted"}`} />
          ))}
        </div>
      </div>
      <div className="h-1 bg-muted md:hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {step === 1 && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <SectionTitle icon={<User size={18} />} title="Seller profile" subtitle="Support owners, brokers, and builders from day one." />
            <FieldSelect label="I am a" value={form.sellerType} onChange={(v) => update("sellerType", v)} options={["Owner", "Broker", "Builder"]} />
            <FieldSelect label="Listing category" value={form.purpose} onChange={(v) => update("purpose", v)} options={["BUY", "RENT", "COMMERCIAL", "PG", "PLOT", "PROJECT"]} />
            <FieldInput label="Listing title" placeholder="e.g. 3BHK near Marine Drive" value={form.title} onChange={(v) => update("title", v)} />
            <FieldSelect label="Property type" value={form.type} onChange={(v) => update("type", v)} options={["Apartment", "Independent House", "Villa", "Plot", "Commercial Office", "Shop", "Warehouse", "New Project"]} />
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <SectionTitle icon={<MapPin size={18} />} title="Location and size" subtitle="A clear locality improves search ranking and map quality." />
            <FieldInput label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="Enter city" />
            <FieldInput label="Locality" placeholder="Whitefield, Andheri West, Hitec City..." value={form.locality} onChange={(v) => update("locality", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldSelect label="BHK" value={form.bhk} onChange={(v) => update("bhk", v)} options={["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK", "N/A"]} />
              <FieldInput label="Area" placeholder="1450" value={form.area} onChange={(v) => update("area", v)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <SectionTitle icon={<IndianRupee size={18} />} title="Category-specific details" subtitle="Ask the right questions for each property type." />

            {form.purpose === "RENT" && (
              <>
                <FieldInput label="Monthly rent" placeholder="22000" value={form.price} onChange={(v) => update("price", v)} />
                <FieldInput label="Security deposit" placeholder="50000" value={form.securityDeposit} onChange={(v) => update("securityDeposit", v)} />
                <FieldSelect label="Maintenance included" value={form.maintenanceIncluded} onChange={(v) => update("maintenanceIncluded", v)} options={["No", "Yes"]} />
                <FieldInput label="Maintenance charges" placeholder="2000" value={form.maintenanceCharges} onChange={(v) => update("maintenanceCharges", v)} />
                <FieldInput label="Available from" placeholder="Select date" type="date" value={form.availableFrom} onChange={(v) => update("availableFrom", v)} />
                <FieldInput label="Lease / lock-in period (months)" placeholder="12" value={form.leasePeriodMonths} onChange={(v) => update("leasePeriodMonths", v)} />
                <FieldSelect label="Preferred tenants" value={form.preferredTenants} onChange={(v) => update("preferredTenants", v)} options={["Family", "Bachelors", "Company lease"]} />
                <FieldSelect label="Furnishing" value={form.furnishing} onChange={(v) => update("furnishing", v)} options={["Unfurnished", "Semi Furnished", "Fully Furnished", "N/A"]} />
              </>
            )}

            {form.purpose === "BUY" && (
              <>
                <FieldInput label="Expected price" placeholder="7500000" value={form.price} onChange={(v) => update("price", v)} />
                <FieldSelect label="Price negotiable" value={form.priceNegotiable} onChange={(v) => update("priceNegotiable", v)} options={["No", "Yes"]} />
                <FieldInput label="Booking amount / token" placeholder="200000" value={form.bookingAmount} onChange={(v) => update("bookingAmount", v)} />
                <FieldSelect label="Loan available" value={form.loanAvailable} onChange={(v) => update("loanAvailable", v)} options={["No", "Yes"]} />
                <FieldInput label="Age of property (years)" placeholder="5" value={form.propertyAge} onChange={(v) => update("propertyAge", v)} />
                <FieldSelect label="Ownership type" value={form.ownershipType} onChange={(v) => update("ownershipType", v)} options={["Freehold", "Leasehold", "Cooperative Society"]} />
                <FieldInput label="RERA ID" placeholder="RERA-IN-..." value={form.rera} onChange={(v) => update("rera", v)} />
              </>
            )}

            {form.purpose === "PG" && (
              <>
                <FieldInput label="Monthly rent per bed" placeholder="9000" value={form.pgMonthlyRentPerBed} onChange={(v) => update("pgMonthlyRentPerBed", v)} />
                <FieldSelect label="Sharing type" value={form.pgSharingType} onChange={(v) => update("pgSharingType", v)} options={["Single", "Double", "Triple"]} />
                <FieldSelect label="Food included" value={form.pgFoodIncluded} onChange={(v) => update("pgFoodIncluded", v)} options={["No", "Yes"]} />
                <FieldSelect label="Gender preference" value={form.genderPreference} onChange={(v) => update("genderPreference", v)} options={["Male", "Female", "Co-ed"]} />
                <FieldInput label="Available from" placeholder="Select date" type="date" value={form.availableFrom} onChange={(v) => update("availableFrom", v)} />
                <FieldSelect label="Furnishing" value={form.furnishing} onChange={(v) => update("furnishing", v)} options={["Unfurnished", "Semi Furnished", "Fully Furnished", "N/A"]} />
              </>
            )}

            {form.purpose === "COMMERCIAL" && (
              <>
                <FieldSelect label="Pricing type" value={form.commercialPricingType} onChange={(v) => update("commercialPricingType", v)} options={["RENT", "SALE"]} />
                <FieldInput label={form.commercialPricingType === "RENT" ? "Monthly rent" : "Expected price"} placeholder="22000" value={form.price} onChange={(v) => update("price", v)} />
                <FieldSelect label="Property usage" value={form.commercialUsage} onChange={(v) => update("commercialUsage", v)} options={["Office", "Retail", "Warehouse", "Restaurant-fit"]} />
                <FieldInput label="Carpet area" placeholder="1500" value={form.commercialCarpetArea} onChange={(v) => update("commercialCarpetArea", v)} />
                <FieldInput label="Built-up area" placeholder="1800" value={form.commercialBuiltUpArea} onChange={(v) => update("commercialBuiltUpArea", v)} />
                <FieldSelect label="Furnishing" value={form.furnishing} onChange={(v) => update("furnishing", v)} options={["Unfurnished", "Semi Furnished", "Fully Furnished", "N/A"]} />
              </>
            )}

            {form.purpose === "PLOT" && (
              <>
                <FieldInput label="Expected price" placeholder="2500000" value={form.price} onChange={(v) => update("price", v)} />
                <FieldInput label="Plot area" placeholder="1200" value={form.plotArea} onChange={(v) => update("plotArea", v)} />
                <FieldSelect label="Plot unit" value={form.plotAreaUnit} onChange={(v) => update("plotAreaUnit", v)} options={["Sq Ft", "Sq Yard", "Acres"]} />
                <FieldSelect label="Boundary wall" value={form.boundaryWall} onChange={(v) => update("boundaryWall", v)} options={["No", "Yes"]} />
                <FieldSelect label="Corner plot" value={form.cornerPlot} onChange={(v) => update("cornerPlot", v)} options={["No", "Yes"]} />
                <FieldInput label="Approved by" placeholder="BDA / BBMP / Panchayat" value={form.approvedBy} onChange={(v) => update("approvedBy", v)} />
              </>
            )}

            {form.purpose === "PROJECT" && (
              <>
                <FieldInput label="Price range start" placeholder="4500000" value={form.projectPriceMin} onChange={(v) => update("projectPriceMin", v)} />
                <FieldInput label="Price range max" placeholder="8500000" value={form.projectPriceMax} onChange={(v) => update("projectPriceMax", v)} />
                <FieldInput label="Possession date" placeholder="Select date" type="date" value={form.projectPossessionDate} onChange={(v) => update("projectPossessionDate", v)} />
                <FieldInput label="Number of towers / units" placeholder="2" value={form.projectTowerCount} onChange={(v) => update("projectTowerCount", v)} />
                <div className="md:col-span-2">
                  <label className="label-sm">Configurations offered</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['1 BHK', '2 BHK', '3 BHK', '4 BHK'].map((config) => {
                      const selected = form.projectConfigurations.split(',').map((item: string) => item.trim()).filter(Boolean).includes(config);
                      return (
                        <button
                          key={config}
                          type="button"
                          onClick={() => {
                            const values = form.projectConfigurations
                              .split(',')
                              .map((item: string) => item.trim())
                              .filter(Boolean);
                            const next = values.includes(config)
                              ? values.filter((item) => item !== config)
                              : [...values, config];
                            update("projectConfigurations", next.join(", "));
                          }}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}
                        >
                          {config}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <FieldInput label="RERA ID" placeholder="RERA-IN-..." value={form.rera} onChange={(v) => update("rera", v)} />
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <SectionTitle icon={<Camera size={18} />} title="Short video required" subtitle="A walkthrough video is mandatory. It goes to the review queue before the listing can go live." />
            <UploadToggle active={form.photos} icon={<Camera size={20} />} title="Property photos" caption="Add exterior, rooms, kitchen, bathroom, street view" onClick={() => update("photos", !form.photos)} />
            <button
              onClick={() => {
                setAgreementAccepted((value) => !value);
                setVideoError("");
              }}
              className={`interactive-card flex w-full items-start gap-3 rounded-lg border p-4 text-left ${agreementAccepted ? "border-primary bg-primary/10" : "border-dashed border-border bg-card"}`}
            >
              <span className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${agreementAccepted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {agreementAccepted ? <Check size={18} /> : <FileCheck2 size={18} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Property consent agreement *</span>
                <span className="block text-xs leading-5 text-muted-foreground">I confirm this property belongs to me or I am authorized to list it, and the details/video are accurate.</span>
              </span>
            </button>
            <label className={`interactive-card flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left ${form.video ? "border-primary bg-primary/10" : agreementAccepted ? "border-dashed border-primary/40 bg-card" : "border-dashed border-border bg-muted/60 opacity-70"}`}>
              <input disabled={!agreementAccepted} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(event) => handleVideoUpload(event.target.files?.[0])} />
              <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${form.video ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                {form.video ? <Check size={21} /> : <Video size={20} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Short walkthrough video *</span>
                <span className="block truncate text-xs text-muted-foreground">{form.videoFileName || (agreementAccepted ? "MP4, MOV, or WEBM. Keep it short and clear." : "Accept consent to enable upload.")}</span>
              </span>
              <Upload size={17} className="text-muted-foreground" />
            </label>
            {videoError && <p className="md:col-span-2 -mt-2 flex items-center gap-1 text-xs font-semibold text-destructive"><AlertCircle size={13} /> {videoError}</p>}
            {submitError && <p className="md:col-span-2 -mt-2 flex items-center gap-1 text-xs font-semibold text-destructive"><AlertCircle size={13} /> {submitError}</p>}
            <UploadToggle active={form.ownershipProof} icon={<FileCheck2 size={20} />} title="Ownership / mandate proof" caption="Required for verified badge" onClick={() => update("ownershipProof", !form.ownershipProof)} />
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-border bg-card px-4 py-4 md:px-8">
        <div className="mx-auto flex w-full max-w-4xl gap-3">
          {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="flex-1 rounded-lg border border-border py-3 text-sm font-bold transition-colors hover:bg-muted">Back</button>}
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">Next</button>
          ) : (
            <button disabled={submitting} onClick={handleSubmitForReview} className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit for review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onSignup, onBack }: { onLogin: (credentials: LoginCredentials) => Promise<void> | void; onSignup: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function handleLogin() {
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Enter your password.");
      return;
    }

    setLoggingIn(true);
    setError("");
    try {
      await onLogin({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not login. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col px-6 pb-10 pt-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-1 self-start text-muted-foreground">
        <ChevronLeft size={18} /> Back
      </button>
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">InstaHouse account</p>
        <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Welcome back</h1>
        <p className="text-muted-foreground">Login to post, save, compare, and manage leads.</p>
      </div>

      <label className="label-sm">Email</label>
      <input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} className="input-field mb-3" />
      <label className="label-sm">Password</label>
      <input type="password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} className="input-field mb-3" />
      {error && <p className="mb-3 flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} />{error}</p>}
      <button disabled={loggingIn} onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 font-bold text-primary-foreground disabled:opacity-60">
        {loggingIn ? "Logging in..." : "Login"} {!loggingIn && <ArrowRight size={18} />}
      </button>

      <div className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        New here? <button onClick={onSignup} className="font-bold text-primary">Create account</button>
      </div>
    </div>
  );
}

function SignupScreen({ onSignup, onLogin, onBack }: { onSignup: (input: SignupInput) => Promise<void> | void; onLogin: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const next: Record<string, string> = {};
    const normalizedPhone = normalizePhone(form.phone);
    if (!form.firstName) next.firstName = "Required";
    if (!form.lastName) next.lastName = "Required";
    if (!form.email.includes("@")) next.email = "Valid email required";
    if (normalizedPhone.length < 10) next.phone = "Valid phone required";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await onSignup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: normalizedPhone,
        password: form.password,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-md overflow-y-auto px-6 pb-10 pt-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-1 text-muted-foreground"><ChevronLeft size={18} /> Back</button>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Create account</h1>
      <p className="mb-8 text-muted-foreground">Use InstaHouse as a buyer, tenant, owner, broker, or builder.</p>
      <div className="flex flex-col gap-4">
        {[
          ["firstName", "First name", "Rajesh"],
          ["lastName", "Last name", "Sharma"],
          ["email", "Email", "rajesh@example.com"],
          ["phone", "Phone number", "+91 98765 43210"],
          ["password", "Password", "Minimum 8 characters"],
        ].map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="label-sm">{label}</label>
            <input type={key === "password" ? "password" : key === "email" ? "email" : "text"} value={(form as any)[key]} placeholder={placeholder} onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setSubmitError(""); }} className={`input-field ${errors[key] ? "ring-1 ring-destructive" : ""}`} />
            {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
          </div>
        ))}
        {submitError && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} />{submitError}</p>}
        <button disabled={submitting} onClick={submit} className="mt-2 rounded-lg bg-primary py-4 font-bold text-primary-foreground disabled:opacity-60">
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-muted-foreground">Already have an account? <button onClick={onLogin} className="font-bold text-primary">Login</button></p>
      </div>
    </div>
  );
}

function ProfileScreen({ user, properties, onLogout, onLogin, onAdmin }: { user: User | null; properties: Property[]; onLogout: () => void; onLogin: () => void; onAdmin: () => void }) {
  const [dashboardTab, setDashboardTab] = useState<OwnerDashboardTab>("approvals");

  if (!user) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User size={36} />
        </div>
        <h1 className="mb-2 text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>Sign in</h1>
        <p className="mb-8 text-sm text-muted-foreground">Post properties, save favourites, compare homes, and track seller leads.</p>
        <button onClick={onLogin} className="w-full rounded-lg bg-primary py-4 font-bold text-primary-foreground">Login</button>
      </div>
    );
  }

  const submittedByUser = properties.filter((property) => property.ownerId === user.id);
  const myProperties = submittedByUser.slice(0, 4);
  const totalLeads = myProperties.reduce((sum, p) => sum + p.leads, 0);
  const pendingApprovals = myProperties.filter((property) => property.status === "PENDING_REVIEW").length;

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8">
      <div className="border-b border-border bg-card px-4 py-5 md:px-8 lg:px-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary" style={{ fontFamily: "Fraunces, serif" }}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.phone}</p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2 px-4 py-4 md:grid-cols-4 md:px-8 lg:px-10">
        {[
          [myProperties.length, "listings"],
          [totalLeads, "leads"],
          [pendingApprovals, "pending"],
          [properties.filter((p) => p.liked).length, "saved"],
        ].map(([value, label]) => (
          <div key={label} className="soft-panel rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-primary">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="content-shell px-4 pb-4 md:px-8 lg:px-10">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            <SquareStack size={17} className="text-primary" /> Owner dashboard
          </h2>
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-xs font-bold md:w-72">
            {[
              ["listings", "Listings"],
              ["approvals", "Approvals"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDashboardTab(key as OwnerDashboardTab)}
                className={`rounded-md px-3 py-2 transition-colors ${
                  dashboardTab === key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {dashboardTab === "listings" ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {myProperties.map((p) => (
              <div key={p.id} className="interactive-card flex gap-3 rounded-lg border border-border bg-card p-3">
                <img src={p.image} alt={p.title} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.locality}, {p.city}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <ApprovalStatusPill status={p.status} />
                    <Badge tone="primary">{p.leads} leads</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {myProperties.map((property) => {
              const meta = getApprovalMeta(property.status);
              return (
                <article key={property.id} className="interactive-card rounded-lg border border-border bg-card p-3">
                  <div className="mb-3 flex gap-3">
                    <img src={property.image} alt={property.title} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold">{property.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{property.locality}, {property.city}</p>
                      <div className="mt-2">
                        <ApprovalStatusPill status={property.status} />
                      </div>
                    </div>
                  </div>
                  <p className="mb-3 text-xs leading-5 text-muted-foreground">{meta.description}</p>
                  <div className="mb-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                    {["Submitted", "In review", "Live"].map((step, index) => (
                      <div key={step} className={`rounded-md px-2 py-1.5 ${meta.step >= index + 1 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${property.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {meta.note}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-4 pb-4 md:max-w-xl md:px-8 lg:px-10">
        <button onClick={onAdmin} className="interactive-card mb-3 flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent"><Shield size={17} /></span>
          <span className="text-sm font-bold">Admin review panel</span>
          <ArrowRight size={16} className="ml-auto text-muted-foreground" />
        </button>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 px-4 py-3 text-sm font-bold text-destructive">
          <LogOut size={16} /> Logout
        </button>
      </section>
    </div>
  );
}

function AdminScreen({ properties, onBack, onDecision }: { properties: Property[]; onBack: () => void; onDecision: (id: string, status: "APPROVED" | "REJECTED") => void }) {
  const pending = properties.filter((p) => p.status === "PENDING_REVIEW");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 pb-3 pt-4 md:px-8 lg:px-10">
        <button onClick={onBack}><ChevronLeft size={22} className="text-muted-foreground" /></button>
        <div>
          <h1 className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>Admin panel</h1>
          <p className="text-xs text-muted-foreground">Manually approve submitted listings and short videos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-8 md:pb-8 lg:px-10">
        <div className="mb-4 grid grid-cols-3 gap-2 md:max-w-xl">
          {[
            [pending.length, "pending"],
            ["6", "flagged"],
            ["91%", "verified"],
          ].map(([value, label]) => (
            <div key={label} className="soft-panel rounded-lg p-3 text-center">
              <p className="font-bold text-primary">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        {pending.length === 0 ? (
          <div className="soft-panel rounded-lg p-6 text-center">
            <Check size={30} className="mx-auto mb-2 text-primary" />
            <p className="font-bold">No listings waiting for approval</p>
            <p className="text-sm text-muted-foreground">New posts with mandatory short videos will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pending.map((property) => (
              <article key={property.id} className="interactive-card overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex gap-3 p-3">
                  {property.videoUrl ? (
                    <video
                      src={property.videoUrl}
                      controls
                      playsInline
                      className="h-24 w-24 flex-shrink-0 rounded-lg bg-black object-cover"
                    />
                  ) : (
                    <img src={property.image} alt={property.title} className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold">{property.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} /> {property.locality}, {property.city}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatPrice(property.price, property.listingType)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="primary">{property.ownerType}</Badge>
                      {property.rera && <Badge tone="accent">RERA</Badge>}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border px-3 py-2">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Short video in review queue</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{property.videoFileName || property.videoRef}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-3 pt-3">
                  <button onClick={() => onDecision(property.id, "REJECTED")} className="rounded-lg border border-destructive/40 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10">
                    Reject
                  </button>
                  <button onClick={() => onDecision(property.id, "APPROVED")} className="rounded-lg bg-primary py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90">
                    Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="soft-panel rounded-lg p-4 md:col-span-2">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h2 className="text-lg font-bold" style={{ fontFamily: "Fraunces, serif" }}>{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function FieldInput({ label, placeholder, value, type = "text", onChange }: { label: string; placeholder: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field appearance-none pr-10">
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

function UploadToggle({ active, icon, title, caption, onClick }: { active: boolean; icon: ReactNode; title: string; caption: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`interactive-card flex w-full items-center gap-3 rounded-lg border p-4 text-left ${active ? "border-primary bg-primary/10" : "border-dashed border-border bg-card"}`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {active ? <Check size={21} /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{caption}</span>
      </span>
      {!active && <Upload size={17} className="text-muted-foreground" />}
    </button>
  );
}

function getApprovalMeta(status: Property["status"]) {
  const meta = {
    APPROVED: {
      label: "Approved",
      description: "Your listing is live and visible in search results.",
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      icon: <Check size={13} />,
      step: 3,
      note: "No action needed.",
    },
    PENDING_REVIEW: {
      label: "Pending review",
      description: "Our team is checking the listing details, media, and seller information.",
      className: "bg-amber-500/10 text-amber-700 border-amber-500/25",
      icon: <Clock size={13} />,
      step: 2,
      note: "Usually reviewed within 24 hours.",
    },
    REJECTED: {
      label: "Needs changes",
      description: "The listing was not approved. Update the requested details and resubmit.",
      className: "bg-destructive/10 text-destructive border-destructive/25",
      icon: <X size={13} />,
      step: 1,
      note: "Action required before it can go live.",
    },
    DRAFT: {
      label: "Draft",
      description: "This listing has not been submitted for approval yet.",
      className: "bg-muted text-muted-foreground border-border",
      icon: <FileCheck2 size={13} />,
      step: 0,
      note: "Complete and submit when ready.",
    },
  } satisfies Record<Property["status"], { label: string; description: string; className: string; icon: ReactNode; step: number; note: string }>;

  return meta[status];
}

function ApprovalStatusPill({ status }: { status: Property["status"] }) {
  const meta = getApprovalMeta(status);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [user, setUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataSourceError, setDataSourceError] = useState("");
  const [initialPurpose, setInitialPurpose] = useState<Purpose | "ALL">("ALL");

  useEffect(() => {
    void restoreSessionAndLoad();
  }, []);

  async function loadProfile(userId: string) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name,last_name,phone,email,is_admin")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Could not load profile", error);
      return null;
    }

    return data as DbProfile | null;
  }

  async function restoreSessionAndLoad() {
    if (!supabase) {
      setProperties([]);
      setDataSourceError("Supabase is not configured, so backend listings cannot be loaded.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    let restoredUser: User | null = null;

    if (sessionUser) {
      const profile = await loadProfile(sessionUser.id);
      restoredUser = profileToUser(sessionUser.id, profile);
      setUser(restoredUser);
    }

    await refreshProperties(restoredUser);
  }

  async function refreshProperties(currentUser: User | null = user) {
    if (!supabase) {
      setProperties([]);
      return;
    }

    try {
      async function queryProperties(select: string) {
        return supabase!
          .from("properties")
          .select(select)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });
      }

      let { data, error } = await queryProperties(PROPERTY_SELECT);
      if (error && /stored_filename|schema cache|column/i.test(error.message)) {
        console.warn("Retrying property load without stored_filename while Supabase schema cache refreshes", error);
        const fallback = await queryProperties(PROPERTY_SELECT_WITHOUT_STORED_FILENAME);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      const savedIds = new Set<string>();
      if (currentUser) {
        const { data: savedRows, error: savedError } = await supabase
          .from("saved_properties")
          .select("property_id")
          .eq("user_id", currentUser.id);

        if (!savedError) {
          savedRows?.forEach((row) => savedIds.add(row.property_id as string));
        }
      }

      const mapped = ((data || []) as unknown as DbPropertyRow[]).map((row) => mapDbProperty(row, savedIds));
      const withVideoUrls = await attachSignedVideoUrls(mapped);
      setProperties(withVideoUrls);
      setSelectedProperty((current) => (current ? withVideoUrls.find((property) => property.id === current.id) || current : current));
      setDataSourceError("");
    } catch (error) {
      console.error("Could not load properties from Supabase", error);
      setDataSourceError("Could not load backend data from Supabase.");
      if (properties.length === 0) setProperties([]);
    }
  }

  function nav(next: Screen) {
    setPrevScreen(screen);
    setScreen(next);
  }

  function openSearch(purpose: Purpose | "ALL" = "ALL") {
    setInitialPurpose(purpose);
    nav("search");
  }

  function openDetail(property: Property) {
    setSelectedProperty(property);
    setPrevScreen(screen);
    setScreen("detail");
  }

  function goBack() {
    setScreen(prevScreen === "detail" ? "home" : prevScreen);
  }

  async function handleLike(id: string) {
    const wasLiked = properties.find((property) => property.id === id)?.liked || false;
    setProperties((items) => items.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item)));

    if (!supabase || !user) return;

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_properties")
          .upsert({ user_id: user.id, property_id: id }, { onConflict: "user_id,property_id" });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Could not sync saved property", error);
      setProperties((items) => items.map((item) => (item.id === id ? { ...item, liked: wasLiked } : item)));
    }
  }

  async function handleSubmitProperty(property: Property, videoFile: File | null) {
    if (!supabase || !isSupabaseConfigured) {
      setProperties((items) => [property, ...items]);
      return;
    }

    if (!videoFile) {
      throw new Error("A short walkthrough video file is required.");
    }

    const authUserId = await ensurePostingSession();
    if (!authUserId) {
      throw new Error("Please login again before posting.");
    }

    const propertyId = crypto.randomUUID();
    const mediaId = crypto.randomUUID();
    const fileSha256 = await getFileSha256(videoFile);
    const uploadStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storageFileName = [
      uploadStamp,
      `owner-${authUserId.slice(0, 8)}`,
      `property-${propertyId.slice(0, 8)}`,
      `media-${mediaId.slice(0, 8)}`,
      `sha-${fileSha256.slice(0, 12)}`,
      safeStorageName(videoFile.name),
    ].join("-");
    const storagePath = `pending/${authUserId}/${propertyId}/${mediaId}/${storageFileName}`;

    const { error: propertyError } = await supabase.from("properties").insert({
      id: propertyId,
      owner_id: authUserId,
      title: property.title,
      purpose: property.purpose,
      listing_type: property.listingType,
      property_type: property.type,
      price: property.price,
      city: property.city,
      locality: property.locality,
      bhk: property.bhk,
      area: property.area,
      area_unit: property.areaUnit,
      furnishing: property.furnishing,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking: property.parking,
      possession: property.possession,
      rera: property.rera || null,
      security_deposit: property.securityDeposit || null,
      maintenance_charges: property.maintenanceCharges || null,
      maintenance_included: property.maintenanceIncluded || null,
      available_from: property.availableFrom || null,
      lease_period_months: property.leasePeriodMonths || null,
      preferred_tenants: property.preferredTenants || null,
      price_negotiable: property.priceNegotiable || null,
      booking_amount: property.bookingAmount || null,
      loan_available: property.loanAvailable || null,
      property_age: property.propertyAge || null,
      ownership_type: property.ownershipType || null,
      pg_monthly_rent_per_bed: property.pgMonthlyRentPerBed || null,
      pg_sharing_type: property.pgSharingType || null,
      pg_food_included: property.pgFoodIncluded || null,
      gender_preference: property.genderPreference || null,
      commercial_pricing_type: property.commercialPricingType || null,
      commercial_usage: property.commercialUsage || null,
      commercial_carpet_area: property.commercialCarpetArea || null,
      commercial_built_up_area: property.commercialBuiltUpArea || null,
      plot_area: property.plotArea || null,
      plot_area_unit: property.plotAreaUnit || null,
      boundary_wall: property.boundaryWall || null,
      corner_plot: property.cornerPlot || null,
      approved_by: property.approvedBy || null,
      project_price_min: property.projectPriceMin || null,
      project_price_max: property.projectPriceMax || null,
      project_possession_date: property.projectPossessionDate || null,
      project_tower_count: property.projectTowerCount || null,
      project_configurations: property.projectConfigurations || null,
      description: property.description,
      image_url: property.image,
      seller_type: property.ownerType,
      status: "DRAFT",
      no_brokerage: property.noBrokerage,
      featured: false,
      views: 0,
      leads: 0,
      price_trend: "Pending",
    });
    if (propertyError) throw propertyError;

    const { error: consentError } = await supabase.from("property_consents").insert({
      property_id: propertyId,
      user_id: authUserId,
      seller_type: property.ownerType,
    });
    if (consentError) throw consentError;

    const { error: uploadError } = await supabase.storage
      .from("property-videos")
      .upload(storagePath, videoFile, {
        contentType: videoFile.type || "video/mp4",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { error: mediaError } = await supabase.from("property_media").insert({
      id: mediaId,
      property_id: propertyId,
      created_by: authUserId,
      media_type: "VIDEO",
      storage_path: storagePath,
      stored_filename: storageFileName,
      original_filename: videoFile.name,
      mime_type: videoFile.type || "video/mp4",
      file_size_bytes: videoFile.size,
      upload_status: "UPLOADED",
      is_primary: true,
      file_sha256: fileSha256,
    });
    if (mediaError) throw mediaError;

    const { error: amenitiesError } = await supabase.from("property_amenities").insert(
      property.amenities.map((amenity) => ({
        property_id: propertyId,
        amenity,
      }))
    );
    if (amenitiesError) throw amenitiesError;

    const { error: nearbyError } = await supabase.from("property_nearby").insert(
      property.nearby.map((name, index) => ({
        property_id: propertyId,
        name,
        sort_order: index,
      }))
    );
    if (nearbyError) throw nearbyError;

    const { error: reviewError } = await supabase
      .from("properties")
      .update({
        status: "PENDING_REVIEW",
        review_note: "Short video received. Waiting for manual admin approval.",
      })
      .eq("id", propertyId);
    if (reviewError) throw reviewError;

    await refreshProperties(user);
  }

  async function handleReviewDecision(id: string, status: "APPROVED" | "REJECTED") {
    if (supabase && user) {
      const { error } = await supabase
        .from("properties")
        .update({
          status,
          review_note: status === "APPROVED" ? "Approved manually by admin." : "Rejected manually by admin. Seller must update and resubmit.",
        })
        .eq("id", id);

      if (error) {
        setDataSourceError(error.message);
        return;
      }

      await refreshProperties(user);
      return;
    }

    setProperties((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              verified: status === "APPROVED" ? true : item.verified,
              reviewNote: status === "APPROVED" ? "Approved manually by admin." : "Rejected manually by admin. Seller must update and resubmit.",
            }
          : item
      )
    );
  }

  async function ensurePostingSession() {
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error("Could not restore Supabase session", error);
      setUser(null);
      throw new Error("Please login again before posting.");
    }

    const profile = await loadProfile(data.user.id);
    if (!user || user.id !== data.user.id) setUser(profileToUser(data.user.id, profile));
    return data.user.id;
  }

  async function handleLogin(credentials: LoginCredentials) {
    if (!supabase) {
      throw new Error("Backend is not configured.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user) {
      console.error("Could not sign in to Supabase", error);
      setUser(null);
      throw new Error(error?.message || "Could not login. Please try again.");
    }

    const profile = await loadProfile(data.user.id);
    const appUser = profileToUser(data.user.id, profile, data.user.phone || "");
    setUser(appUser);
    setDataSourceError("");
    await refreshProperties(appUser);
    nav("home");
  }

  async function handleSignup(input: SignupInput) {
    if (!supabase) {
      throw new Error("Backend is not configured.");
    }

    const { data: accountData, error: accountError } = await supabase.functions.invoke<{
      userId?: string;
      error?: string;
    }>("create_app_account", {
      body: input,
    });

    if (accountError || accountData?.error) {
      console.error("Could not create Supabase account", accountError || accountData?.error);
      const message = accountData?.error || (await getFunctionErrorMessage(accountError, accountError?.message || "Could not create account."));
      throw new Error(message);
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (signInError || !signInData.user) {
      console.error("Account created but login failed", signInError);
      throw new Error(signInError?.message || "Account created. Please login with your email and password.");
    }

    const profile = await loadProfile(signInData.user.id);
    const appUser = profileToUser(signInData.user.id, profile, input.phone);
    setUser(appUser);
    setDataSourceError("");
    await refreshProperties(appUser);
    nav("home");
  }

  function handleLogout() {
    if (supabase) void supabase.auth.signOut();
    setUser(null);
    void refreshProperties(null);
    nav("home");
  }

  const showNav = !["login", "signup", "detail", "post", "admin", "explore", "match"].includes(screen);
  const publicProperties = properties.filter((property) => property.status === "APPROVED");

  return (
    <div
      className="size-full overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif", position: "relative" }}
    >
      <style>{`
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .content-shell { width: 100%; max-width: 1320px; margin-inline: auto; }
        .soft-panel { border: 1px solid var(--border); background: color-mix(in srgb, var(--card) 92%, var(--secondary)); box-shadow: 0 12px 36px rgba(15, 35, 34, 0.06); }
        .interactive-card { transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease; }
        .interactive-card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--primary) 30%, var(--border)); box-shadow: 0 16px 42px rgba(15, 35, 34, 0.10); }
        .label-sm { display: block; margin-bottom: 6px; color: var(--muted-foreground); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .input-field { width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--card); padding: 0.8rem 0.9rem; color: var(--foreground); font-size: 0.875rem; outline: none; }
        .input-field:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent); border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); }
        .filter-select { flex-shrink: 0; border-radius: 999px; border: 1px solid var(--border); background: var(--card); padding: 0.5rem 0.75rem; color: var(--foreground); font-size: 0.75rem; font-weight: 650; outline: none; }
      `}</style>

      <div className={`h-full overflow-hidden ${showNav ? "md:pl-24" : ""}`}>
        {dataSourceError && (
          <div className="absolute left-4 right-4 top-3 z-50 mx-auto max-w-xl rounded-lg border border-amber-500/20 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-lg">
            {dataSourceError}
          </div>
        )}
        {screen === "home" && (
          <HomeScreen
            properties={publicProperties}
            onDetail={openDetail}
            onLike={handleLike}
            onSearch={openSearch}
            onMatch={() => nav("match")}
            onExplore={() => nav("explore")}
            onPost={() => nav(user ? "post" : "login")}
          />
        )}
        {screen === "search" && <SearchScreen properties={publicProperties} initialPurpose={initialPurpose} onDetail={openDetail} onLike={handleLike} />}
        {screen === "match" && <HomeMatchScreen properties={publicProperties} onBack={goBack} onDetail={openDetail} />}
        {screen === "saved" && <SavedScreen properties={publicProperties} onDetail={openDetail} onLike={handleLike} />}
        {screen === "profile" && <ProfileScreen user={user} properties={properties} onLogout={handleLogout} onLogin={() => nav("login")} onAdmin={() => nav("admin")} />}
        {screen === "detail" && selectedProperty && <PropertyDetail property={selectedProperty} onBack={goBack} onLike={handleLike} />}
        {screen === "post" && user && <PostPropertyScreen user={user} onBack={goBack} onSubmit={handleSubmitProperty} />}
        {screen === "explore" && <VideoExploreScreen properties={publicProperties} onDetail={openDetail} onLike={handleLike} onBack={goBack} />}
        {screen === "login" && <LoginScreen onLogin={handleLogin} onSignup={() => nav("signup")} onBack={goBack} />}
        {screen === "signup" && <SignupScreen onSignup={handleSignup} onLogin={() => nav("login")} onBack={goBack} />}
        {screen === "admin" && <AdminScreen properties={properties} onBack={goBack} onDecision={handleReviewDecision} />}
      </div>

      {showNav && <BottomNav screen={screen} onNav={(next) => nav(next === "post" && !user ? "login" : next)} isLoggedIn={!!user} />}
    </div>
  );
}
