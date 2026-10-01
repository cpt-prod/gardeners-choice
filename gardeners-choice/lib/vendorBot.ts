import type { Food, OfferMessage, OfferThread, Site } from "./types";

const ACCEPT_BAND = 0.2;        // ±20% of list price
const ABUSE_FLOOR = 0.5;        // <50% of list = decline
const REPLY_DELAY_MIN_MS = 800;
const REPLY_DELAY_MAX_MS = 1500;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jitter(): number {
  return rand(REPLY_DELAY_MIN_MS, REPLY_DELAY_MAX_MS);
}

function msg(
  from: "buyer" | "vendor",
  kind: OfferMessage["kind"],
  opts: Partial<OfferMessage> = {},
): OfferMessage {
  return {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    from,
    kind,
    ts: Date.now(),
    ...opts,
  };
}

// Returns the vendor reply for the latest buyer offer/counter, or null if no reply.
export function computeVendorReply(args: {
  site: Site;
  food: Food;
  thread: OfferThread;
  buyerMessage: OfferMessage;
}): OfferMessage {
  const { food, thread, buyerMessage } = args;
  const list = food.priceTokens;
  const amount = buyerMessage.amountTokens ?? list;

  // First buyer offer
  if (thread.messages.length <= 1) {
    if (amount <= 0) {
      return msg("vendor", "decline", {
        text: `We can't go below 1 token for ${food.name}.`,
      });
    }
    if (amount < list * ABUSE_FLOOR) {
      return msg("vendor", "decline", {
        text: `That's too far below our list price of ${list} tokens. We can do ${Math.round(
          list * (1 - ACCEPT_BAND),
        )} tokens.`,
      });
    }
    if (amount >= list * (1 - ACCEPT_BAND) && amount <= list * (1 + ACCEPT_BAND)) {
      return msg("vendor", "accept", {
        amountTokens: amount,
        text: `Sounds good — we'll take ${amount} tokens. See you at pickup.`,
      });
    }
    // Counter at the band edge closer to the buyer
    const counter = amount < list ? Math.ceil(list * (1 - ACCEPT_BAND)) : Math.floor(list * (1 + ACCEPT_BAND));
    return msg("vendor", "counter", {
      amountTokens: counter,
      text: `Best we can do is ${counter} tokens.`,
    });
  }

  // Subsequent counters
  if (buyerMessage.kind === "counter") {
    if (amount >= list * (1 - ACCEPT_BAND) && amount <= list * (1 + ACCEPT_BAND)) {
      return msg("vendor", "accept", {
        amountTokens: amount,
        text: `Works for us. ${amount} tokens, see you there.`,
      });
    }
    if (amount < list * ABUSE_FLOOR) {
      return msg("vendor", "decline", {
        text: `Sorry, ${amount} is below our cost. We have to pass.`,
      });
    }
    // Halfway between buyer's last and our last
    const lastVendor = [...thread.messages].reverse().find((m) => m.from === "vendor" && m.amountTokens != null);
    const lastVendorAmount = lastVendor?.amountTokens ?? list;
    const halfway = Math.round((amount + lastVendorAmount) / 2);
    const clamped = Math.max(Math.ceil(list * (1 - ACCEPT_BAND)), Math.min(Math.floor(list * (1 + ACCEPT_BAND)), halfway));
    return msg("vendor", "counter", {
      amountTokens: clamped,
      text: `Let's meet in the middle — ${clamped} tokens.`,
    });
  }

  return msg("vendor", "message", { text: "Got it. Let me check and get back to you." });
}

// Schedule a vendor reply that persists regardless of navigation.
export function scheduleVendorReply(args: {
  site: Site;
  food: Food;
  thread: OfferThread;
  buyerMessage: OfferMessage;
  onResolve: (reply: OfferMessage) => void;
}): void {
  const delay = jitter();
  setTimeout(() => {
    const reply = computeVendorReply(args);
    args.onResolve(reply);
  }, delay);
}
