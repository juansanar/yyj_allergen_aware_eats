import json
import os
import re
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import pypdf

CACHE_PATH = "data/cache_scraped_data.json"
PDF_DIR = "data/raw_menus/pdf"
TXT_DIR = "data/raw_menus/txt"

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(TXT_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def download_file(url, filepath):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(filepath, 'wb') as f:
                f.write(response.read())
            return True
    except Exception as e:
        print(f"  [Error] Failed to download {url}: {e}")
        return False

def get_soup(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read()
            return BeautifulSoup(html, 'html.parser'), response.geturl()
    except Exception as e:
        print(f"  [Error] Failed to fetch {url}: {e}")
        return None, None

def extract_pdf_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"  [Error] Failed to extract text from PDF {pdf_path}: {e}")
        return ""

def scrape_restaurant_menu(name, details):
    slug = re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_')
    print(f"\nAuditing: {name}")
    
    # Try using TripAdvisor search or the cached domain
    domain = details.get("website_url", "")
    if not domain:
        print("  No website URL found in cache.")
        return False

    homepage_url = f"http://{domain}" if not domain.startswith("http") else domain
    print(f"  Visiting homepage: {homepage_url}")
    
    soup, final_url = get_soup(homepage_url)
    if not soup:
        return False

    # 1. Search for menu links
    menu_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        text = a.get_text().lower()
        href_lower = href.lower()
        
        # Check if link text or href contains menu keywords
        if any(kw in text or kw in href_lower for kw in ["menu", "food", "dinner", "lunch", "eat", "dishes"]):
            # Resolve relative URLs
            full_url = urllib.parse.urljoin(final_url, href)
            if full_url not in menu_links:
                menu_links.append(full_url)

    print(f"  Discovered {len(menu_links)} potential menu page links.")

    # 2. Check each menu link for text or PDF menus
    menu_content_found = False
    for link in menu_links[:5]: # Limit to first 5 matches to avoid crawling loops
        print(f"    Scanning link: {link}")
        
        if link.lower().endswith(".pdf"):
            # It's a PDF link! Download and parse it
            pdf_path = os.path.join(PDF_DIR, f"{slug}.pdf")
            txt_path = os.path.join(TXT_DIR, f"{slug}.txt")
            print(f"    Found PDF Menu! Downloading: {link}")
            if download_file(link, pdf_path):
                pdf_text = extract_pdf_text(pdf_path)
                if pdf_text.strip():
                    with open(txt_path, "w") as f:
                        f.write(pdf_text)
                    print(f"    Successfully extracted PDF menu text ({len(pdf_text)} chars).")
                    menu_content_found = True
                    break
        else:
            # Regular webpage. Fetch and parse text
            sub_soup, _ = get_soup(link)
            if sub_soup:
                # Check if this subpage has another PDF link inside it
                pdf_link = None
                for sub_a in sub_soup.find_all('a', href=True):
                    sub_href = sub_a['href']
                    if sub_href.lower().endswith(".pdf"):
                        pdf_link = urllib.parse.urljoin(link, sub_href)
                        break
                
                if pdf_link:
                    pdf_path = os.path.join(PDF_DIR, f"{slug}.pdf")
                    txt_path = os.path.join(TXT_DIR, f"{slug}.txt")
                    print(f"      Found PDF Menu link in page! Downloading: {pdf_link}")
                    if download_file(pdf_link, pdf_path):
                        pdf_text = extract_pdf_text(pdf_path)
                        if pdf_text.strip():
                            with open(txt_path, "w") as f:
                                f.write(pdf_text)
                            print(f"      Successfully extracted PDF menu text ({len(pdf_text)} chars).")
                            menu_content_found = True
                            break
                
                # Otherwise, extract the body text of the webpage
                page_text = sub_soup.get_text()
                cleaned = clean_text(page_text)
                
                # Simple validation to ensure it looks like a menu
                if any(kw in cleaned.lower() for kw in ["price", "appetizer", "salad", "entrée", "dessert", "mains"]):
                    txt_path = os.path.join(TXT_DIR, f"{slug}.txt")
                    with open(txt_path, "w") as f:
                        f.write(page_text)
                    print(f"    Saved HTML menu page text ({len(cleaned)} chars).")
                    menu_content_found = True
                    break

    if not menu_content_found:
        print("    [Warning] Could not extract menu text automatically. Needs manual audit.")
        return False
    return True

def main():
    if not os.path.exists(CACHE_PATH):
        print(f"Cache file {CACHE_PATH} not found. Run generate_cache.py first.")
        return

    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)

    print(f"Starting crawl for {len(cache)} restaurants...")
    success_count = 0
    for name, details in list(cache.items())[:10]: # Let's run a test on the first 10 restaurants
        if scrape_restaurant_menu(name, details):
            success_count += 1
            
    print(f"\nScraping complete. Successfully scraped {success_count} / 10 menus.")
    print("Check 'data/raw_menus/' for results.")

if __name__ == "__main__":
    main()
