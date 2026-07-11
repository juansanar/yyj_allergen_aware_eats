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

# Pre-defined mapping of known brands to guarantee instant correct domain resolution
KNOWN_DOMAINS = {
    "WHITE SPOT": "https://www.whitespot.ca/",
    "TACO TIME": "https://www.tacotimecanada.com/",
    "DENNYS RESTAURANT": "https://www.dennys.ca/",
    "IL TERRAZZO": "https://www.ilterrazzo.com/",
    "KINTON RAMEN VICTORIA DOWNTOWN": "https://kintonramen.com/location/victoria-downtown/",
    "EARL'S RESTAURANT (THE BAY CENTRE) LTD": "https://earls.ca/",
    "NEW YORK FRIES": "https://www.newyorkfries.com/",
    "MARBLE SLAB CREAMERY": "https://www.marbleslab.ca/",
    "OPA SOUVLAKI": "https://opasouvlaki.ca/",
    "BROWNS SOCIALHOUSE": "https://www.brownssocialhouse.com/",
    "BB.Q CHICKEN": "https://bbqchickenca.com/",
    "A&W RESTAURANT": "https://web.aw.ca/en/home",
    "OLD SPAGHETTI FACTORY": "https://oldspaghettifactory.ca/locations/victoria/",
    "KENTUCKY FRIED CHICKEN #1980": "https://www.kfc.ca/",
    "HESLAA SRILANKA": "https://www.facebook.com/HESLAAsrilanka/",
    "NUBO SUSHI": "https://www.nubosushi.com/",
    "HOPE KEY RESTAURANT": "http://www.hopekeyrestaurant.ca/",
    "SALLY BUN": "https://sallybun.com/",
    "WHEELIES MOTORCYCLES": "https://www.wheeliesmotorcycles.ca/",
    "REFUGE TAP ROOM": "https://www.refugetaproom.com/",
    "GOLDEN CITY RESTAURANT": "https://www.goldencityvictoria.com/",
    "BIKIMBAB": "https://www.bikimbab.ca/",
    "STANDARD PIZZA": "https://standardpizza.ca/",
    "UGLY DUCKLING": "https://uglyducklingdinings.com/",
    "GOOD FILLING SANKAKU": "https://www.instagram.com/goodfillingsankaku/",
    "MR. PRETZELS": "https://mrpretzels.ca/",
    "ROYALITY PIZZA": "https://royaltypizza.ca/",
    "UCHIDA EATERY": "https://www.uchidaeatery.com/",
    "BEIJING BISTRO": "http://beijingbistrovictoria.com/",
    "PEACOCK BILLARDS": "http://peacockbilliards.com/",
    "THE FORT": "https://www.facebook.com/thefortcommon/",
    "SMASHYY & MORE": "https://www.smashyyandmore.com/",
    "CHOCOLAT & CO": "https://chocolatandco.ca/",
    "FOO ASIAN STREET FOOD": "http://foostreetfood.ca/",
    "PIZZA GARDEN": "https://pizzagarden.ca/",
    "CHICKEN 649": "https://chicken649.ca/",
    "SIZZLING WOK": "https://sizzlingwok.com/",
    "BAAN THAI RESTAURANT": "https://baanthai.com/",
    "THE ART OF SLOW FOOD": "https://theartofslowfood.com/",
    "HAULTAIN FISH & CHIPS": "https://haultainfishandchips.ca/",
    "JIANGYUN NOODLE HOUSE": "https://jiangyunnoodlehouse.ca/",
    "OCEAN GARDEN RESTAURANT": "https://oceangardenvictoria.com/",
    "CENOTE RESTURANT AND LOUNGE": "https://www.cenotelounge.ca/",
    "FRANKIE'S MODERN DINER": "https://frankiesmoderndiner.com/",
    "RED FISH BLUE FISH": "https://www.redfishbluefish.com/",
}

def resolve_domain_lite(name):
    clean_name = clean_restaurant_name(name)
    query = f"{clean_name} Victoria BC official menu website"
    url = "https://lite.duckduckgo.com/lite/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            soup = BeautifulSoup(response.read(), 'html.parser')
            # Look at td result links inside the simple table layout
            for td in soup.find_all('td', class_='result-link'):
                a = td.find('a')
                if a and 'href' in a.attrs:
                    href = a['href']
                    if not any(k in href for k in ["duckduckgo.com", "bing.com", "google.com", "yahoo.com"]):
                        return href.strip()
    except Exception as e:
        print(f"  [Lite Search Error] {name}: {e}")
    return None

def resolve_domain(name):
    # 1. Check known domains dictionary bypass
    name_upper = name.strip().upper()
    for brand, url in KNOWN_DOMAINS.items():
        if brand in name_upper:
            return url
            
    # 2. Try standard HTML search
    clean_name = clean_restaurant_name(name)
    query = f"{clean_name} Victoria BC official website"
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
        pass
        
    # 3. Fallback to DuckDuckGo Lite search
    return resolve_domain_lite(name)

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
            
        # Politeness sleep (1.5 - 3.5 seconds)
        sleep_time = random.uniform(1.5, 3.5)
        time.sleep(sleep_time)

    print(f"\nWebsite resolution completed.")
    print(f"Skipped: {skipped_count} (already resolved)")
    print(f"Newly Resolved: {resolved_count} / {len(cache) - skipped_count}")

if __name__ == "__main__":
    main()
