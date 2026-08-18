import { ApiError, respond } from "./client";
import { nextId, store } from "./store";
import type { TeamMember, TeamRole } from "@/types";

export interface StoreProfile {
  name: string;
  legalName: string;
  supportEmail: string;
  phone: string;
  currency: string;
  timezone: string;
  address: string;
  description: string;
}

export interface NotificationPrefs {
  newOrder: boolean;
  lowStock: boolean;
  refundRequest: boolean;
  weeklyDigest: boolean;
  productReview: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string;
  rate: number;
  freeOver: number | null;
  enabled: boolean;
}

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  fee: string;
}

const settings = {
  profile: {
    name: "Selim Commerce",
    legalName: "Selim Commerce GmbH",
    supportEmail: "support@selimcommerce.store",
    phone: "+49 30 1234 5678",
    currency: "EUR",
    timezone: "Europe/Berlin",
    address: "Chausseestraße 112, 10115 Berlin, Germany",
    description:
      "Independent European retailer for everyday electronics, apparel and home goods.",
  } satisfies StoreProfile,

  notifications: {
    newOrder: true,
    lowStock: true,
    refundRequest: true,
    weeklyDigest: false,
    productReview: false,
  } satisfies NotificationPrefs,

  zones: [
    { id: "zone_1", name: "Germany", countries: "DE", rate: 4.9, freeOver: 60, enabled: true },
    { id: "zone_2", name: "EU Zone 1", countries: "NL, BE, AT, FR", rate: 6.9, freeOver: 90, enabled: true },
    { id: "zone_3", name: "EU Zone 2", countries: "ES, IT, PT, PL, SE, IE", rate: 9.9, freeOver: 120, enabled: true },
    { id: "zone_4", name: "United Kingdom", countries: "GB", rate: 12.5, freeOver: null, enabled: false },
  ] satisfies ShippingZone[],

  providers: [
    { id: "pay_card", name: "Credit & debit cards", description: "Visa, Mastercard, Amex via Stripe", enabled: true, fee: "1.4% + €0.25" },
    { id: "pay_paypal", name: "PayPal", description: "Express checkout and Pay in 3", enabled: true, fee: "2.49% + €0.35" },
    { id: "pay_apple", name: "Apple Pay", description: "One-tap checkout on Safari and iOS", enabled: true, fee: "1.4% + €0.25" },
    { id: "pay_klarna", name: "Klarna", description: "Buy now, pay later in 30 days", enabled: true, fee: "3.29% + €0.30" },
    { id: "pay_transfer", name: "Bank transfer", description: "SEPA transfer, manual reconciliation", enabled: false, fee: "€0.00" },
  ] satisfies PaymentProvider[],
};

export async function getSettings() {
  return respond(() => structuredClone(settings));
}

export async function updateProfile(input: StoreProfile) {
  return respond(() => {
    Object.assign(settings.profile, input);
    return structuredClone(settings.profile);
  });
}

export async function updateNotifications(input: NotificationPrefs) {
  return respond(() => {
    Object.assign(settings.notifications, input);
    return structuredClone(settings.notifications);
  }, { delay: 300 });
}

export async function toggleProvider(id: string, enabled: boolean) {
  return respond(() => {
    const provider = settings.providers.find((p) => p.id === id);
    if (!provider) throw new ApiError("Payment provider not found", 404);
    provider.enabled = enabled;
    return structuredClone(provider);
  }, { delay: 300 });
}

export async function toggleZone(id: string, enabled: boolean) {
  return respond(() => {
    const zone = settings.zones.find((z) => z.id === id);
    if (!zone) throw new ApiError("Shipping zone not found", 404);
    zone.enabled = enabled;
    return structuredClone(zone);
  }, { delay: 300 });
}

/* ---------------------------------- Team --------------------------------- */

export async function getTeam(): Promise<TeamMember[]> {
  return respond(() => store.team.map((member) => ({ ...member })));
}

export async function inviteMember(input: { name: string; email: string; role: TeamRole }) {
  return respond(() => {
    const member: TeamMember = {
      id: nextId("usr"),
      name: input.name,
      email: input.email,
      role: input.role,
      status: "invited",
      avatarColor: "#2563EB",
      lastActive: new Date().toISOString(),
    };
    store.team = [...store.team, member];
    return member;
  });
}

export async function updateMemberRole(id: string, role: TeamRole) {
  return respond(() => {
    const member = store.team.find((m) => m.id === id);
    if (!member) throw new ApiError("Team member not found", 404);
    member.role = role;
    return { ...member };
  }, { delay: 300 });
}

export async function removeMember(id: string) {
  return respond(() => {
    store.team = store.team.filter((member) => member.id !== id);
    return { removed: id };
  });
}
