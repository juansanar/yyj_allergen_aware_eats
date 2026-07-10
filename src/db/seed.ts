import { db } from "./index";
import {
  municipalities,
  allergens,
  restaurants,
  menuSections,
  menuItems,
  itemAllergens,
  restaurantTags,
} from "./schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Helper function to slugify text
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "_");
}

async function main() {
    console.log("Starting DB seed process...");

    // 1. Run Python pipeline first to collect the real data and analyze it
    console.log("Running Python data collection and analysis script...");
    try {
        execSync(".venv/bin/python scripts/collect_and_analyze.py", { stdio: "inherit" });
    } catch (error) {
        console.error("Python analysis pipeline script failed:", error);
        process.exit(1);
    }

    // 2. Read study results
    const resultsPath = path.join("data", "study_results.json");
    if (!fs.existsSync(resultsPath)) {
        console.error("study_results.json not found! Seeder aborted.");
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    const rawRestaurants = data.restaurants;

    // 3. Clear existing rows in the tables (optional but useful for fresh seeds)
    console.log("Cleaning existing database tables...");
    await db.delete(itemAllergens).execute();
    await db.delete(menuItems).execute();
    await db.delete(menuSections).execute();
    await db.delete(restaurantTags).execute();
    await db.delete(restaurants).execute();
    await db.delete(allergens).execute();
    await db.delete(municipalities).execute();

    // 4. Seed Allergens (EU 14)
    console.log("Seeding EU 14 Allergens...");
    const allergenSeeds = [
        {
            name: "Gluten",
            slug: "gluten",
            euNumber: 1,
            description: "Cereals containing gluten (wheat, rye, barley, oats, spelt, kamut).",
            commonSources: JSON.stringify(["bread", "pasta", "flour", "sauces", "beer", "pastries"])
        },
        {
            name: "Crustaceans",
            slug: "crustaceans",
            euNumber: 2,
            description: "Crustaceans and products thereof (crab, lobster, prawns, shrimp).",
            commonSources: JSON.stringify(["crab", "lobster", "prawns", "shrimp", "shrimp paste"])
        },
        {
            name: "Eggs",
            slug: "eggs",
            euNumber: 3,
            description: "Eggs and products thereof.",
            commonSources: JSON.stringify(["mayonnaise", "baked goods", "quiche", "dressings", "pasta"])
        },
        {
            name: "Fish",
            slug: "fish",
            euNumber: 4,
            description: "Fish and products thereof.",
            commonSources: JSON.stringify(["sauces", "stocks", "fish sauce", "dips", "salad dressing"])
        },
        {
            name: "Peanuts",
            slug: "peanuts",
            euNumber: 5,
            description: "Peanuts and products thereof.",
            commonSources: JSON.stringify(["peanut butter", "satay", "sauces", "peanut oil", "desserts"])
        },
        {
            name: "Soybeans",
            slug: "soybeans",
            euNumber: 6,
            description: "Soybeans and products thereof.",
            commonSources: JSON.stringify(["tofu", "soy sauce", "edamame", "soy milk", "lecithin"])
        },
        {
            name: "Milk",
            slug: "milk",
            euNumber: 7,
            description: "Milk and products thereof (including lactose).",
            commonSources: JSON.stringify(["butter", "cheese", "cream", "yogurt", "whey", "milk powder"])
        },
        {
            name: "Tree-nuts",
            slug: "tree-nuts",
            euNumber: 8,
            description: "Nuts (almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamias).",
            commonSources: JSON.stringify(["marzipan", "pesto", "desserts", "nut oils", "almond milk"])
        },
        {
            name: "Celery",
            slug: "celery",
            euNumber: 9,
            description: "Celery and products thereof.",
            commonSources: JSON.stringify(["soups", "stocks", "salads", "celery salt"])
        },
        {
            name: "Mustard",
            slug: "mustard",
            euNumber: 10,
            description: "Mustard and products thereof.",
            commonSources: JSON.stringify(["salad dressings", "sauces", "marinades", "mustard seeds"])
        },
        {
            name: "Sesame",
            slug: "sesame",
            euNumber: 11,
            description: "Sesame seeds and products thereof.",
            commonSources: JSON.stringify(["tahini", "hummus", "sesame oil", "bread", "halvah"])
        },
        {
            name: "Sulphites",
            slug: "sulphites",
            euNumber: 12,
            description: "Sulphur dioxide and sulphites at concentrations > 10 mg/kg or 10 mg/litre.",
            commonSources: JSON.stringify(["preservatives", "wine", "dried fruit", "cider", "vinegar"])
        },
        {
            name: "Lupin",
            slug: "lupin",
            euNumber: 13,
            description: "Lupin and products thereof.",
            commonSources: JSON.stringify(["flour", "pastries", "bread", "pasta"])
        },
        {
            name: "Molluscs",
            slug: "molluscs",
            euNumber: 14,
            description: "Molluscs and products thereof (clams, mussels, oysters, squid, octopus).",
            commonSources: JSON.stringify(["clams", "mussels", "oysters", "squid", "octopus", "oyster sauce"])
        }
    ];

    const allergenMap = new Map<string, number>();
    for (const al of allergenSeeds) {
        const result = await db.insert(allergens).values(al).returning({ id: allergens.id });
        allergenMap.set(al.slug, result[0].id);
    }
    console.log(`Inserted ${allergenMap.size} allergens.`);

    // 5. Seed Municipalities (Neighborhoods from Victoria open data)
    console.log("Extracting and seeding municipalities...");
    const uniqueNeighborhoods = Array.from(
        new Set<string>(rawRestaurants.map((r: any) => r.neighborhood || "DOWNTOWN"))
    );

    const municipalityMap = new Map<string, number>();
    for (const nb of uniqueNeighborhoods) {
        const slug = slugify(nb);
        const result = await db.insert(municipalities).values({
            name: nb.charAt(0).toUpperCase() + nb.slice(1).toLowerCase(),
            slug,
            region: "municipality"
        }).returning({ id: municipalities.id });
        municipalityMap.set(nb, result[0].id);
    }
    console.log(`Inserted ${municipalityMap.size} municipalities/neighborhoods.`);

    // 6. Seed Restaurants, Menus, Items, and item-level Allergens
    console.log("Seeding restaurants and menus...");
    let restaurantCount = 0;
    let itemAllergenCount = 0;

    for (const r of rawRestaurants) {
        const mId = municipalityMap.get(r.neighborhood) || municipalityMap.get("DOWNTOWN")!;
        
        // Insert restaurant
        const restResult = await db.insert(restaurants).values({
            name: r.name,
            slug: r.slug,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
            municipalityId: mId,
            cuisineType: r.cuisine,
            costIndicator: r.cost_indicator,
            tripadvisorRating: r.tripadvisor_rating,
            numLocations: r.num_locations,
            websiteUrl: r.website_url,
            menuSourceUrl: r.menu_text_file,
            dataConfidence: "confirmed",
            lastVerified: new Date().toISOString()
        }).returning({ id: restaurants.id });
        
        const restaurantId = restResult[0].id;
        restaurantCount++;

        // Add restaurant tags based on allergen options
        if (r.has_allergen_symbols) {
            await db.insert(restaurantTags).values({ restaurantId, tag: "allergen-symbols" });
        }
        if (r.has_allergen_statement) {
            await db.insert(restaurantTags).values({ restaurantId, tag: "allergen-statement" });
        }
        if (r.has_separate_menu) {
            await db.insert(restaurantTags).values({ restaurantId, tag: "separate-allergen-menu" });
        }
        if (r.has_separate_chart) {
            await db.insert(restaurantTags).values({ restaurantId, tag: "allergen-chart" });
        }
        if (r.cuisine === "Vegan/Vegetarian") {
            await db.insert(restaurantTags).values({ restaurantId, tag: "vegan-friendly" });
        }

        // Insert Menu sections and items
        let sectionOrder = 0;
        for (const sec of r.menu_sections) {
            const secResult = await db.insert(menuSections).values({
                restaurantId,
                name: sec.name,
                sortOrder: sectionOrder++
            }).returning({ id: menuSections.id });
            
            const sectionId = secResult[0].id;

            for (const item of sec.items) {
                // Insert Menu item
                const itemResult = await db.insert(menuItems).values({
                    sectionId,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    isVegetarian: item.is_vegetarian,
                    isVegan: item.is_vegan,
                    isGlutenFreeMarked: item.is_gf_marked
                }).returning({ id: menuItems.id });
                
                const menuItemId = itemResult[0].id;

                // Insert Item Allergens
                for (const alSlug of item.allergens) {
                    const allergenId = allergenMap.get(alSlug);
                    if (allergenId) {
                        await db.insert(itemAllergens).values({
                            menuItemId,
                            allergenId,
                            confidence: "confirmed",
                            sourceNote: `Scraped from menu description: "${item.description}"`
                        });
                        itemAllergenCount++;
                    }
                }
            }
        }
    }

    console.log(`Successfully seeded database with:`);
    console.log(`- ${restaurantCount} restaurants`);
    console.log(`- ${itemAllergenCount} item allergen links`);
    console.log("DB Seeding completed successfully!");
}

main().catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
});
