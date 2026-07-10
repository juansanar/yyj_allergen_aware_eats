import json
import os
import sys

SAMPLE_PATH = "data/selected_sample.json"
CACHE_PATH = "data/cache_scraped_data.json"

def replace_restaurant(exclude_name):
    if not os.path.exists(SAMPLE_PATH):
        print(f"Sample file {SAMPLE_PATH} not found.")
        return False

    with open(SAMPLE_PATH, "r") as f:
        sample_data = json.load(f)

    primary = sample_data["primary_sample"]
    backup = sample_data["backup_list"]

    # Search for the restaurant to exclude
    found_idx = -1
    for idx, r in enumerate(primary):
        if r["name"].strip().upper() == exclude_name.strip().upper():
            found_idx = idx
            break

    if found_idx == -1:
        print(f"Restaurant '{exclude_name}' not found in the primary sample.")
        return False

    # Perform substitution
    excluded_item = primary.pop(found_idx)
    if not backup:
        print("Error: No replacement restaurants left in the backup list!")
        return False
        
    replacement_item = backup.pop(0)
    primary.append(replacement_item)

    print(f"\n--- Replacement Protocol Executed ---")
    print(f"Excluded: {excluded_item['name']} ({excluded_item['address']})")
    print(f"Replaced with: {replacement_item['name']} ({replacement_item['address']})")
    print(f"Remaining backup pool size: {len(backup)} items")

    # Save updated sample
    with open(SAMPLE_PATH, "w") as f:
        json.dump(sample_data, f, indent=2)

    # Regenerate cache while preserving existing real scrapes
    print("\nRegenerating cache and preserving existing verified websites/scrapes...")
    
    # Save a temporary copy of existing cache urls and scraping status
    old_cache = {}
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "r") as f:
            old_cache = json.load(f)

    # Run cache generator to update JSON structure with the new restaurant list
    import subprocess
    subprocess.run(["python3", "scripts/generate_cache.py"], check=True)

    # Load newly generated cache and merge verified url and scrape fields from old cache
    with open(CACHE_PATH, "r") as f:
        new_cache = json.load(f)

    merged_count = 0
    for name, details in new_cache.items():
        if name in old_cache:
            # Preserve verified real website urls and scrape statuses
            details["website_url"] = old_cache[name].get("website_url", details["website_url"])
            details["website_full_url"] = old_cache[name].get("website_full_url", details.get("website_full_url"))
            details["menu_scraped_status"] = old_cache[name].get("menu_scraped_status", details.get("menu_scraped_status"))
            merged_count += 1

    with open(CACHE_PATH, "w") as f:
        json.dump(new_cache, f, indent=2)

    print(f"Merged scraping status for {merged_count} existing restaurants.")
    print("Updates saved to cache JSON.")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/replace_restaurant.py \"RESTAURANT NAME\"")
        sys.exit(1)
        
    exclude_name = sys.argv[1]
    if replace_restaurant(exclude_name):
        # Automatically update database and statistics
        print("\nRe-fitting statistical models and updating SQLite database...")
        import subprocess
        subprocess.run(["npx", "tsx", "src/db/seed.ts"], check=True)
        print("Database and study results updated successfully!")

if __name__ == "__main__":
    main()
