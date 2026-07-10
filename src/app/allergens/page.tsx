import { db } from "@/db";
import { allergens } from "@/db/schema";
import { AllergenIcon } from "@/components/AllergenIcon";

export const metadata = {
  title: "EU 14 Priority Allergen Guide | YYJ Allergen-Aware Eats",
  description: "Learn about the 14 declarable priority food allergens under the EU framework, their health impacts, and common culinary sources.",
};

export default async function AllergensPage() {
  // Query all allergens from SQLite using Drizzle
  const allAllergens = await db.select().from(allergens).execute();

  return (
    <div className="container page-content animate-fade-in">
      <div style={{ marginBottom: "var(--space-8)" }}>
        <span className="badge badge-info" style={{ marginBottom: "var(--space-2)" }}>Reference Guide</span>
        <h1>EU 14 Priority Allergens Framework</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
          The European Union’s 14 declarable allergens framework represents the global gold standard for food allergen warning transparency.
        </p>
      </div>

      <div className="grid grid-2">
        {allAllergens.map((allergen) => {
          let sources: string[] = [];
          try {
            sources = JSON.parse(allergen.commonSources);
          } catch (e) {
            sources = [];
          }

          return (
            <div key={allergen.id} className="card flex" style={{ gap: "var(--space-4)", alignItems: "flex-start" }}>
              <div 
                className="flex-center" 
                style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-md)",
                  flexShrink: 0
                }}
              >
                <AllergenIcon allergenSlug={allergen.slug} size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex" style={{ alignItems: "center", gap: "var(--space-2)" }}>
                  <h3 style={{ fontSize: "var(--fs-base)" }}>{allergen.name}</h3>
                  <span className="badge" style={{ fontSize: "9px", padding: "1px 4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
                    EU No. {allergen.euNumber}
                  </span>
                </div>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {allergen.description}
                </p>
                {sources.length > 0 && (
                  <div style={{ marginTop: "var(--space-1)" }}>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--accent-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Common sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5" style={{ marginTop: "4px" }}>
                      {sources.map((src) => (
                        <span 
                          key={src} 
                          className="badge" 
                          style={{ 
                            fontSize: "9px", 
                            padding: "1px 5px", 
                            background: "rgba(255,255,255,0.02)", 
                            border: "1px solid rgba(255,255,255,0.03)", 
                            color: "var(--text-secondary)" 
                          }}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
