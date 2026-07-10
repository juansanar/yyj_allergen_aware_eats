from bs4 import BeautifulSoup
import os

HTML_PATH = "/Users/juansanar/.gemini/antigravity-ide/brain/c5de014f-26dd-4c5d-9eb8-7126e7552ab3/.system_generated/steps/366/content.md"

def main():
    if not os.path.exists(HTML_PATH):
        print("HTML file not found.")
        return
        
    with open(HTML_PATH, "r") as f:
        html_content = f.read()
        
    # Skip metadata headers
    body_start = html_content.find("<!DOCTYPE html>")
    if body_start != -1:
        html_content = html_content[body_start:]
        
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.extract()
        
    text = soup.get_text()
    
    # Break into lines and clear leading/trailing spaces
    lines = (line.strip() for line in text.splitlines())
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    clean_text = "\n".join(chunk for chunk in chunks if chunk)
    
    print("=== EXTRACTED TEXT (First 1500 chars) ===")
    print(clean_text[:1500])
    
    # Save the clean text version for easy reading
    with open("data/raw_menus/txt/sen_zushi_clean_extracted.txt", "w") as out:
        out.write(clean_text)
    print("\nClean text saved to data/raw_menus/txt/sen_zushi_clean_extracted.txt")

if __name__ == "__main__":
    main()
