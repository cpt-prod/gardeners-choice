// Curated gardening tips. One is surfaced per day via a deterministic
// day-of-year rotation, so every visitor sees the same tip on a given date
// and it changes once daily without any backend.

export const GARDENING_TIPS: { tip: string; category: string }[] = [
  { category: "Watering", tip: "Water deeply but less often — it trains roots to grow down and makes plants far more drought-tolerant." },
  { category: "Watering", tip: "Water in the early morning. Leaves dry before evening, which cuts down on fungal disease." },
  { category: "Soil", tip: "Mulch with 2–3 inches of straw or wood chips to lock in moisture and smother weeds." },
  { category: "Soil", tip: "Healthy soil is alive — add compost once a season and let the worms do the tilling for you." },
  { category: "Compost", tip: "Balance your compost: roughly two parts 'brown' (leaves, cardboard) to one part 'green' (scraps, grass)." },
  { category: "Compost", tip: "Keep a sealed scrap jar on the counter. A week of peels and coffee grounds feeds your whole garden." },
  { category: "Harvest", tip: "Pick leafy greens from the outside in — the center keeps producing for weeks longer." },
  { category: "Harvest", tip: "Harvest herbs just before they flower, when their oils and flavor peak." },
  { category: "Harvest", tip: "Got surplus? Share it. One zucchini plant can feed a whole block — post it on the marketplace." },
  { category: "Pests", tip: "Plant marigolds near tomatoes and beans; their scent deters many common garden pests naturally." },
  { category: "Pests", tip: "A sharp spray of water knocks aphids off leaves — often no spray or soap needed at all." },
  { category: "Pests", tip: "Invite ladybugs and lacewings with dill, fennel, and yarrow. They eat the pests for you." },
  { category: "Planting", tip: "Sow seeds about twice as deep as they are wide. When in doubt, plant shallower." },
  { category: "Planting", tip: "Stagger plantings two weeks apart for a steady harvest instead of one overwhelming glut." },
  { category: "Planting", tip: "Grow what you actually eat. A thriving row of nothing you'll cook is just pretty weeds." },
  { category: "Companions", tip: "The 'Three Sisters' — corn, beans, and squash — support each other and thrive planted together." },
  { category: "Companions", tip: "Basil planted beside tomatoes is said to improve their flavor and repel hornworms." },
  { category: "Seasons", tip: "In cool weather, favor leafy greens, peas, and roots; save tomatoes and peppers for the warm months." },
  { category: "Seasons", tip: "Plant a cover crop like clover in empty beds over winter to feed the soil for spring." },
  { category: "Sunlight", tip: "Most vegetables want 6+ hours of direct sun. Leafy greens tolerate more shade than fruiting crops." },
  { category: "Containers", tip: "No yard? Tomatoes, peppers, herbs, and greens all thrive in a 5-gallon bucket with drainage holes." },
  { category: "Containers", tip: "Container soil dries fast — check it daily in summer by sticking a finger an inch down." },
  { category: "Saving", tip: "Let one lettuce or bean plant go to seed; collect and dry the seeds for a free crop next year." },
  { category: "Saving", tip: "Regrow green onions, celery, and romaine from their cut bases in a glass of water on the sill." },
  { category: "Weeds", tip: "Pull weeds after rain when the soil is soft — the whole root slides out intact." },
  { category: "Weeds", tip: "A weed is just a plant in the wrong place; many, like dandelion and purslane, are edible and nutritious." },
  { category: "Community", tip: "Check the map for a nearby harvest site — many let you pick free produce in exchange for a little help." },
  { category: "Community", tip: "Food banks love fresh garden produce. A grocery bag of your extras is a real meal for a neighbor." },
  { category: "Pollinators", tip: "Leave a few flowers to bloom among your vegetables — bees that visit them pollinate your crops too." },
  { category: "Patience", tip: "Nothing in a garden happens fast. Tend it a little each day and let the season do the rest." },
];

/** Deterministic tip for a given date (defaults to today). Same date → same tip. */
export function getDailyTip(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  const index = dayOfYear % GARDENING_TIPS.length;
  return GARDENING_TIPS[index];
}
