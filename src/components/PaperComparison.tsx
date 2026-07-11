"use client";

import { useEffect, useState, useRef } from "react";

export function PaperComparison() {
  const [manuscript, setManuscript] = useState("");
  const [loadingManuscript, setLoadingManuscript] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"results" | "manuscript">("results");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  // 1. Fetch manuscript
  useEffect(() => {
    async function fetchManuscript() {
      try {
        const res = await fetch("/api/manuscript");
        if (res.ok) {
          const text = await res.text();
          setManuscript(text);
        }
      } catch (err) {
        console.error("Failed to load manuscript:", err);
      } finally {
        setLoadingManuscript(false);
      }
    }
    fetchManuscript();
  }, []);

  // 2. Fetch restaurants list
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("/api/restaurants");
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
        }
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchRestaurants();
  }, []);

  // 3. Load Leaflet script/styles dynamically to avoid Next.js SSR hydration crashes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    cssLink.crossOrigin = "";
    document.head.appendChild(cssLink);

    const jsScript = document.createElement("script");
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    jsScript.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    jsScript.crossOrigin = "";
    jsScript.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(jsScript);
  }, []);

// Standard UTM Zone 10N to Lat/Lng converter for Victoria BC (WGS84)
function utmToLatLng(easting: number, northing: number) {
  const UTM_SCALE_FACTOR = 0.9996;
  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1.0 / 298.257223563; // WGS84 flattening
  const b = a * (1 - f); // semi-minor axis
  const e2 = (a*a - b*b) / (a*a); // eccentricity squared
  const ePrime2 = (a*a - b*b) / (b*b); // second eccentricity squared
  
  const x = easting - 500000.0;
  const y = northing;
  
  const lambda0 = ((10 - 1) * 6 - 180 + 3) * Math.PI / 180.0; // central meridian for Zone 10
  
  const M = y / UTM_SCALE_FACTOR;
  const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*Math.pow(e2, 3)/256));
  
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const J1 = (3*e1/2 - 27*Math.pow(e1, 3)/32);
  const J2 = (21*e1*e1/16 - 55*Math.pow(e1, 4)/32);
  const J3 = (151*Math.pow(e1, 3)/96);
  const J4 = (1097*Math.pow(e1, 4)/512);
  
  const fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
  
  const C1 = ePrime2 * Math.pow(Math.cos(fp), 2);
  const T1 = Math.pow(Math.tan(fp), 2);
  const R1 = a * (1 - e2) / Math.pow(1 - e2*Math.sin(fp)*Math.sin(fp), 1.5);
  const N1 = a / Math.sqrt(1 - e2*Math.sin(fp)*Math.sin(fp));
  const D = x / (N1 * UTM_SCALE_FACTOR);
  
  let lat = fp - (N1 * Math.tan(fp) / R1) * (D*D/2 - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*ePrime2)*Math.pow(D, 4)/24 + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*ePrime2 - 3*C1*C1)*Math.pow(D, 6)/720);
  let lon = (D - (1 + 2*T1 + C1)*Math.pow(D, 3)/6 + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*C1*C1 + 24*T1*T1)*Math.pow(D, 5)/120) / Math.cos(fp);
  
  lat = lat * 180.0 / Math.PI;
  lon = (lon * 180.0 / Math.PI) + (lambda0 * 180.0 / Math.PI);
  
  return { lat, lng: lon };
}

