import json
import urllib.request
import urllib.parse
import time
from bs4 import BeautifulSoup
import os

CACHE_PATH = "data/cache_scraped_data.json"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def resolve_real_url(name):
    query = f"{name} Victoria BC restaurant official website"
    search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    req = urllib.request.Request(search_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            soup = BeautifulSoup(response.read(), 'html.parser')
            # Look for the first result URL
            a_tag = soup.find('a', class_='result__url')
            if a_tag:
                href = a_tag['href']
                # Clean DuckDuckGo redirect wrapper if present
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

    print("Resolving real websites for the first 10 restaurants...")
    keys = list(cache.keys())[:10]
    
    updated_count = 0
    for name in keys:
        details = cache[name]
        old_url = details.get("website_url", "")
        print(f"Searching for: {name}")
        
        real_url = resolve_real_url(name)
        if real_url:
            # Parse out the clean domain name or use full URL
            clean_domain = real_url.replace("https://", "").replace("http://", "").split("/")[0]
            print(f"  Resolved: {old_url} => {clean_domain} ({real_url})")
            details["website_url"] = clean_domain
            details["website_full_url"] = real_url
            updated_count += 1
        else:
            print("  Failed to resolve website.")
        
        # Rate limit safety sleep
        time.sleep(2)

    if updated_count > 0:
        # Write updates back to cache file
        with open(CACHE_PATH, "w") as f:
            json.dump(cache, f, indent=2)
        print(f"\nSuccessfully resolved and updated {updated_count} / 10 websites in cache.")
    else:
        print("\nNo websites were updated.")

if __name__ == "__main__":
    main()
