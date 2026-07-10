import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Municipalities ──────────────────────────────────────────────────────────
export const municipalities = sqliteTable(
  "municipalities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    region: text("region").notNull(), // "municipality" | "electoral_area" | "island_trust"
  },
  (table) => [index("municipalities_slug_idx").on(table.slug)]
);

export const municipalitiesRelations = relations(municipalities, ({ many }) => ({
  restaurants: many(restaurants),
}));

// ─── Allergens (EU 14) ──────────────────────────────────────────────────────
export const allergens = sqliteTable(
  "allergens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    commonSources: text("common_sources").notNull(), // JSON-encoded string[]
    euNumber: integer("eu_number").notNull().unique(),
  },
  (table) => [index("allergens_slug_idx").on(table.slug)]
);

export const allergensRelations = relations(allergens, ({ many }) => ({
  itemAllergens: many(itemAllergens),
}));

// ─── Restaurants ─────────────────────────────────────────────────────────────
export const restaurants = sqliteTable(
  "restaurants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address").notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
    municipalityId: integer("municipality_id")
      .notNull()
      .references(() => municipalities.id),
    cuisineType: text("cuisine_type").notNull(),
    costIndicator: integer("cost_indicator"),
    tripadvisorRating: real("tripadvisor_rating"),
    numLocations: integer("num_locations"),
    phone: text("phone"),
    websiteUrl: text("website_url"),
    menuSourceUrl: text("menu_source_url"),
    imageUrl: text("image_url"),
    dataConfidence: text("data_confidence").notNull().default("ai_inferred"), // "confirmed" | "ai_inferred" | "community"
    lastVerified: text("last_verified"), // ISO date string
    createdAt: text("created_at")
      .notNull()
      .default(new Date().toISOString()),
  },
  (table) => [
    index("restaurants_slug_idx").on(table.slug),
    index("restaurants_municipality_idx").on(table.municipalityId),
    index("restaurants_cuisine_idx").on(table.cuisineType),
  ]
);

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [restaurants.municipalityId],
    references: [municipalities.id],
  }),
  menuSections: many(menuSections),
  tags: many(restaurantTags),
}));

// ─── Menu Sections ───────────────────────────────────────────────────────────
export const menuSections = sqliteTable(
  "menu_sections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("menu_sections_restaurant_idx").on(table.restaurantId)]
);

export const menuSectionsRelations = relations(menuSections, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuSections.restaurantId],
    references: [restaurants.id],
  }),
  items: many(menuItems),
}));

// ─── Menu Items ──────────────────────────────────────────────────────────────
export const menuItems = sqliteTable(
  "menu_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sectionId: integer("section_id")
      .notNull()
      .references(() => menuSections.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: real("price"),
    isVegetarian: integer("is_vegetarian", { mode: "boolean" })
      .notNull()
      .default(false),
    isVegan: integer("is_vegan", { mode: "boolean" })
      .notNull()
      .default(false),
    isGlutenFreeMarked: integer("is_gluten_free_marked", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => [index("menu_items_section_idx").on(table.sectionId)]
);

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  section: one(menuSections, {
    fields: [menuItems.sectionId],
    references: [menuSections.id],
  }),
  allergens: many(itemAllergens),
}));

// ─── Item Allergens (join table with confidence) ─────────────────────────────
export const itemAllergens = sqliteTable(
  "item_allergens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    menuItemId: integer("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    allergenId: integer("allergen_id")
      .notNull()
      .references(() => allergens.id),
    confidence: text("confidence").notNull(), // "confirmed" | "likely" | "possible"
    sourceNote: text("source_note"), // e.g. "contains wheat flour in batter"
  },
  (table) => [
    index("item_allergens_item_idx").on(table.menuItemId),
    index("item_allergens_allergen_idx").on(table.allergenId),
  ]
);

export const itemAllergensRelations = relations(itemAllergens, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [itemAllergens.menuItemId],
    references: [menuItems.id],
  }),
  allergen: one(allergens, {
    fields: [itemAllergens.allergenId],
    references: [allergens.id],
  }),
}));

// ─── Restaurant Tags ─────────────────────────────────────────────────────────
export const restaurantTags = sqliteTable(
  "restaurant_tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(), // e.g. "farm-to-table", "waterfront", "brewery"
  },
  (table) => [
    index("restaurant_tags_restaurant_idx").on(table.restaurantId),
    index("restaurant_tags_tag_idx").on(table.tag),
  ]
);

export const restaurantTagsRelations = relations(restaurantTags, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantTags.restaurantId],
    references: [restaurants.id],
  }),
}));
