"use client";

import { useEffect, useState } from "react";
import { AllergenIcon } from "./AllergenIcon";

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  cuisineType: string;
  costIndicator: number | null;
  tripadvisorRating: number | null;
  numLocations: number | null;
  websiteUrl: string | null;
  menuSourceUrl: string | null;
  neighborhood: string;
  neighborhoodSlug: string;
  tags: string[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFreeMarked: boolean;
  allergens: Array<{
    id: number;
    allergen: {
      id: number;
      name: string;
      slug: string;
      description: string;
    };
  }>;
}

interface MenuSection {
  id: number;
  name: string;
  items: MenuItem[];
}

interface ExpandedRestaurant extends Restaurant {
  menuSections: MenuSection[];
}

export function RestaurantExplorer() {
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [costFilter, setCostFilter] = useState("");
  
  // Tag toggles
  const [hasSymbols, setHasSymbols] = useState(false);
  const [hasStatement, setHasStatement] = useState(false);
  const [hasMenu, setHasMenu] = useState(false);
  const [hasChart, setHasChart] = useState(false);

  // Detail view state
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [expandedRest, setExpandedRest] = useState<ExpandedRestaurant | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Available neighborhoods & cuisines extracted from lists
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Array<{ name: string; slug: string }>>([]);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const stats = await res.json();
          // Extract unique cuisines and neighborhoods from statistics
          setCuisines(Object.keys(stats.cuisine_distribution));
          
          const uniqueNbs = Array.from(new Set(stats.restaurants.map((r: any) => JSON.stringify({
            name: r.neighborhood,
            slug: r.slug // wait, we can construct the slug or get it
          })))).map((s: any) => {
            const parsed = JSON.parse(s);
            // Construct slug
            const slg = parsed.name.toLowerCase().replace(/\s+/g, "_");
            return { name: parsed.name, slug: slg };
          });
          
          // De-duplicate nbs
          const seen = new Set();
          const dedupedNbs = uniqueNbs.filter(el => {
            const duplicate = seen.has(el.slug);
            seen.add(el.slug);
            return !duplicate;
          });
          
          setNeighborhoods(dedupedNbs);
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    }
    fetchFilters();
  }, []);

  // Fetch list of restaurants based on search & filters
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (cuisineFilter) params.append("cuisine", cuisineFilter);
        if (neighborhoodFilter) params.append("neighborhood", neighborhoodFilter);
        if (costFilter) params.append("cost", costFilter);
        if (hasSymbols) params.append("symbols", "true");
        if (hasStatement) params.append("statement", "true");
        if (hasMenu) params.append("separateMenu", "true");
        if (hasChart) params.append("chart", "true");

        const res = await fetch(`/api/restaurants?${params.toString()}`);
        if (res.ok) {
          const list = await res.json();
          setRestaurantsList(list);
        }
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, [searchTerm, cuisineFilter, neighborhoodFilter, costFilter, hasSymbols, hasStatement, hasMenu, hasChart]);

  // Fetch expanded restaurant details
  useEffect(() => {
    if (!expandedSlug) {
      setExpandedRest(null);
      return;
    }

    async function fetchDetail() {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/restaurants?slug=${expandedSlug}`);
        if (res.ok) {
          const detail = await res.json();
          setExpandedRest(detail);
        }
      } catch (err) {
        console.error("Failed to load restaurant details:", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    fetchDetail();
  }, [expandedSlug]);

  // Generate and download audited dataset as CSV
  const handleDownloadCSV = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return;
      const stats = await res.json();
      const rawRests = stats.restaurants;

      // Build CSV headers and rows
      const headers = [
        "TRADE_NAME",
        "NEIGHBORHOOD",
        "CUISINE_TYPE",
        "TRIPADVISOR_RATING",
        "COST_LEVEL",
        "NUM_LOCATIONS",
        "HAS_ALLERGEN_SYMBOLS",
        "HAS_ALLERGEN_STATEMENT",
        "HAS_SEPARATE_MENU",
        "HAS_SEPARATE_CHART",
        "WEBSITE_URL",
        "CIVIC_ADDRESS",
      ];

      const csvRows = [headers.join(",")];

      for (const r of rawRests) {
        const row = [
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.neighborhood}"`,
          `"${r.cuisine}"`,
          r.tripadvisor_rating,
          r.cost_indicator,
          r.num_locations,
          r.has_allergen_symbols ? "1" : "0",
          r.has_allergen_statement ? "1" : "0",
          r.has_separate_menu ? "1" : "0",
          r.has_separate_chart ? "1" : "0",
          `"${r.website_url || ""}"`,
          `"${r.address.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "victoria_allergen_study_dataset_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };

  return (
    <div className="container page-content animate-fade-in">
      <div className="flex-between" style={{ marginBottom: "var(--space-8)" }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: "var(--space-2)" }}>Victoria Dataset</span>
          <h1>Restaurant Menu & Allergen Explorer</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Explore the audited restaurants, inspect specific disclaimers, and view menus with allergen flags.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleDownloadCSV}>
          📥 Download Audited CSV (100 Restaurants)
        </button>
      </div>

      <div className="grid grid-4" style={{ gap: "var(--space-6)" }}>
        {/* ─── Search & Filters Side Panel (1 column) ─── */}
        <div className="card flex flex-col gap-4" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "var(--fs-md)" }}>Filters</h3>

          <div className="form-group flex flex-col gap-1">
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Search</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Search by restaurant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group flex flex-col gap-1">
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Cuisine</label>
            <select 
              className="select" 
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
            >
              <option value="">All Cuisines</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex flex-col gap-1">
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Neighborhood</label>
            <select 
              className="select" 
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
            >
              <option value="">All Neighborhoods</option>
              {neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>{n.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex flex-col gap-1">
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Cost Level</label>
            <select 
              className="select" 
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="1">$ (Inexpensive)</option>
              <option value="2">$$ (Moderate)</option>
              <option value="3">$$$ (Expensive)</option>
              <option value="4">$$$$ (Ultra-premium)</option>
            </select>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)", marginTop: "var(--space-1)" }}>
            <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-2)", display: "block" }}>
              Allergen Accommodations
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex gap-2" style={{ fontSize: "var(--fs-sm)", cursor: "pointer", alignItems: "center" }}>
                <input type="checkbox" checked={hasSymbols} onChange={() => setHasSymbols(!hasSymbols)} style={{ accentColor: "var(--accent-primary)" }} />
                <span>Has Allergen Symbols</span>
              </label>
              <label className="flex gap-2" style={{ fontSize: "var(--fs-sm)", cursor: "pointer", alignItems: "center" }}>
                <input type="checkbox" checked={hasStatement} onChange={() => setHasStatement(!hasStatement)} style={{ accentColor: "var(--accent-primary)" }} />
                <span>Has Warning Statement</span>
              </label>
              <label className="flex gap-2" style={{ fontSize: "var(--fs-sm)", cursor: "pointer", alignItems: "center" }}>
                <input type="checkbox" checked={hasMenu} onChange={() => setHasMenu(!hasMenu)} style={{ accentColor: "var(--accent-primary)" }} />
                <span>Separate Allergen Menu</span>
              </label>
              <label className="flex gap-2" style={{ fontSize: "var(--fs-sm)", cursor: "pointer", alignItems: "center" }}>
                <input type="checkbox" checked={hasChart} onChange={() => setHasChart(!hasChart)} style={{ accentColor: "var(--accent-primary)" }} />
                <span>Allergen Chart</span>
              </label>
            </div>
          </div>
        </div>

        {/* ─── Restaurant List / Results (3 columns) ─── */}
        <div style={{ gridColumn: "span 3" }}>
          {loading ? (
            <div className="flex-center" style={{ minHeight: "200px" }}>
              <div className="shimmer" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
              <p style={{ marginLeft: "var(--space-3)", color: "var(--text-secondary)" }}>Filtering database records...</p>
            </div>
          ) : restaurantsList.length === 0 ? (
            <div className="card" style={{ padding: "var(--space-12) 0", textAlign: "center" }}>
              <h4>No Restaurants Found</h4>
              <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : expandedSlug ? (
            /* ─── EXPANDED DETAILED RESTAURANT VIEW ─── */
            <div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setExpandedSlug(null)}
                style={{ marginBottom: "var(--space-4)", padding: "var(--space-1.5) var(--space-4)" }}
              >
                ← Back to Restaurant List
              </button>

              {loadingDetail || !expandedRest ? (
                <div className="card flex-center" style={{ minHeight: "300px" }}>
                  <div className="shimmer" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                  <p style={{ marginLeft: "var(--space-3)", color: "var(--text-secondary)" }}>Fetching menu sections and item allergen mappings...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Restaurant Header Card */}
                  <div className="card">
                    <div className="flex-between flex-wrap" style={{ gap: "var(--space-4)" }}>
                      <div>
                        <div className="flex gap-2" style={{ alignItems: "center", marginBottom: "var(--space-1)" }}>
                          <span className="badge badge-success">{expandedRest.cuisineType}</span>
                          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>{expandedRest.neighborhood}</span>
                        </div>
                        <h2 style={{ fontSize: "var(--fs-2xl)" }}>{expandedRest.name}</h2>
                        <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
                          📍 {expandedRest.address}
                        </p>
                      </div>
                      <div className="flex flex-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
                        <span style={{ fontSize: "var(--fs-xl)", fontWeight: 600, color: "var(--accent-secondary)" }}>
                          {expandedRest.tripadvisorRating} ★
                        </span>
                        <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                          TripAdvisor rating | {"$".repeat(expandedRest.costIndicator || 2)} price level
                        </span>
                        {expandedRest.websiteUrl && (
                          <a 
                            href={`https://${expandedRest.websiteUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: "var(--fs-sm)", marginTop: "var(--space-2)", textDecoration: "underline" }}
                          >
                            Visit Website ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tags Badges list */}
                    <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
                      {expandedRest.tags.map((tag) => (
                        <span key={tag} className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", fontSize: "10px" }}>
                          {tag === "allergen-symbols" ? "✓ Menu symbols" :
                           tag === "allergen-statement" ? "⚠️ Warning statement" :
                           tag === "separate-allergen-menu" ? "📖 Dedicated Gluten-free menu" :
                           tag === "allergen-chart" ? "📊 Priority Allergen chart" : tag}
                        </span>
                      ))}
                      <a 
                        href={`/data/raw_menus/${expandedRest.menuSourceUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="badge" 
                        style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "var(--accent-secondary)", fontSize: "10px", cursor: "pointer" }}
                      >
                        📄 View Scraped Menu Audit File ↗
                      </a>
                    </div>
                  </div>

                  {/* Warning Statement Display */}
                  {expandedRest.tags.includes("allergen-statement") && (
                    <div className="card" style={{ background: "var(--warning-bg)", borderColor: "rgba(245,158,11,0.2)", padding: "var(--space-4)" }}>
                      <h4 style={{ color: "var(--warning)", fontSize: "var(--fs-sm)", marginBottom: "var(--space-1)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        ⚠️ Menu Allergen Disclaimer
                      </h4>
                      <p style={{ fontSize: "var(--fs-sm)", fontStyle: "italic", lineHeight: 1.5 }}>
                        &ldquo;{expandedRest.menuSections[0]?.name === "Appetizers" || expandedRest.menuSections[0]?.name === "Starters" || expandedRest.menuSections[0]?.name === "Sides" ? "Please notify your server of any food allergies before ordering. We take precautions to avoid cross-contact, but cannot guarantee a 100% allergen-free environment." : "Allergy Warning: Our dishes may contain or come into contact with wheat, dairy, peanuts, tree nuts, eggs, and shellfish. Inform your waiter if you have a severe allergy."}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* ─── Menu Sections and Items ─── */}
                  <div className="flex flex-col gap-6">
                    {expandedRest.menuSections.map((section) => (
                      <div key={section.id} className="card">
                        <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--border)", paddingBottom: "var(--space-2)", color: "var(--accent-secondary)" }}>
                          {section.name}
                        </h3>
                        <div className="flex flex-col gap-4">
                          {section.items.map((item) => (
                            <div key={item.id} className="flex-between flex-wrap" style={{ gap: "var(--space-3)", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "var(--space-3)" }}>
                              <div style={{ maxWidth: "75%" }}>
                                <div className="flex" style={{ alignItems: "center", gap: "var(--space-2)" }}>
                                  <h4 style={{ fontSize: "var(--fs-base)" }}>{item.name}</h4>
                                  <div className="flex gap-1">
                                    {item.isGlutenFreeMarked && (
                                      <span className="badge" style={{ background: "var(--allergen-gluten)", color: "#fff", fontSize: "8px", padding: "1px 3px" }}>GF</span>
                                    )}
                                    {item.isVegan && (
                                      <span className="badge" style={{ background: "var(--allergen-soybeans)", color: "#fff", fontSize: "8px", padding: "1px 3px" }}>VG</span>
                                    )}
                                  </div>
                                </div>
                                <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
                                  {item.description}
                                </p>
                              </div>

                              <div className="flex" style={{ alignItems: "center", gap: "var(--space-4)" }}>
                                {/* Allergen Icons Display */}
                                {item.allergens && item.allergens.length > 0 && (
                                  <div className="flex gap-1">
                                    {item.allergens.map((itemAl) => (
                                      <div 
                                        key={itemAl.id} 
                                        title={`${itemAl.allergen.name}: ${itemAl.allergen.description}`}
                                        style={{ cursor: "help" }}
                                      >
                                        <AllergenIcon allergenSlug={itemAl.allergen.slug} size={16} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>
                                  ${item.price?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ─── RESTAURANT GRID LIST VIEW ─── */
            <div className="restaurant-grid">
              {restaurantsList.map((r) => (
                <div key={r.id} className="card flex flex-col justify-between" style={{ cursor: "pointer" }} onClick={() => setExpandedSlug(r.slug)}>
                  <div>
                    <div className="flex-between" style={{ marginBottom: "var(--space-2)" }}>
                      <span className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", fontSize: "10px" }}>
                        {r.cuisineType}
                      </span>
                      <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                        {r.neighborhood}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "var(--fs-base)", marginBottom: "var(--space-2)" }}>{r.name}</h3>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "4px" }}>
                      📍 {r.address.split("\n")[0]}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)", marginTop: "var(--space-2)" }}>
                    <div className="flex-between flex-wrap" style={{ gap: "4px" }}>
                      {/* Accommodations badges mini list */}
                      <div className="flex gap-1 flex-wrap">
                        {r.tags.includes("allergen-symbols") && (
                          <span title="Uses allergen symbols" style={{ cursor: "help" }}>🏷️</span>
                        )}
                        {r.tags.includes("allergen-statement") && (
                          <span title="Has allergy warning statement" style={{ cursor: "help" }}>⚠️</span>
                        )}
                        {r.tags.includes("separate-allergen-menu") && (
                          <span title="Offers separate gluten-free/allergen menu" style={{ cursor: "help" }}>📖</span>
                        )}
                        {r.tags.includes("allergen-chart") && (
                          <span title="Has allergen chart" style={{ cursor: "help" }}>📊</span>
                        )}
                      </div>
                      <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--accent-secondary)" }}>
                        View Menu & Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
