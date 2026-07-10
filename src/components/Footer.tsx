import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-disclaimer">
          ⚠️ <strong>Important Disclaimer:</strong> Allergen information on this
          site is AI-inferred from menu descriptions and may not be 100%
          accurate. Cross-contamination risks are not accounted for. Always
          confirm allergen information directly with the restaurant before
          ordering, especially if you have severe allergies.
        </div>

        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/" className="site-logo" style={{ fontSize: "1.125rem" }}>
              <span className="text-gradient">YYJ</span> Allergen-Aware Eats
            </Link>
            <p>
              Helping diners with food allergies find safe meals across Victoria
              BC and the Capital Regional District. Built with the EU&apos;s 14
              declarable allergens framework.
            </p>
          </div>

          <div className="footer-links">
            <h4>Navigate</h4>
            <ul>
              <li><Link href="/restaurants">Restaurants</Link></li>
              <li><Link href="/allergens">Allergen Guide</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li>
                <a
                  href="https://food.ec.europa.eu/food-safety/campaign-2026/allergies_en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EU Allergen Regulation
                </a>
              </li>
              <li>
                <a
                  href="https://foodallergycanada.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Food Allergy Canada
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Made with ♥ in Victoria, BC</span>
          <span>© {new Date().getFullYear()} YYJ Allergen-Aware Eats</span>
        </div>
      </div>
    </footer>
  );
}
