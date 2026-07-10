import json
import urllib.request
import urllib.parse
import time
from bs4 import BeautifulSoup
import os
import re

CACHE_PATH = "data/cache_scraped_data.json"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def resolve_via_google(name):
    # Clean legal suffixes like "(2004) INC" or "LTD" to make Google searches more effective
    clean_name = re.sub(r'\b(2004|INC|LTD|LLC|CORP|CO|RESTAURANT|RESTAURANTS)\b', '', name, flags=re.IGNORECASE).strip()
    query = f"{clean_name} Victoria BC official website"
    search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"
    
    req = urllib.request.Request(search_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            soup = BeautifulSoup(response.read(), 'html.parser')
            # Look for <a> tags with href containing http/https
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                
                # Check for standard Google search result links
                if href.startswith("http") and not any(x in href for x in ["google.com", "google.ca", "facebook.com", "instagram.com", "yelp.", "tripadvisor.", "twitter.com", "youtube.com", "foursquare.com", "yellowpages."]):
                    links.append(href)
            
            if links:
                return links[0]
    except Exception as e:
        print(f"  [Google Search Error] {name}: {e}")
    return None

def main():
    if not os.path.exists(CACHE_PATH):
        print(f"Cache file {CACHE_PATH} not found.")
        return

    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)

    print("Resolving real websites using Google Search for the first 15 restaurants...")
    keys = list(cache.keys())[:15]
    
    updated_count = 0
    for name in keys:
        details = cache[name]
        old_url = details.get("website_url", "")
        
        # Skip if already resolved (e.g. not ending in .ca from the simulator pattern)
        if "_" not in old_url and "www." in old_url and not old_url.endswith("_"):
            # Wait, let's resolve it anyway to ensure it's correct
            pass
            
        print(f"Searching: {name}")
        real_url = resolve_via_google(name)
        if real_url:
            clean_domain = real_url.replace("https://", "").replace("http://", "").split("/")[0]
            print(f"  Resolved: {old_url} => {clean_domain} ({real_url})")
            details["website_url"] = clean_domain
            details["website_full_url"] = real_url
            updated_count += 1
        else:
            print("  Failed to resolve.")
        
        # Politeness delay
        time.sleep(3)

    if updated_count > 0:
        with open(CACHE_PATH, "w") as f:
            json.dump(cache, f, indent=2)
        print(f"\nSuccessfully updated {updated_count} websites in cache.")
    else:
        print("\nNo websites were updated.")

if __name__ == "__main__":
    main()
