import urllib.request
import csv
import io
import json
import random
import os

LICENSE_CSV_URL = "https://hub.arcgis.com/api/v3/datasets/271d96c9121d47498723b1d586e44c00_1/downloads/data?format=csv&spatialRefId=3157&where=1%3D1"
SAMPLE_OUTPUT_PATH = "data/selected_sample.json"

# List of major chains to exclude (>20 locations in Canada)
CHAIN_KEYWORDS = [
    "SUBWAY", "BOOSTER JUICE", "LITTLE CAESARS", "FRESHII", "FATBURGER", 
    "PIZZA PIZZA", "DOMINO'S", "STARBUCKS", "MCDONALD'S", "A&W", 
    "TIM HORTONS", "DAIRY QUEEN", "DQ", "WENDY'S", "BURGER KING", 
    "KFC", "TACO BELL", "PANAGO PIZZA", "BOSTON PIZZA", "PAPA JOHNS"
]

def is_chain(name):
    upper_name = name.upper()
    return any(keyword in upper_name for keyword in CHAIN_KEYWORDS)

def main():
    print("Downloading live Victoria Business Licences...")
    req = urllib.request.Request(LICENSE_CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8-sig')
            all_rows = list(csv.DictReader(io.StringIO(content)))
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # Filter for active restaurants strictly matching full-service/limited-service eating places
    restaurants = []
    
    EXCLUDE_KEYWORDS = [
        "HOTEL", "MOTEL", "INN", "SUITES", "HOSTEL", "ACCOMMODATION", "LODGING", "MANOR", "BED & BREAKFAST", "B&B",
        "CAFE", "CAFÉ", "CAFFE", "COFFEE", "BAKERY", "BAKESHOP", "ROASTERS", "TEA HOUSE", "TEA ROOM", "ICE CREAM",
        "GELATO", "DONUT", "JUICE", "SMOOTHIE", "SWEETS", "SNACK", "CATERING", "NIGHTCLUB", "PUB", "BAR", "CLUB",
        "BREWING", "WINERY", "DISTILLERY", "HOLDINGS", "SOLUTIONS", "CONSULTING", "ENTERPRISES", "INVESTMENTS",
        "ASSOCIATION", "SYSTEMS", "GROUP", "MANAGEMENT", "SERVICES", "SOCIETY", "MUSEUM", "THEATRE", "CINEMA",
        "ARENA", "SCHOOL", "UNIVERSITY", "COLLEGE", "CHURCH", "TEMPLE", "HOSPITAL", "CLINIC"
    ]
    
    for row in all_rows:
        status = row.get("licence_status", "")
        naics = row.get("naics_description", "")
        
        is_active = (status == "APPROVED")
        # Strictly select Full-Service Restaurants & Limited-Service Eating Places (excludes lodging, taverns, catering)
        is_restaurant_naics = (naics == "Accommodation & food services / Food services & drinking places / Full-serv. rest. & limited-serv. eating place")
        
        if is_active and is_restaurant_naics:
            trade_name = row.get("TRADE_NAME", "").strip()
            if not trade_name:
                continue
                
            upper_name = trade_name.upper()
            
            # Exclude corporate holdings, individual personal names (e.g. containing comma), and lodging/cafes
            is_excluded = (
                "," in trade_name or
                any(keyword in upper_name for keyword in EXCLUDE_KEYWORDS) or
                is_chain(trade_name)
            )
            
            if not is_excluded:
                restaurants.append({
                    "name": trade_name,
                    "address": row.get("CIVIC_ADDRESS", "").strip(),
                    "neighborhood": row.get("Neighbourhood", "DOWNTOWN").strip(),
                    "latitude": float(row.get("Y")) if row.get("Y") else None,
                    "longitude": float(row.get("X")) if row.get("X") else None,
                    "licence_number": row.get("LICENCE_NUMBER", "")
                })

    print(f"Total eligible nonchain restaurants: {len(restaurants)}")

    # Set seed for exact scientific replication
    random.seed(42)
    
    # Shuffle the list
    random.shuffle(restaurants)

    # Split into target sample and replacement backups, ensuring unique trade names
    seen_names = set()
    primary_sample = []
    backup_list = []
    
    for r in restaurants:
        name = r["name"].strip().upper()
        if name not in seen_names:
            seen_names.add(name)
            if len(primary_sample) < 100:
                primary_sample.append(r)
            elif len(backup_list) < 50:
                backup_list.append(r)

    output_data = {
        "seed": 42,
        "total_eligible_population": len(restaurants),
        "primary_sample": primary_sample,
        "backup_list": backup_list
    }

    os.makedirs("data", exist_ok=True)
    with open(SAMPLE_OUTPUT_PATH, "w") as f:
        json.dump(output_data, f, indent=2)

    print(f"Successfully drew 100 primary restaurants and 50 backup replacements.")
    print(f"Saved selections to: {SAMPLE_OUTPUT_PATH}")

if __name__ == "__main__":
    main()
