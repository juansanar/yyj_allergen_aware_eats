import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  restaurants,
  municipalities,
  restaurantTags,
  menuSections,
  menuItems,
  itemAllergens,
  allergens,
} from "@/db/schema";
import { eq, and, like, or, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // ─── Fetch Single Restaurant Detail ───
    if (slug) {
      const rest = await db.query.restaurants.findFirst({
        where: eq(restaurants.slug, slug),
        with: {
          municipality: true,
          tags: true,
          menuSections: {
            orderBy: (sections, { asc }) => [asc(sections.sortOrder)],
            with: {
              items: {
                with: {
                  allergens: {
                    with: {
                      allergen: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!rest) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
      }

      return NextResponse.json(rest);
    }

    // ─── Fetch List of Restaurants (with Filters) ───
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const neighborhood = searchParams.get("neighborhood") || "";
    const cost = searchParams.get("cost") || "";
    
    // Allergen feature filters
    const filterSymbols = searchParams.get("symbols") === "true";
    const filterStatement = searchParams.get("statement") === "true";
    const filterMenu = searchParams.get("separateMenu") === "true";
    const filterChart = searchParams.get("chart") === "true";

    // Build query
    const conditions: any[] = [];

    if (search) {
      conditions.push(like(restaurants.name, `%${search}%`));
    }
    if (cuisine) {
      conditions.push(eq(restaurants.cuisineType, cuisine));
    }
    if (neighborhood) {
      conditions.push(eq(municipalities.slug, neighborhood));
    }
    if (cost) {
      conditions.push(eq(restaurants.costIndicator, parseInt(cost))); 
    }

    // Combine conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch restaurants and join with municipality
    // We can also fetch the tags to filter client-side or build a subquery.
    // For simplicity, we query restaurants and join municipality and tags.
    const allRests = await db.query.restaurants.findMany({
      where: whereClause,
      with: {
        municipality: true,
        tags: true
      }
    });

    // Post-filter based on tag presence (if requested)
    let filteredRests = allRests;

    if (filterSymbols) {
      filteredRests = filteredRests.filter(r => r.tags.some(t => t.tag === "allergen-symbols"));
    }
    if (filterStatement) {
      filteredRests = filteredRests.filter(r => r.tags.some(t => t.tag === "allergen-statement"));
    }
    if (filterMenu) {
      filteredRests = filteredRests.filter(r => r.tags.some(t => t.tag === "separate-allergen-menu"));
    }
    if (filterChart) {
      filteredRests = filteredRests.filter(r => r.tags.some(t => t.tag === "allergen-chart"));
    }

    // Return mapped results
    const results = filteredRests.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      cuisineType: r.cuisineType,
      costIndicator: r.costIndicator,
      tripadvisorRating: r.tripadvisorRating,
      numLocations: r.numLocations,
      websiteUrl: r.websiteUrl,
      menuSourceUrl: r.menuSourceUrl,
      neighborhood: r.municipality.name,
      neighborhoodSlug: r.municipality.slug,
      tags: r.tags.map(t => t.tag)
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to query restaurants", details: error.message },
      { status: 500 }
    );
  }
}
