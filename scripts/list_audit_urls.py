import json
import os
import urllib.parse

CACHE_PATH = "data/cache_scraped_data.json"
CHECKLIST_PATH = "data/audit_checklist.md"

def load_cache():
    if not os.path.exists(CACHE_PATH):
        raise FileNotFoundError(f"Cache file {CACHE_PATH} not found. Run generate_cache.py first.")
    with open(CACHE_PATH, "r") as f:
        return json.load(f)

def main():
    try:
        cache = load_cache()
    except Exception as e:
        print("Error loading cache:", e)
        return

    lines = []
    lines.append("# Victoria Restaurant Allergen Audit Checklist")
    lines.append("")
    lines.append("Use this checklist to audit the online menus of the 100 sampled restaurants. Clicking the search links will pre-fill Google searches for each restaurant's menus.")
    lines.append("")
    lines.append("### Instructions for Auditor:")
    lines.append("1. Click the **Website** link or the **Google/Yelp Search** links to find the online menu.")
    lines.append("2. Audit the menu for the 5-item checklist: Symbols, Statement, Separate Menu, separate Chart.")
    lines.append("3. Update the corresponding entries in `data/cache_scraped_data.json` with the real attributes and raw `menu_text`.")
    lines.append("4. Re-run `npx tsx src/db/seed.ts` to automatically re-fit the GEE regressions and update the paper & web app.")
    lines.append("")
    lines.append("| No. | Restaurant Name | Neighborhood | Website / Search Links | Symbols? | Statement? | Separate Menu? | Chart? | Verified? |")
    lines.append("| --- | --- | --- | --- | :---: | :---: | :---: | :---: | :---: |")

    for i, (name, details) in enumerate(cache.items()):
        trade_name = details["trade_name"]
        website = details["website_url"]
        neighborhood = details.get("neighborhood", "DOWNTOWN")
        
        # Construct search queries
        google_query = f"{trade_name} Victoria BC online menu"
        google_search_url = f"https://www.google.com/search?q={urllib.parse.quote(google_query)}"
        
        yelp_query = f"{trade_name} Victoria BC Yelp"
        yelp_search_url = f"https://www.google.com/search?q={urllib.parse.quote(yelp_query)}"
        
        tripadvisor_query = f"{trade_name} Victoria BC TripAdvisor"
        tripadvisor_search_url = f"https://www.google.com/search?q={urllib.parse.quote(tripadvisor_query)}"

        # Pre-coded placeholders from simulation (shown to guide auditor)
        sym_status = "Yes (sim)" if details["has_allergen_symbols"] else "No (sim)"
        state_status = "Yes (sim)" if details["has_allergen_statement"] else "No (sim)"
        menu_status = "Yes (sim)" if details["has_separate_menu"] else "No (sim)"
        chart_status = "Yes (sim)" if details["has_separate_chart"] else "No (sim)"

        links_str = f"[Web](https://{website}) / [Google]({google_search_url}) / [Yelp]({yelp_search_url}) / [TA]({tripadvisor_search_url})"
        
        lines.append(f"| {i+1} | **{trade_name}** | {neighborhood} | {links_str} | {sym_status} | {state_status} | {menu_status} | {chart_status} | `[ ]` |")

    with open(CHECKLIST_PATH, "w") as f:
        f.write("\n".join(lines))
        
    print(f"Audit checklist successfully generated at: {CHECKLIST_PATH}")

if __name__ == "__main__":
    main()
