export type SiteType = "food-bank" | "harvest";

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  hours: string;
  description: string;
  resources: string[];
  foods?: Food[];
  isVerified?: boolean;
}

export type FoodCategory = "produce" | "csa" | "prepared" | "pantry" | "surprise-bag";

export interface Food {
  id: string;
  name: string;
  unit: string;
  priceTokens: number;
  category: FoodCategory;
  description: string;
  inSeason: boolean;
  quantity?: number;
  harvestDate?: string; // ISO date string
  tags?: ("organic" | "pesticide-free" | "heirloom" | "certified")[];
}

// Auth & tokens

export type UserTier = "free" | "premium";

export interface User {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hex, mock — flagged in UI
  displayName: string;
  tier: UserTier;
  tierExpiresAt: number | null; // epoch ms
  tokens: number;
  lastDailyBonus: string | null; // ISO date string, day-precision
  createdAt: number;
  unreadOffers: number;
  hasOpenedFirstThread: boolean;
}

export type SessionStatus = "loading" | "anon" | "authed-free" | "authed-premium";

// Barter

export type OfferKind = "offer" | "counter" | "accept" | "decline" | "message";
export type OfferFrom = "buyer" | "vendor";

export interface OfferMessage {
  id: string;
  from: OfferFrom;
  kind: OfferKind;
  text?: string;
  amountTokens?: number;
  ts: number;
}

export interface OfferThread {
  id: string;
  userId: string;
  siteId: string;
  foodId: string;
  status: "open" | "accepted" | "declined";
  messages: OfferMessage[];
  updatedAt: number;
  vendorTokenLedger: number;
}
