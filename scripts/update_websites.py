import json
import os

CACHE_PATH = "data/cache_scraped_data.json"

updates = {
    "BLOCK KITCHEN AND BAR": "blockvictoria.ca",
    "FISHER HOUSE BED & BREAKFAST": "fisherhousevictoria.com",
    "SEN ZUSHI (2004) INC": "senzushi.com",
    "DISCOVERY COFFEE": "discoverycoffee.com",
    "49 BELOW ICE CREAM": "49below.ca",
    "LA TAQUISA RESTAURANT": "lataquisa.com",
    "CERA": "ceratapas.com",
    "HOTEL GRAND PACIFIC": "hotelgrandpacific.com"
}

def main():
    if not os.path.exists(CACHE_PATH):
        print(f"Cache file {CACHE_PATH} not found.")
        return

    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)

    updated = 0
    for name, domain in updates.items():
        if name in cache:
            old = cache[name].get("website_url", "")
            cache[name]["website_url"] = domain
            cache[name]["website_full_url"] = f"https://{domain}"
            print(f"Updated '{name}': {old} => {domain}")
            updated += 1
        else:
            print(f"Restaurant '{name}' not found in current primary sample.")

    if updated > 0:
        with open(CACHE_PATH, "w") as f:
            json.dump(cache, f, indent=2)
        print(f"Successfully saved {updated} website updates in cache.")

if __name__ == "__main__":
    main()
