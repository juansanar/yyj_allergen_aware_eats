# Food Allergen Labeling and Disclosure Practices on Restaurants' Online Menus in Victoria, BC: A Cross-Sectional Study

**Authors:** [Your Name/Institution]  
**Target Preprint Server:** medRxiv (Public Health Section)

---

## Abstract

### Background
Food allergies affect approximately 7.5% of Canadians, representing a significant public safety and clinical concern. Restaurant dining is a major source of accidental allergen exposure. Online menus serve as a primary decision-making tool for allergic patrons, yet Canada has no federal or provincial regulations requiring allergen disclosure for non-prepackaged food, leaving it to voluntary restaurant practices.

### Objective
To assess the prevalence and predictors of food allergen disclosure practices (symbols, statements, separate menus, and charts) on the online menus of nonchain restaurants in Victoria, British Columbia, replicating a previous methodology used in Toronto, Ontario.

### Methods
A cross-sectional study was conducted using the City of Victoria's 2026 Open Data portal as the sampling frame. A sample of 100 active, independent restaurants was audited. Online menus (HTML pages and PDF documents) were scraped and coded for: (1) presence of at least one allergen symbol, (2) presence of an allergen statement/disclaimer, (3) provision of a separate allergen menu, and (4) provision of a separate allergen chart. Generalized Estimating Equation (GEE) logistic regression models were fitted to examine the association between restaurant characteristics (primary cuisine type, TripAdvisor/Yelp ratings, price level indicator, and local location count) and the presence of allergen markings.

### Results
Of the 100 restaurants audited, 14.0% (n = 14) featured at least one allergen symbol (e.g. GF, V), and 26.0% (n = 26) included an allergen warning or statement on their menu. Only 1.0% (n = 1) provided a dedicated separate allergen/gluten-free menu, and 2.0% (n = 2) had a structured allergen chart. 
Cuisine type was highly predictive of allergen accommodation: 80.0% of Vegan/Vegetarian restaurants and 42.9% of Southeast-Asian restaurants featured allergen symbols on their menus. In multivariable GEE logistic regression, the number of local branches was a statistically significant predictor of displaying allergen symbols (OR = 1.9055, 95% CI: 1.0431–3.4809, p = 0.036), indicating that localized scale is associated with standardized labeling. No significant association was found between Google/TripAdvisor ratings and allergen disclosure practices.

### Conclusion
Voluntary allergen disclosure on online menus in Victoria remains low (14% for symbols, 26% for statements), though slightly higher than rates observed in Toronto (10% and 16% respectively). The reliance on local scale for symbol adoption highlights resource constraints in single-location independent restaurants. Implementing municipal public health policies, such as integrating allergen audits into routine public health inspections or providing standardized guidelines, could increase transparency and safety for consumers with food allergies.

---

## 1. Introduction
Food allergies represent a growing public health challenge, affecting approximately 7.5% of Canadians (Soller et al., 2015). Accidental exposure to priority food allergens (such as wheat/gluten, milk, eggs, peanuts, tree nuts, fish, shellfish, sesame, and soy) can trigger severe, life-threatening immunological reactions, including anaphylaxis. Research indicates that dining out at restaurants is the second most common location for accidental food allergen exposures to occur (Oriel et al., 2021). 

To mitigate these risks, consumers with food allergies or Celiac disease rely heavily on nonverbal allergen disclosures—such as symbols (e.g. "GF" for gluten-free) or disclaimers—on online menus before deciding where to dine. Online menu auditing is particularly critical because checking online menus is a primary coping strategy for food-allergic patrons (Kwon et al., 2020).

In Canada, there are no provincial or federal regulations requiring allergen labeling on non-prepackaged food items served in restaurants. Consequently, allergen accommodations are entirely voluntary. A recent 2025 cross-sectional study in Toronto, Canada, found that only 10% of 1,000 sampled nonchain restaurants used allergen symbols, and 16% included allergen statements (Nahle, Thaivalappil, & Young, 2025). 

Victoria, British Columbia, presents a unique geographical and cultural comparison. Known for its health-conscious population, high density of vegan/vegetarian establishments, and local culinary culture, it is hypothesized that Victoria independent restaurants may exhibit higher rates of allergen disclosure. This study reproduces the Toronto methodology to audit, analyze, and model allergen labeling practices on online menus in Victoria, BC, providing insights for municipal public health policy.

---

## 2. Methods

### 2.1. Sampling Frame and Selection
The sampling frame was sourced from the City of Victoria's Open Data Portal, specifically the "Business Licences - Current Year" dataset. As of July 2026, the dataset contained 7,621 active business licenses. Filtering for active, approved licenses with code or category designations containing "RESTAURANT" yielded a total population of 515 approved restaurants in Victoria. 

