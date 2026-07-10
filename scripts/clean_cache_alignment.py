import json
import os
import subprocess

SAMPLE_PATH = "data/selected_sample.json"
CACHE_PATH = "data/cache_scraped_data.json"

def main():
    if not os.path.exists(CACHE_PATH):
        print("Cache file not found.")
        return

    # 1. Load current cache (which has resolved URLs)
    with open(CACHE_PATH, "r") as f:
        old_cache = json.load(f)

    # 2. Re-run generate_cache.py to build cache based strictly on the clean selected_sample.json
    print("Regenerating clean cache based on selected_sample.json...")
    subprocess.run(["python3", "scripts/generate_cache.py"], check=True)

    # 3. Load the regenerated cache
    with open(CACHE_PATH, "r") as f:
        new_cache = json.load(f)

    # 4. Merge scraping status and URLs from old cache
    merged_count = 0
    removed_count = 0
    
    # Identify what got removed
    old_names = set(old_cache.keys())
    new_names = set(new_cache.keys())
    removed_restaurants = old_names - new_names
    
    for name, details in new_cache.items():
        if name in old_cache:
            # Restore resolved website info and scrape status
            details["website_url"] = old_cache[name].get("website_url", details["website_url"])
            details["website_full_url"] = old_cache[name].get("website_full_url", details.get("website_full_url"))
            details["menu_scraped_status"] = old_cache[name].get("menu_scraped_status", details.get("menu_scraped_status"))
            merged_count += 1

    # Save merged cache
    with open(CACHE_PATH, "w") as f:
        json.dump(new_cache, f, indent=2)

    print(f"\n--- Alignment Completed ---")
    print(f"Removed from cache: {list(removed_restaurants)}")
    print(f"Preserved URLs & scraping status for {merged_count} matching restaurants.")
    
    # 5. Re-run database seeder once at the end
    print("\nRe-fitting statistical regressions and updating SQLite database...")
    subprocess.run(["npx", "tsx", "src/db/seed.ts"], check=True)
    print("Database aligned and updated successfully!")

if __name__ == "__main__":
    main()
