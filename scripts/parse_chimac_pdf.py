import urllib.request
import os
import json
import re
import pypdf

PDF_URL = "https://firebasestorage.googleapis.com/v0/b/cold-fusion-9419a.appspot.com/o/restaurants%2FpdfMenus%2FChimac%20Menu.pdf?alt=media&token=3c829bb3-a7f6-4005-b894-a2bc2c7506b9"
PDF_DIR = "data/raw_menus/pdf"
TXT_DIR = "data/raw_menus/txt"
CACHE_PATH = "data/cache_scraped_data.json"

def main():
    os.makedirs(PDF_DIR, exist_ok=True)
    os.makedirs(TXT_DIR, exist_ok=True)
    
    # 1. Download PDF
    pdf_path = os.path.join(PDF_DIR, "chimac_korean_pub___fried_chicken.pdf")
    print(f"Downloading Chimac menu PDF to {pdf_path}...")
    
    req = urllib.request.Request(PDF_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open(pdf_path, 'wb') as f:
            f.write(response.read())
            
    print("Download complete.")

    # 2. Extract Text using pypdf
    txt_path = os.path.join(TXT_DIR, "chimac_korean_pub___fried_chicken.txt")
    print(f"Extracting text from PDF to {txt_path}...")
    
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + "\n"
            
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
        
    print(f"Extraction complete. Extracted {len(text)} characters of text.")

    # 3. Update Cache JSON
    print("Updating cache JSON with real website URL and menu scraped status...")
    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)
        
    key = "CHIMAC KOREAN PUB & FRIED CHICKEN"
    if key in cache:
        cache[key]["website_url"] = "firebasestorage.googleapis.com"
        cache[key]["website_full_url"] = PDF_URL
        cache[key]["menu_scraped_status"] = "real"
        cache[key]["menu_text"] = text
        
        # Check if the text contains allergen symbols or disclaimers
        text_lower = text.lower()
        has_symbols = False
        # Search for GF, DF, V, VG in text
        if re.search(r'\b(gf|df|v|vg)\b', text_lower) or "gluten-free" in text_lower:
            has_symbols = True
            
        has_statement = False
        if any(w in text_lower for w in ["allergy", "allergies", "allergic", "disclaimer", "cross-contaminat", "alert"]):
            has_statement = True
            
        cache[key]["has_allergen_symbols"] = has_symbols
        cache[key]["has_allergen_statement"] = has_statement
        
        print(f"Auto-coded Chimac menu:")
        print(f"  - Has Allergen Symbols: {has_symbols}")
        print(f"  - Has Allergen Statement: {has_statement}")
    else:
        print(f"Warning: '{key}' not found in cache.")

    with open(CACHE_PATH, "w") as f:
        json.dump(cache, f, indent=2)

    # 4. Run database seeder to fit regressions on the updated dataset
    print("\nRe-running database seeder and re-fitting statistical regressions...")
    import subprocess
    subprocess.run(["npx", "tsx", "src/db/seed.ts"], check=True)
    print("Database and manuscript stats updated successfully!")

if __name__ == "__main__":
    main()
