import json
import urllib.request
import urllib.parse
import time
import random
from bs4 import BeautifulSoup
import os
import re

CACHE_PATH = "data/cache_scraped_data.json"

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

def clean_restaurant_name(name):
    # Strip common legal suffixes to improve search accuracy
    name = re.sub(r'\b(2004|INC|LTD|LLC|CORP|CO|RESTAURANT|RESTAURANTS|LIMITED|INCORPORATED)\b', '', name, flags=re.IGNORECASE)
    return name.strip()

def resolve_domain(name):
    clean_name = clean_restaurant_name(name)
    query = f"{clean_name} Victoria BC official website"
    # Search DuckDuckGo HTML
    search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://duckduckgo.com/'
    }
    
    req = urllib.request.Request(search_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            soup = BeautifulSoup(response.read(), 'html.parser')
            # First result link
            a_tag = soup.find('a', class_='result__url')
            if a_tag:
                href = a_tag['href']
                if "uddg=" in href:
                    parsed = urllib.parse.urlparse(href)
                    qs = urllib.parse.parse_qs(parsed.query)
                    if 'uddg' in qs:
                        return qs['uddg'][0]
                return href.strip()
    except Exception as e:
        print(f"  [Search Error] {name}: {e}")
    return None

def main():
    if not os.path.exists(CACHE_PATH):
        print(f"Cache file {CACHE_PATH} not found.")
        return

    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)

    print(f"Starting domain resolution for all {len(cache)} restaurants...")
    
    resolved_count = 0
    skipped_count = 0
    
    for i, (name, details) in enumerate(cache.items()):
        current_url = details.get("website_url", "")
        
        # Check if the URL is already a real domain (not the simulated one containing underscores)
        is_simulated = "_" in current_url or current_url.endswith("_") or "www." + re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_') in current_url
        
        if not is_simulated and current_url:
            # Already resolved previously, skip to save requests
            skipped_count += 1
            continue
            
        print(f"[{i+1}/{len(cache)}] Searching website for: {name}")
        real_url = resolve_domain(name)
        
        if real_url:
            clean_domain = real_url.replace("https://", "").replace("http://", "").split("/")[0]
            if clean_domain.startswith("www."):
                clean_domain = clean_domain[4:]
            print(f"  -> Resolved: {clean_domain} ({real_url})")
            details["website_url"] = clean_domain
            details["website_full_url"] = real_url
            resolved_count += 1
            
            # Save progress incrementally to avoid data loss on block/interrupt
            with open(CACHE_PATH, "w") as f:
                json.dump(cache, f, indent=2)
        else:
            print("  -> Resolution failed.")
            
        # Politeness sleep (6-12 seconds)
        sleep_time = random.uniform(6.0, 12.0)
        time.sleep(sleep_time)

    print(f"\nWebsite resolution completed.")
    print(f"Skipped: {skipped_count} (already resolved)")
    print(f"Newly Resolved: {resolved_count} / {len(cache) - skipped_count}")

if __name__ == "__main__":
    main()