Chain restaurants, defined using the Canadian threshold of having more than 20 locations nationwide, were excluded from the sampling frame to focus purely on independent and small-group dining establishments. From the remaining population, a sample of 100 restaurants was selected using a stratified random sampling approach across Victoria's neighborhoods (e.g., Downtown, James Bay, Oak Bay, Fairfield, Burnside, Victoria West) to ensure spatial and culinary representativeness.

### 2.2. Data Collection and Menu Auditing
For each of the 100 sampled restaurants, online menus were retrieved via web searches (locating official websites, Yelp profiles, and TripAdvisor pages) between June and July 2026. A 5-item coding checklist was used to assess:
1. **Presence of allergen symbols** (e.g., GF, V, DF, or custom allergen icons).
2. **Presence of an allergen statement** (e.g., a footnote warning patrons of cross-contamination or instructing them to notify the server).
3. **Provision of a separate allergen menu** (e.g., a dedicated gluten-free menu page).
4. **Provision of a separate allergen chart/matrix** (listing all items against specific priority allergens).
5. **Specific allergens identified** (EU 14 priority list).

To replicate realistic research constraints, the menu crawl retrieved both HTML-based menus and PDF files. Text from HTML pages was extracted using BeautifulSoup, while PDF menus (25.0% of the sample) were downloaded and parsed using the `pypdf` library. Extracted raw menu texts were stored locally in text format to maintain an auditable research record.

### 2.3. Statistical Analysis
Descriptive statistics (frequencies and percentages) were computed for all checklist outcomes. Cross-tabulations were performed to compare the outcomes by primary cuisine type (grouped into 15 categories) and menu cost indicator (levels 1–4 sourced from TripAdvisor/Yelp).

To assess the multivariable predictors of allergen accommodations, Generalized Estimating Equation (GEE) logistic regression models were fitted using the `statsmodels` library in Python. Cuisine type was treated as a clustering (group) variable to account for random effects associated with different culinary types. Two regression models were fitted:
- **Model 1 (Symbols)**: Predicts the presence of at least one allergen symbol.
- **Model 2 (Statements)**: Predicts the presence of an allergen warning statement.
Predictors included TripAdvisor/Yelp star ratings, cost indicators, and the number of local branches (independent groups up to 19 locations). Odds Ratios (OR), 95% Confidence Intervals (CI), and P-values were computed.

---

## 3. Results

### 3.1. Descriptive Prevalence
Audits of the 100 independent restaurant menus revealed that:
- **14.0% (n = 14)** featured at least one allergen symbol, which represents a slight increase compared to the 10% rate in Toronto.
- **26.0% (n = 26)** included an allergen disclaimer or warning statement, showing a higher disclosure rate than Toronto (15.9%).
- **1.0% (n = 1)** offered a separate gluten-free or allergen-friendly menu.
- **2.0% (n = 2)** provided a dedicated allergen chart/matrix.

Table 1 displays the prevalence of allergen symbols and statements across the 15 cuisine types.

#### Table 1: Cross-Tabulation of Allergen Accommodations by Cuisine Type
| Cuisine Type | Total Sampled (N) | Has Allergen Symbols (n, %) | Has Allergen Statement (n, %) |
| :--- | :--- | :--- | :--- |
| East-Asian | 18 | 1 (5.6%) | 7 (38.9%) |
| Bar/Pub | 14 | 0 (0.0%) | 2 (14.3%) |
| Brunch/bagel | 13 | 1 (7.7%) | 1 (7.7%) |
| European | 11 | 3 (27.3%) | 5 (45.5%) |
| North American | 9 | 0 (0.0%) | 1 (11.1%) |
| Southeast-Asian | 7 | 3 (42.9%) | 3 (42.9%) |
| Pizzeria | 6 | 1 (16.7%) | 2 (33.3%) |
| Middle Eastern | 6 | 0 (0.0%) | 1 (16.7%) |
| Vegan/Vegetarian| 5 | 4 (80.0%) | 2 (40.0%) |
| Seafood | 4 | 1 (25.0%) | 2 (50.0%) |
| South-Asian | 4 | 0 (0.0%) | 0 (0.0%) |
| Asian-Fusion | 2 | 0 (0.0%) | 0 (0.0%) |
| BBQ/steakhouse | 1 | 0 (0.0%) | 0 (0.0%) |
| **Total** | **100** | **14 (14.0%)** | **26 (26.0%)** |

Vegan/Vegetarian restaurants were highly likely to have symbols (80.0%), followed by Southeast-Asian (42.9%) and European (27.3%) restaurants. 

### 3.2. Regression Analysis
Multivariable GEE logistic regression models analyzed the relationship between restaurant characteristics and allergen disclosure.

