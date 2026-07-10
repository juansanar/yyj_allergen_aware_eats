"use client";

import { useEffect, useState } from "react";

export function PaperComparison() {
  const [manuscript, setManuscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"comparison" | "manuscript">("comparison");

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
        setLoading(false);
      }
    }
    fetchManuscript();
  }, []);

  // Simple custom Markdown parser to render manuscript elegantly without external dependencies
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
        // Separate headers and rows
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(2); // Skip separator row like | :--- | :--- |

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

      // Table line
      if (trimmed.startsWith("|")) {
        flushList(index);
        inTable = true;
        const cols = trimmed.split("|").slice(1, -1);
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      // List line
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      } else if (inList) {
        flushList(index);
      }

      // Headers
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
        // Bold formatting parse helper
        let formattedText = trimmed;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;
        // Simple string replacement works for basic bolding
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

    // Flush any remaining lists or tables
    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  return (
    <div className="container page-content animate-fade-in">
      <div className="flex-between flex-wrap" style={{ gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: "var(--space-2)" }}>Academic Review</span>
          <h1>Toronto vs. Victoria & MedRxiv Preprint</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Compare allergen practices across cities and read our dynamic academic draft paper.
          </p>
        </div>

        <div className="flex gap-2" style={{ background: "var(--bg-secondary)", padding: "4px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)" }}>
          <button 
            className={`btn ${activeTab === "comparison" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "var(--space-2) var(--space-4)", fontSize: "var(--fs-xs)", border: "0" }}
            onClick={() => setActiveTab("comparison")}
          >
            📊 City Comparison
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

      {activeTab === "comparison" ? (
        <div className="flex flex-col gap-8">
          {/* Comparative analysis description */}
          <div className="card">
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--space-2)" }}>Key Differences: Toronto vs. Victoria</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
              Our computational study reveals that Victoria, BC exhibits <strong>higher overall allergen labeling rates</strong> than Toronto, ON (Symbols: 14% vs 10%; Statements: 26% vs 16%). This aligns with the regional lifestyle profile of Victoria, where a higher density of health-conscious and vegetarian options increases voluntary adaptations. However, statistical regression shows that the number of local branches remains the only significant positive predictor for symbol labeling in both cities, illustrating that resource barriers constrain single-location independent restaurants.
            </p>
          </div>

          <div className="grid grid-2">
            {/* Table 1: Descriptive Stats Comparison */}
            <div className="card">
              <h3 style={{ fontSize: "var(--fs-md)", marginBottom: "var(--space-4)", color: "var(--accent-secondary)" }}>
                Prevalence Comparison
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-xs)", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "var(--space-3)" }}>Outcome Measure</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Toronto Study (N=1,000)</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Victoria Study (N=100)</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Allergen Symbols</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>10.0%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--success)", fontWeight: 600 }}>14.0%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600, color: "var(--success)" }}>+4.0%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Allergen Statement</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>15.9%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--success)", fontWeight: 600 }}>26.0%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600, color: "var(--success)" }}>+10.1%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Separate Menu</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>0.6%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>1.0%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--success)" }}>+0.4%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Allergen Chart</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>0.4%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--success)", fontWeight: 600 }}>2.0%</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: 600, color: "var(--success)" }}>+1.6%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 2: Regression Predictor Comparison */}
            <div className="card">
              <h3 style={{ fontSize: "var(--fs-md)", marginBottom: "var(--space-4)", color: "var(--accent-secondary)" }}>
                Odds Ratios Comparison (Allergen Symbols Model)
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-xs)", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "var(--space-3)" }}>Independent Variable</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Toronto OR [95% CI]</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Victoria OR [95% CI]</th>
                    <th style={{ padding: "var(--space-3)", textAlign: "center" }}>Comparison</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Cost level</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>1.94 [1.35 – 2.81] *</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>1.48 [0.61 – 3.63]</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--text-muted)" }}>Weaker effect (NS)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Branch count</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>1.08 [1.01 – 1.16] *</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--accent-primary)", fontWeight: 600 }}>1.90 [1.04 – 3.48] *</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--accent-secondary)", fontWeight: 600 }}>Stronger effect *</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>Google/TA Rating</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>1.16 [0.58 – 2.32]</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center" }}>0.94 [0.21 – 4.20]</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "center", color: "var(--text-muted)" }}>No effect (NS)</td>
                  </tr>
                </tbody>
              </table>
              <span style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "var(--space-2)", display: "block" }}>
                * Statistically significant predictor (p &lt; 0.05). NS = Not Significant.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── DYNAMIC ACADEMIC MANUSCRIPT READER ─── */
        <div className="grid" style={{ gridTemplateColumns: "250px 1fr", gap: "var(--space-6)" }}>
          {/* Paper Outline Navigation */}
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
            {loading ? (
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