// 4. Initialize and update Leaflet Map
useEffect(() => {
  if (!leafletLoaded || restaurants.length === 0 || activeTab !== "results") return;

  const L = (window as any).L;
  if (!L) return;

  // Center map around Downtown/Inner Harbour Victoria, BC
  const map = L.map("spatial-map").setView([48.4284, -123.3656], 13);
  mapRef.current = map;

  // Use CartoDB Dark Matter tile layer for a sleek premium aesthetic matching our dark theme
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  // Filter out mock coordinates (0, 0 or empty) and add circles
  restaurants.forEach((r) => {
    const latRaw = parseFloat(r.latitude);
    const lonRaw = parseFloat(r.longitude);
    if (isNaN(latRaw) || isNaN(lonRaw) || (latRaw === 0 && lonRaw === 0)) return;

    // Convert UTM coordinates to decimal degrees
    const { lat, lng } = utmToLatLng(lonRaw, latRaw);

    const hasSymbols = r.tags.includes("allergen-symbols");
    const hasStatement = r.tags.includes("allergen-statement");

    // Visual color-coding: Green (Symbols), Yellow (Statement), Red (None)
    const color = hasSymbols ? "#10b981" : hasStatement ? "#f59e0b" : "#ef4444";
    
    const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        color: "#ffffff",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.8,
      }).addTo(map);

      // Detailed popup
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: system-ui, sans-serif; font-size: 11px; line-height: 1.4; min-width: 150px;">
          <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #1e293b;">${r.name}</h4>
          <p style="margin: 0 0 6px 0; color: #64748b;">${r.address}</p>
          <div style="margin-bottom: 6px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500; color: #475569;">${r.cuisineType}</span>
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500; color: #475569;">★ ${r.tripadvisorRating || "N/A"}</span>
          </div>
          <div>
            <strong>Labeling:</strong>
            ${hasSymbols ? '<span style="color: #10b981; font-weight: bold;">Symbols [GF/V]</span>' : ""}
            ${hasStatement ? '<span style="color: #f59e0b; font-weight: bold;">Statement</span>' : ""}
            ${!hasSymbols && !hasStatement ? '<span style="color: #64748b;">No Online Disclosures</span>' : ""}
          </div>
        </div>
      `);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, restaurants, activeTab]);

  // Compute cuisine counts dynamically from sample
  const cuisineCounts = restaurants.reduce((acc: any, r: any) => {
    const cuis = r.cuisineType || "Other";
    acc[cuis] = (acc[cuis] || 0) + 1;
    return acc;
  }, {});

  const sortedCuisines = Object.entries(cuisineCounts).sort((a: any, b: any) => b[1] - a[1]);
  const totalRests = restaurants.length || 100;

  // Simple Markdown parser
  const renderMarkdown = (mdText: string) => {
    const lines = mdText.split("\n");
    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const elements: React.JSX.Element[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} style={{ marginLeft: "var(--space-6)", marginBottom: "var(--space-4)", listStyleType: "disc" }}>
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "var(--space-2)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(2);

        elements.push(
          <div key={`table-${key}`} style={{ overflowX: "auto", margin: "var(--space-6) 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-xs)", textAlign: "left", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}>
                  {headers.map((h, idx) => (
                    <th key={idx} style={{ padding: "var(--space-3)", fontWeight: 600 }}>{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: "var(--space-3)" }}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("|")) {
        flushList(index);
        inTable = true;
        const cols = trimmed.split("|").slice(1, -1);
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      } else if (inList) {
        flushList(index);
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={index} style={{ fontSize: "var(--fs-2xl)", color: "var(--accent-secondary)", borderBottom: "1px solid var(--border)", paddingBottom: "var(--space-3)", marginTop: "var(--space-8)", marginBottom: "var(--space-4)" }}>
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={index} style={{ fontSize: "var(--fs-xl)", color: "var(--accent-primary)", marginTop: "var(--space-6)", marginBottom: "var(--space-3)" }}>
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={index} style={{ fontSize: "var(--fs-base)", color: "var(--text-primary)", marginTop: "var(--space-4)", marginBottom: "var(--space-2)", fontWeight: 600 }}>
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed === "---") {
        elements.push(<hr key={index} style={{ border: "0", borderTop: "1px solid var(--border)", margin: "var(--space-8) 0" }} />);
      } else if (trimmed === "") {
        // Skip empty lines
      } else {
        let formattedText = trimmed;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        formattedText = formattedText.replace(boldRegex, "<strong>$1</strong>");

        elements.push(
          <p 
            key={index} 
            style={{ fontSize: "var(--fs-sm)", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "var(--space-4)", textAlign: "justify" }}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }
    });

    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  // Anonymized representative examples of disclosures audited in Victoria
  const representativeDisclosures = [
    {
      title: "Visual Symbol Markings (Menu Legend)",
      text: "[GF] Gluten-Free | [DF] Dairy-Free | [V] Vegetarian | [VG] Vegan",
      description: "Audited from online menus displaying discrete visual tags next to specific menu items to streamline allergen navigation."
    },
    {
      title: "General Verbal Advisory Disclaimer",
      text: "\"Please notify your server of any food allergies or dietary restrictions before ordering your meal. We will do our best to accommodate your needs.\"",
      description: "Footnote warning audited on local diner and bistro menus, establishing a standard verbal communication protocol."
    },
    {
      title: "Cross-Contact / Cross-Contamination Statement",
      text: "\"Attention customers: Our kitchen prepares foods containing wheat, dairy, peanuts, tree nuts, and sesame. We cannot guarantee a 100% allergen-free environment due to shared equipment.\"",
      description: "Legal liability disclaimer typical of independent pizza, bakery, and Asian-fusion establishments."
    }
  ];

  return (
    <div className="container page-content animate-fade-in">
      <div className="flex-between flex-wrap" style={{ gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: "var(--space-2)" }}>Victoria Restaurant Study</span>
          <h1>Victoria Restaurant Study & MedRxiv Preprint</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Explore the spatial distribution, cuisine categories, and dynamic academic draft paper for Victoria, BC.
          </p>
        </div>

        <div className="flex gap-2" style={{ background: "var(--bg-secondary)", padding: "4px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)" }}>
          <button 
            className={`btn ${activeTab === "results" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--fs-xs)", border: "0" }}
            onClick={() => setActiveTab("results")}
          >
            📊 Victoria Results
          </button>
          <button 
            className={`btn ${activeTab === "manuscript" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--fs-xs)", border: "0" }}
            onClick={() => setActiveTab("manuscript")}
          >
            📄 Manuscript Draft (MedRxiv)
          </button>
        </div>
      </div>

      {activeTab === "results" ? (
        <div className="flex flex-col gap-8">
          
          {/* Spatial Mapping Card */}
          <div className="card" style={{ padding: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-2)" }}>Interactive Spatial Map: Sampling Frame Coverage</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)", marginBottom: "var(--space-6)", lineHeight: 1.6 }}>
              This map plots the 100 sampled independent restaurants across Victoria. 
              The markers demonstrate the geographical coverage of the study sample, color-coded by their allergen markings on online menus.
            </p>
            
            <div className="grid grid-3" style={{ gridTemplateColumns: "1fr 280px", gap: "var(--space-6)" }}>
              {/* Map Container */}
              <div 
                id="spatial-map" 
                style={{ 
                  height: "400px", 
                  borderRadius: "var(--radius-lg)", 
                  border: "1px solid var(--border)",
                  zIndex: 1,
                  background: "#0c101d"
                }}
              ></div>

              {/* Map Legend & Meta */}
              <div className="flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
                <h4 style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Map Legend</h4>
                
                <div className="flex flex-col gap-3" style={{ fontSize: "var(--fs-xs)" }}>
                  <div className="flex align-center gap-2">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "1px solid #fff", display: "inline-block" }}></span>
                    <div>
                      <strong>Symbols [GF / V / DF]</strong>
                      <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Visual allergen indicators used on menu items.</div>
                    </div>
                  </div>

                  <div className="flex align-center gap-2">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b", border: "1px solid #fff", display: "inline-block" }}></span>
                    <div>
                      <strong>Advisory Statement Only</strong>
                      <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Warning disclaimers or verbal guidance only.</div>
                    </div>
                  </div>

                  <div className="flex align-center gap-2">
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", border: "1px solid #fff", display: "inline-block" }}></span>
                    <div>
                      <strong>No Online Disclosures</strong>
                      <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>No symbols or statements found on online menus.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Center Coordinates: 48.4284° N, 123.3656° W<br/>
                  Total Sample Size: 100 Restaurants<br/>
                  Margin of Error: 8.8% (95% CI)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: "var(--space-6)" }}>
            
            {/* Cuisine Distribution Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "var(--fs-md)", marginBottom: "var(--space-2)", color: "var(--accent-secondary)" }}>
                Cuisine Distribution in Audited Sample
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-xs)", marginBottom: "var(--space-6)" }}>
                Frequency distribution of the primary culinary classifications among the 100 sampled independent restaurants.
              </p>

              {loadingData ? (
                <div className="flex-center" style={{ flexGrow: 1, minHeight: "200px" }}>
                  <div className="shimmer" style={{ width: "30px", height: "30px", borderRadius: "50%" }}></div>
                </div>
              ) : (
                <div className="flex flex-col gap-3" style={{ flexGrow: 1 }}>
                  {sortedCuisines.map(([cuisine, count]: any) => {
                    const percentage = ((count / totalRests) * 100).toFixed(1);
                    return (
                      <div key={cuisine} style={{ fontSize: "var(--fs-xs)" }}>
                        <div className="flex-between" style={{ marginBottom: "4px" }}>
                          <span style={{ fontWeight: 500 }}>{cuisine}</span>
                          <span style={{ color: "var(--text-muted)" }}>{count} ({percentage}%)</span>
                        </div>
                        <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "var(--radius-full)", overflow: "hidden", border: "1px solid var(--border)" }}>
                          <div 
                            style={{ 
                              height: "100%", 
                              width: `${percentage}%`, 
                              background: "linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
                              borderRadius: "var(--radius-full)"
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Representative Examples Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "var(--fs-md)", marginBottom: "var(--space-2)", color: "var(--accent-secondary)" }}>
                Representative Anonymous Examples
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-xs)", marginBottom: "var(--space-6)" }}>
                Disclosures and warning statements extracted from our online menu audit of Victoria establishments, fully anonymized.
              </p>

              <div className="flex flex-col gap-4" style={{ flexGrow: 1 }}>
                {representativeDisclosures.map((ex, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: "rgba(255,255,255,0.01)", 
                      border: "1px solid var(--border)", 
                      padding: "var(--space-4)", 
                      borderRadius: "var(--radius-md)" 
                    }}
                  >
                    <h4 style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--accent-primary)", marginBottom: "var(--space-1.5)" }}>
                      {ex.title}
                    </h4>
                    <p style={{ 
                      fontStyle: "italic", 
                      fontSize: "var(--fs-sm)", 
                      background: "rgba(0,0,0,0.2)", 
                      padding: "var(--space-2.5) var(--space-3)", 
                      borderRadius: "var(--radius-sm)", 
                      borderLeft: "3px solid var(--accent-secondary)",
                      color: "var(--text-primary)",
                      fontFamily: "monospace",
                      lineHeight: 1.4,
                      marginBottom: "var(--space-2)"
                    }}>
                      {ex.text}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                      {ex.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ─── DYNAMIC ACADEMIC MANUSCRIPT READER ─── */
        <div className="grid" style={{ gridTemplateColumns: "250px 1fr", gap: "var(--space-6)" }}>
          {/* Outline Side Navigation */}
          <div className="card" style={{ height: "fit-content", position: "sticky", top: "var(--space-6)" }}>
            <h4 style={{ fontSize: "var(--fs-sm)", marginBottom: "var(--space-3)", borderBottom: "1px solid var(--border)", paddingBottom: "var(--space-1.5)" }}>
              Outline
            </h4>
            <div className="flex flex-col gap-2" style={{ fontSize: "var(--fs-xs)" }}>
              <a href="#food-allergen-labeling-and-disclosure-practices-on-restaurants-online-menus-in-victoria-bc-a-cross-sectional-study" className="outline-link" style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>Title</a>
              <a href="#abstract" className="outline-link">Abstract</a>
              <a href="#1-introduction" className="outline-link">1. Introduction</a>
              <a href="#2-methods" className="outline-link">2. Methods</a>
              <a href="#3-results" className="outline-link">3. Results</a>
              <a href="#4-discussion" className="outline-link">4. Discussion</a>
              <a href="#references" className="outline-link">References</a>
            </div>
            <div style={{ marginTop: "var(--space-6)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "var(--space-2)" }}>Workspace Manuscript File:</span>
              <a 
                href="/manuscript.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary" 
                style={{ fontSize: "10px", padding: "4px 10px", width: "100%", justifyContent: "center" }}
              >
                Open Markdown File
              </a>
            </div>
          </div>

          {/* Paper Content */}
          <div className="card" style={{ padding: "var(--space-8) var(--space-10)", background: "#0a0e1a", border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            {loadingManuscript ? (
              <div className="flex-center" style={{ minHeight: "200px" }}>
                <div className="shimmer" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                <p style={{ marginLeft: "var(--space-3)", color: "var(--text-secondary)" }}>Loading manuscript text...</p>
              </div>
            ) : (
              renderMarkdown(manuscript)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
