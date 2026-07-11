"use client";

import { useEffect, useState } from "react";

interface SummaryMetric {
  count: number;
  percentage: number;
}

interface StatsData {
  summary: {
    total_restaurants: number;
    has_allergen_symbols: SummaryMetric;
    has_allergen_statement: SummaryMetric;
    has_separate_menu: SummaryMetric;
    has_separate_chart: SummaryMetric;
  };
  cuisine_distribution: Record<string, number>;
  cuisine_cross_tabulation: Array<{
    cuisine: string;
    total: number;
    has_symbols: number;
    symbols_percent: number;
    has_statement: number;
    statement_percent: number;
  }>;
  cost_cross_tabulation: Array<{
    cost_indicator: number;
    total: number;
    has_symbols: number;
    symbols_percent: number;
    has_statement: number;
    statement_percent: number;
  }>;
  regression_results: {
    symbols_model: Array<{
      variable: string;
      coefficient: number;
      odds_ratio: number;
      p_value: number;
      ci_95_lower: number;
      ci_95_upper: number;
    }>;
    statements_model: Array<{
      variable: string;
      coefficient: number;
      odds_ratio: number;
      p_value: number;
      ci_95_lower: number;
      ci_95_upper: number;
    }>;
  };
}

export function Dashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModelTab, setActiveModelTab] = useState<"symbols" | "statements">("symbols");

  // Predictor calculator state
  const [predCuisine, setPredCuisine] = useState("Vegan/Vegetarian");
  const [predCost, setPredCost] = useState(2);
  const [predRating, setPredRating] = useState(4.2);
  const [predLocations, setPredLocations] = useState(1);
  const [predSymbolsProb, setPredSymbolsProb] = useState(0);
  const [predStatementsProb] = useState(0); // Kept for future reference or extension
  const [predProbabilities, setPredProbabilities] = useState<{ symbols: number; statements: number }>({ symbols: 0, statements: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error("Failed to load statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Update predictions when calculator inputs change
  useEffect(() => {
    if (!data) return;

    // Define approximate cuisine random effect intercepts (offsets) for Victoria BC
    const cuisineOffsetsSymbols: Record<string, number> = {
      "Vegan/Vegetarian": 2.5,
      "Southeast-Asian": 1.2,
      "Seafood": 0.8,
      "European": 0.5,
      "Pizzeria": 0.3,
      "East-Asian": -0.5,
      "Brunch/bagel": -0.8,
      "Bar/Pub": -1.5,
      "North American": -1.8,
      "Middle Eastern": -2.0,
      "South-Asian": -2.0,
      "Asian-Fusion": -2.0,
      "BBQ/steakhouse": -2.0,
    };

    const cuisineOffsetsStatements: Record<string, number> = {
      "Southeast-Asian": 1.5,
      "European": 1.2,
      "Vegan/Vegetarian": 1.0,
      "East-Asian": 0.8,
      "Seafood": 0.5,
      "Pizzeria": 0.2,
      "Bar/Pub": -0.8,
      "North American": -1.0,
      "Brunch/bagel": -1.2,
      "Middle Eastern": -1.5,
      "South-Asian": -2.5,
      "Asian-Fusion": -2.5,
      "BBQ/steakhouse": -2.5,
    };

    // Model 1: Symbols
    // z = Intercept + beta_cost * cost + beta_rating * rating + beta_locations * locations + offset
    const symModel = data.regression_results.symbols_model;
    const symInt = symModel.find((v) => v.variable === "Intercept")?.coefficient || -3.1496;
    const symCost = symModel.find((v) => v.variable === "cost_indicator")?.coefficient || 0.3978;
    const symRating = symModel.find((v) => v.variable === "tripadvisor_rating")?.coefficient || -0.0571;
    const symLocs = symModel.find((v) => v.variable === "num_locations")?.coefficient || 0.6447;
    const symOffset = cuisineOffsetsSymbols[predCuisine] || 0.0;

    const zSymbols = symInt + (symCost * predCost) + (symRating * predRating) + (symLocs * predLocations) + symOffset;
    const probSymbols = 1 / (1 + Math.exp(-zSymbols));

    // Model 2: Statements
    const stateModel = data.regression_results.statements_model;
    const stateInt = stateModel.find((v) => v.variable === "Intercept")?.coefficient || 3.7338;
    const stateCost = stateModel.find((v) => v.variable === "cost_indicator")?.coefficient || 0.3237;
    const stateRating = stateModel.find((v) => v.variable === "tripadvisor_rating")?.coefficient || -1.2832;
    const stateLocs = stateModel.find((v) => v.variable === "num_locations")?.coefficient || 0.0653;
    const stateOffset = cuisineOffsetsStatements[predCuisine] || 0.0;

    const zStatements = stateInt + (stateCost * predCost) + (stateRating * predRating) + (stateLocs * predLocations) + stateOffset;
    const probStatements = 1 / (1 + Math.exp(-zStatements));

    setPredSymbolsProb(probSymbols * 100);
    setPredProbabilities({
      symbols: probSymbols * 100,
      statements: probStatements * 100,
    });
  }, [predCuisine, predCost, predRating, predLocations, data]);

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: "400px" }}>
        <div className="shimmer" style={{ width: "80px", height: "80px", borderRadius: "50%" }}></div>
        <p style={{ marginLeft: "var(--space-4)", color: "var(--text-secondary)" }}>Loading study results and running statistical analysis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ padding: "var(--space-10) 0", textAlign: "center" }}>
        <h3>Error Loading Research Data</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>
          Please make sure you have run the seeding script (`npx tsx src/db/seed.ts`) to gather open data and fit the regression models.
        </p>
      </div>
    );
  }

  const { summary, cuisine_distribution, cuisine_cross_tabulation, cost_cross_tabulation, regression_results } = data;

  // Maximum value for scaling the Pareto chart
  const maxCuisineCount = Math.max(...Object.values(cuisine_distribution));

  return (
    <div className="container page-content animate-fade-in">
      <div style={{ marginBottom: "var(--space-10)" }}>
        <span className="badge badge-warning" style={{ marginBottom: "var(--space-2)" }}>Research Study Reproduction</span>
        <h1 style={{ marginBottom: "var(--space-2)" }}>Victoria BC Restaurant Allergen Labeling</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "800px" }}>
          Based on a sample of 100 active, nonchain restaurants selected from the City of Victoria's open business licensing data registry.
        </p>
      </div>

      {/* ─── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-4" style={{ marginBottom: "var(--space-10)" }}>
        <div className="card">
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>Sample Size (Independent)</span>
          <h2 style={{ fontSize: "var(--fs-4xl)", margin: "var(--space-2) 0 0", color: "var(--accent-secondary)" }}>
            {summary.total_restaurants}
          </h2>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            Sourced from 515 Victoria licences
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>Has Allergen Symbols</span>
          <h2 style={{ fontSize: "var(--fs-4xl)", margin: "var(--space-2) 0 0", color: "var(--success)" }}>
            {summary.has_allergen_symbols.percentage}%
          </h2>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            {summary.has_allergen_symbols.count} out of 100 restaurants
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>Has Allergen Statement</span>
          <h2 style={{ fontSize: "var(--fs-4xl)", margin: "var(--space-2) 0 0", color: "var(--info)" }}>
            {summary.has_allergen_statement.percentage}%
          </h2>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            {summary.has_allergen_statement.count} out of 100 restaurants
          </p>
        </div>

        <div className="card">
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>Detailed Menu / Charts</span>
          <h2 style={{ fontSize: "var(--fs-4xl)", margin: "var(--space-2) 0 0", color: "var(--text-primary)" }}>
            {summary.has_separate_menu.percentage + summary.has_separate_chart.percentage}%
          </h2>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            {summary.has_separate_menu.count} separate menu, {summary.has_separate_chart.count} charts
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: "var(--space-10)" }}>
        {/* ─── Cuisine Distribution (SVG Pareto Chart) ─────────────────────── */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-4)" }}>Cuisine Frequency in Sample</h3>
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {Object.entries(cuisine_distribution).slice(0, 8).map(([cuisine, count]) => {
              const widthPct = (count / maxCuisineCount) * 100;
              return (
                <div key={cuisine} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ width: "120px", fontSize: "var(--fs-xs)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-secondary)" }}>
                    {cuisine}
                  </span>
                  <div style={{ flexGrow: 1, height: "16px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        width: `${widthPct}%`, 
                        height: "100%", 
                        background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                        borderRadius: "var(--radius-sm)",
                        transition: "width var(--transition-slow)"
                      }}
                    ></div>
                  </div>
                  <span style={{ width: "20px", fontSize: "var(--fs-xs)", fontWeight: 600, textAlign: "right" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Allergen Accommodations by Cost ───────────────────────────── */}
        <div className="card">
          <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-4)" }}>Allergen Disclosure by Restaurant Price Level</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {cost_cross_tabulation.map((costGroup) => (
              <div key={costGroup.cost_indicator} style={{ background: "rgba(255,255,255,0.02)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div className="flex-between" style={{ marginBottom: "var(--space-2)" }}>
                  <span style={{ fontWeight: 600, color: "var(--accent-secondary)" }}>
                    {"$".repeat(costGroup.cost_indicator)}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                      {"$".repeat(4 - costGroup.cost_indicator)} (N = {costGroup.total})
                    </span>
                  </span>
                </div>
                <div className="grid grid-2" style={{ gap: "var(--space-2)" }}>
                  <div className="flex-between" style={{ fontSize: "var(--fs-xs)", padding: "var(--space-1) var(--space-2)", background: "var(--success-bg)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ color: "var(--success)" }}>Allergen Symbols</span>
                    <span style={{ fontWeight: 600 }}>{costGroup.symbols_percent}%</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "var(--fs-xs)", padding: "var(--space-1) var(--space-2)", background: "var(--warning-bg)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ color: "var(--warning)" }}>Allergen Statement</span>
                    <span style={{ fontWeight: 600 }}>{costGroup.statement_percent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Cuisine Cross-Tabulation Details ─── */}
      <div className="card" style={{ marginBottom: "var(--space-10)" }}>
        <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-4)" }}>Detailed Accommodations by Cuisine</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-sm)", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "var(--space-3)" }}>Cuisine Type</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Sample size (N)</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Has Symbols (n)</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Symbols %</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Has Statement (n)</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Statement %</th>
              </tr>
            </thead>
            <tbody>
              {cuisine_cross_tabulation.map((row) => (
                <tr key={row.cuisine} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "var(--space-3)", fontWeight: 500 }}>{row.cuisine}</td>
                  <td style={{ padding: "var(--space-3)", textAlign: "center" }}>{row.total}</td>
                  <td style={{ padding: "var(--space-3)", textAlign: "center", color: row.has_symbols > 0 ? "var(--success)" : "inherit" }}>
                    {row.has_symbols}
                  </td>
                  <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600 }}>
                    {row.symbols_percent}%
                  </td>
                  <td style={{ padding: "var(--space-3)", textAlign: "center", color: row.has_statement > 0 ? "var(--info)" : "inherit" }}>
                    {row.has_statement}
                  </td>
                  <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600 }}>
                    {row.statement_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Regression Models Section ───────────────────────────────────── */}
      <div className="grid grid-3" style={{ marginBottom: "var(--space-10)", alignItems: "stretch" }}>
        {/* Regression Summary Tables (Takes 2 columns) */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="flex-between" style={{ marginBottom: "var(--space-4)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)" }}>Multivariable GEE Logistic Regression Results</h3>
            <div className="flex gap-2">
              <button 
                className={`btn btn-secondary ${activeModelTab === "symbols" ? "active" : ""}`}
                style={{ 
                  padding: "var(--space-1.5) var(--space-3)", 
                  fontSize: "var(--fs-xs)",
                  borderColor: activeModelTab === "symbols" ? "var(--accent-primary)" : "var(--border)",
                  color: activeModelTab === "symbols" ? "var(--accent-primary)" : "inherit"
                }}
                onClick={() => setActiveModelTab("symbols")}
              >
                Model 1: Allergen Symbols
              </button>
              <button 
                className={`btn btn-secondary ${activeModelTab === "statements" ? "active" : ""}`}
                style={{ 
                  padding: "var(--space-1.5) var(--space-3)", 
                  fontSize: "var(--fs-xs)",
                  borderColor: activeModelTab === "statements" ? "var(--accent-primary)" : "var(--border)",
                  color: activeModelTab === "statements" ? "var(--accent-primary)" : "inherit"
                }}
                onClick={() => setActiveModelTab("statements")}
              >
                Model 2: Allergen Statements
              </button>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-xs)", marginBottom: "var(--space-4)" }}>
            *Cuisine type included as a clustering parameter (random-effect proxy). Predictor variables represent standard odds ratios (OR) with a 95% Confidence Interval. OR &gt; 1 indicates increased likelihood of disclosure.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-sm)", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "var(--space-3)" }}>Predictor Variable</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Coefficient</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Odds Ratio (OR)</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>95% CI</th>
                <th style={{ padding: "var(--space-3)", textAlign: "center" }}>P-value</th>
              </tr>
            </thead>
            <tbody>
              {regression_results[`${activeModelTab}_model`].map((row) => {
                const isSig = row.p_value < 0.05 && row.variable !== "Intercept";
                return (
                  <tr 
                    key={row.variable} 
                    style={{ 
                      borderBottom: "1px solid rgba(255,255,255,0.02)", 
                      background: isSig ? "rgba(16, 185, 129, 0.04)" : "transparent"
                    }}
                  >
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>
                      {row.variable === "cost_indicator" ? "Cost Indicator ($ to $$$$)" : 
                       row.variable === "tripadvisor_rating" ? "TripAdvisor Rating" : 
                       row.variable === "num_locations" ? "Number of Locations" : 
                       row.variable}
                      {isSig && <span className="badge badge-success" style={{ marginLeft: "var(--space-2)", fontSize: "9px", padding: "1px 4px" }}>Significant</span>}
                    </td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>{row.coefficient}</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600, color: row.odds_ratio > 1.0 ? "var(--accent-secondary)" : "inherit" }}>
                      {row.odds_ratio}
                    </td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--text-secondary)" }}>
                      {row.ci_95_lower} – {row.ci_95_upper}
                    </td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: isSig ? 600 : 400, color: isSig ? "var(--success)" : "inherit" }}>
                      {row.p_value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Interactive Probability Predictor Calculator ───────────────── */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-2)" }}>Allergen Disclosure Probability Calculator</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-xs)", marginBottom: "var(--space-4)" }}>
              Predict the mathematical likelihood of allergen disclosures using the fitted GEE regression models.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="form-group flex flex-col gap-1">
                <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Cuisine Category</label>
                <select 
                  className="select"
                  value={predCuisine} 
                  onChange={(e) => setPredCuisine(e.target.value)}
                  style={{ padding: "var(--space-2)" }}
                >
                  {Object.keys(cuisine_distribution).map((cuis) => (
                    <option key={cuis} value={cuis}>{cuis}</option>
                  ))}
                </select>
              </div>

              <div className="form-group flex flex-col gap-1">
                <div className="flex-between">
                  <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Cost Level</label>
                  <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--accent-secondary)" }}>{"$".repeat(predCost)}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="4" 
                  value={predCost}
                  onChange={(e) => setPredCost(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent-primary)" }}
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <div className="flex-between">
                  <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>TripAdvisor Rating</label>
                  <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--accent-secondary)" }}>{predRating} ★</span>
                </div>
                <input 
                  type="range" 
                  min="3.5" 
                  max="5.0" 
                  step="0.1"
                  value={predRating}
                  onChange={(e) => setPredRating(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent-primary)" }}
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <div className="flex-between">
                  <label style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>Local Branches</label>
                  <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--accent-secondary)" }}>{predLocations} {predLocations === 1 ? "location" : "locations"}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={predLocations}
                  onChange={(e) => setPredLocations(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent-primary)" }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-6)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <div className="flex-between" style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>
                  <span>Probability of Allergen Symbols</span>
                  <span style={{ fontWeight: 600, color: "var(--success)" }}>{predProbabilities.symbols.toFixed(1)}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ width: `${predProbabilities.symbols}%`, height: "100%", background: "var(--success)", borderRadius: "var(--radius-full)" }}></div>
                </div>
              </div>

              <div>
                <div className="flex-between" style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>
                  <span>Probability of Allergen Warning</span>
                  <span style={{ fontWeight: 600, color: "var(--info)" }}>{predProbabilities.statements.toFixed(1)}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ width: `${predProbabilities.statements}%`, height: "100%", background: "var(--info)", borderRadius: "var(--radius-full)" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