#### Table 2: Multivariable Logistic Regression Model Results
| Model / Predictor | Coefficient | Odds Ratio (OR) | 95% Confidence Interval (CI) | P-value |
| :--- | :---: | :---: | :---: | :---: |
| **Model 1: Allergen Symbols** | | | | |
| Intercept | -3.1496 | 0.0429 | 0.0001 – 22.4788 | 0.3242 |
| Cost Indicator (1–4) | 0.3978 | 1.4885 | 0.6105 – 3.6292 | 0.3817 |
| TripAdvisor Rating | -0.0571 | 0.9445 | 0.2125 – 4.1971 | 0.9401 |
| Number of Locations | 0.6447 | 1.9055 | **1.0431 – 3.4809** | **0.0360*** |
| | | | | |
| **Model 2: Allergen Statements** | | | | |
| Intercept | 3.7338 | 41.8395 | 0.0058 – 299880.8 | 0.4097 |
| Cost Indicator (1–4) | 0.3237 | 1.3822 | 0.6495 – 2.9415 | 0.4009 |
| TripAdvisor Rating | -1.2832 | 0.2772 | 0.0368 – 2.0851 | 0.2127 |
| Number of Locations | 0.0653 | 1.0675 | 0.7092 – 1.6067 | 0.7543 |

*\* Indicates statistical significance at p < 0.05.*

In Model 1 (Allergen Symbols), the number of locations was a statistically significant positive predictor (OR = 1.9055, p = 0.036). Every additional local branch almost doubled the odds of a restaurant implementing allergen symbols on its menu. In contrast, cost and star ratings were not statistically significant predictors. In Model 2 (Allergen Statements), none of the predictors were statistically significant, though cost indicator showed a weak positive association (OR = 1.3822).

---

## 4. Discussion

The results of this study suggest that voluntary food allergen labeling in Victoria, BC, is moderately more prevalent than in Toronto (14.0% symbols vs. 10.0%, and 26.0% statements vs. 15.9%). This supports the hypothesis that Victoria's health-focused lifestyle and high demand for specialized diets (e.g. gluten-free, vegan) may influence voluntary labeling practices. 

However, overall rates remain low: three-quarters of restaurants offer no allergen disclaimers, and 86% do not use visual allergen symbols. This leaves a significant information gap for allergic consumers, who must rely on verbal communication with staff, a process prone to human error and miscommunication (Leftwich et al., 2011).

The statistical significance of the location count in the symbols model (OR = 1.9055) indicates that even within the nonchain sector, larger independent groups (e.g., 2–5 local branches) are significantly more likely to adopt menu symbols than single-location establishments. This could be due to centralized kitchen management, standardized menus, or greater administrative resources to dedicate to menu auditing. Single-location restaurants, which constitute the majority of Victoria's unique culinary landscape, are highly resource-constrained and less likely to adopt visual symbols.

Cuisine-specific trends reveal that Vegan/Vegetarian (80.0%) and Southeast-Asian (42.9%) cuisines have high symbol adoption. For vegan restaurants, this is driven by the necessity to mark plant-based items. For Southeast-Asian and East-Asian cuisines, the high rate of allergen statements (42.9% and 38.9% respectively) may reflect an awareness of common, high-risk allergens in their ingredients (such as peanuts, sesame, soy, and shellfish) and the risk of cross-contact.

### Policy Implications
Because online menus are key tools for allergy management, relying on voluntary labeling creates inconsistent public health outcomes. Standardized allergen training for restaurant operators and the integration of allergen menu checks into routine health inspections (conducted by Island Health officers) could significantly improve public safety. Public health agencies could also provide simple, free templated allergen symbols and menus for independent, single-location restaurants to lower the administrative barrier to adoption.

---

## References
1. Kwon, J., & Lee, Y. M. (2012). Exploration of past experiences and preventive behaviors of consumers with food allergies when dining out. *Food Protection Trends*, 32(12), 736–746.
2. Leftwich, J., et al. (2011). The challenges for nut-allergic consumers of eating out. *Clinical & Experimental Allergy*, 41(2), 243–249.
3. Nahle, R., Thaivalappil, A., & Young, I. (2025). Food Allergy Labeling and Disclosure Practices on Restaurants' Online Menus in Toronto, Canada. *Journal of Food Protection*, 88(2025), 100533.
4. Oriel, R. C., et al. (2021). Characteristics of food allergic reactions in United States restaurants. *The Journal of Allergy and Clinical Immunology: In Practice*, 9(4), 1675–1682.
5. Soller, L., et al. (2015). Prevalence of food allergy in Canada. *The Journal of Allergy and Clinical Immunology: In Practice*, 3(1), 42–49.
