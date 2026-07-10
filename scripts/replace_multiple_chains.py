import sys
import os

# Include the replace function logic directly to execute them sequentially
from replace_restaurant import replace_restaurant

chains_to_replace = [
    "PITA LAND",
    "TRAVELODGE VICTORIA",
    "BB.Q CHICKEN",
    "ALL FORTUNE CONSULTING LTD\r\nHOWARD JOHNSON HOTEL",
    "QUALITY INN DOWNTOWN INNER HARBOUR VICTORIA",
    "DELTA VICTORIA OCEAN POINTE RESORT AND SPA"
]

def main():
    print(f"Excluding and replacing {len(chains_to_replace)} national/hotel chains...")
    
    success_count = 0
    for name in chains_to_replace:
        print(f"\nReplacing: {name}")
        try:
            if replace_restaurant(name):
                success_count += 1
        except Exception as e:
            print(f"Failed to replace '{name}': {e}")
            
    print(f"\nSuccessfully replaced {success_count} / {len(chains_to_replace)} chains.")
    
    # Run the database seeder once at the end
    print("\nRe-fitting regressions and seeding database with the updated 100-restaurant dataset...")
    import subprocess
    subprocess.run(["npx", "tsx", "src/db/seed.ts"], check=True)
    print("Database and study results updated successfully!")

if __name__ == "__main__":
    main()
