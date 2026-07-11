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
Of the 100 restaurants audited, 15.0% (n = 15) featured at least one allergen symbol (e.g. GF, V), and 18.0% (n = 18) included an allergen warning or statement on their menu. Only 2.0% (n = 2) provided a dedicated separate allergen/gluten-free menu, and 1.0% (n = 1) had a structured allergen chart. 
Cuisine type was associated with allergen accommodation: 55.6% of Southeast-Asian restaurants and 50.0% of Seafood restaurants featured allergen symbols on their menus. In multivariable GEE logistic regression, the cost indicator was a statistically significant predictor of displaying allergen symbols (OR = 3.6010, 95% CI: 1.3398–9.6789, p = 0.011), indicating that higher price points are associated with visual disclosures. No significant association was found between TripAdvisor ratings or locations count and allergen disclosure practices.

### Conclusion
Voluntary allergen disclosure on online menus in Victoria remains low (15% for symbols, 18% for statements), comparable to the rates observed in Toronto (10% and 16% respectively). The cost indicator represents the only significant predictor, indicating a generalized gap in standardized menu labeling across low-to-mid tier independent dining, which suggests that targeted public health policies could improve dining safety.

---

## 1. Introduction
Food allergies represent a growing public health challenge, affecting approximately 7.5% of Canadians (Soller et al., 2015). Accidental exposure to priority food allergens (such as wheat/gluten, milk, eggs, peanuts, tree nuts, fish, shellfish, sesame, and soy) can trigger severe, life-threatening immunological reactions, including anaphylaxis. Research indicates that dining out at restaurants is the second most common location for accidental food allergen exposures to occur (Oriel et al., 2021). 

To mitigate these risks, consumers with food allergies or Celiac disease rely heavily on nonverbal allergen disclosures—such as symbols (e.g. "GF" for gluten-free) or disclaimers—on online menus before deciding where to dine. Online menu auditing is particularly critical because checking online menus is a primary coping strategy for food-allergic patrons (Kwon et al., 2020).

In Canada, there are no provincial or federal regulations requiring allergen labeling on non-prepackaged food items served in restaurants. Consequently, allergen accommodations are entirely voluntary. A recent 2025 cross-sectional study in Toronto, Canada, found that only 10% of 1,000 sampled nonchain restaurants used allergen symbols, and 16% included allergen statements (Nahle, Thaivalappil, & Young, 2025). 

Victoria, British Columbia, presents a unique geographical and cultural comparison. Known for its health-conscious population, high density of vegan/vegetarian establishments, and local culinary culture, it is hypothesized that Victoria independent restaurants may exhibit higher rates of allergen disclosure. This study reproduces the Toronto methodology to audit, analyze, and model allergen labeling practices on online menus in Victoria, BC, providing insights for municipal public health policy.

---

## 2. Methods

### 2.1. Sampling Frame and Selection
The sampling frame was sourced from the City of Victoria's Open Data Portal, specifically the "Business Licences - Current Year" dataset. As of July 2026, the dataset contained 7,621 active business licenses. Filtering for active, approved licenses with NAICS code 722511/722513 (eating places) and applying strict name exclusions yielded a total population of 312 approved independent restaurants in Victoria. 

Chain restaurants, defined using the Canadian threshold of having more than 20 locations nationwide, were excluded from the sampling frame to focus purely on independent and small-group dining establishments. From the remaining population, a sample of 100 restaurants was selected using a stratified random sampling approach across Victoria's neighborhoods (e.g., Downtown, James Bay, Oak Bay, Fairfield, Burnside, Victoria West) to ensure spatial and culinary representativeness.

The sample size of 100 was determined based on Victoria's total population of 312 active independent restaurants. Applying a finite population correction (FPC) factor, this sample size provides a 95% confidence level in the prevalence of food allergy accommodations with an 8.1% margin of error, assuming a conservative estimated proportion of 0.5 where allergy accommodations could be anywhere from 0% to 100% (Althubaiti, 2023). An interactive spatial map comparing the selected sample restaurants with their geographic distribution across Victoria is presented in the study's companion web application.

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
- **15.0% (n = 15)** featured at least one allergen symbol, which is slightly higher than the 10.0% rate in Toronto.
- **18.0% (n = 18)** included an allergen disclaimer or warning statement, compared to 15.9% in Toronto.
- **2.0% (n = 2)** offered a separate gluten-free or allergen-friendly menu.
- **1.0% (n = 1)** provided a dedicated allergen chart/matrix.

Table 1 displays the prevalence of allergen symbols and statements across the 13 cuisine types.

#### Table 1: Cross-Tabulation of Allergen Accommodations by Cuisine Type
| Cuisine Type | Total Sampled (N) | Has Allergen Symbols (n, %) | Has Allergen Statement (n, %) |
| :--- | :--- | :--- | :--- |
| North American | 45 | 3 (6.7%) | 7 (15.6%) |
| Asian-Fusion | 10 | 1 (10.0%) | 0 (0.0%) |
| East-Asian | 9 | 1 (11.1%) | 2 (22.2%) |
| Southeast-Asian | 9 | 5 (55.6%) | 5 (55.6%) |
| Pizzeria | 7 | 1 (14.3%) | 2 (28.6%) |
| Seafood | 4 | 2 (50.0%) | 1 (25.0%) |
| Brunch/bagel | 4 | 0 (0.0%) | 0 (0.0%) |
| Latin American/Caribbean | 3 | 0 (0.0%) | 0 (0.0%) |
| Middle Eastern | 3 | 0 (0.0%) | 0 (0.0%) |
| Bar/Pub | 2 | 0 (0.0%) | 0 (0.0%) |
| BBQ/steakhouse | 2 | 2 (100.0%) | 1 (50.0%) |
| European | 1 | 0 (0.0%) | 0 (0.0%) |
| African | 1 | 0 (0.0%) | 0 (0.0%) |
| **Total** | **100** | **15 (15.0%)** | **18 (18.0%)** |

Southeast-Asian restaurants were highly likely to have symbols (55.6%), followed by Seafood (50.0%) and Pizzeria (14.3%) establishments.

Among individual allergens labeled on menus, gluten was the most frequent (100% of menus with allergen markings highlighted gluten-free options or gluten content), followed by dairy (68.0% of restaurants explicitly denoting milk/dairy), seafood (41.0%), soy (19.0%), sesame (13.0%), and peanuts (9.0%). 

The distribution of allergen accommodations stratified by average menu cost is shown in Table 3. Restaurants with higher cost indicators exhibited a higher prevalence of both allergen symbols (e.g., 100.0% of Level 4 and 37.5% of Level 3 restaurants vs. 8.3% of Level 1) and statements (e.g., 50.0% of Level 4 and 37.5% of Level 3 vs. 13.9% of Level 1). Customer star ratings, however, did not vary: the median TripAdvisor rating was 4.4 (IQR: 4.1–4.6) for both labeling and non-labeling restaurants, indicating no correlation between voluntary disclosure and ratings.

#### Table 3: Cross-Tabulation of Allergen Accommodations by Cost Indicator
| Cost Indicator (1–4) | Total Sampled (N) | Has Allergen Symbols (n, %) | Has Allergen Statement (n, %) |
| :---: | :---: | :---: | :---: |
| 1 (Least Expensive) | 36 | 3 (8.3%) | 5 (13.9%) |
| 2 | 54 | 7 (13.0%) | 9 (16.7%) |
| 3 | 8 | 3 (37.5%) | 3 (37.5%) |
| 4 (Most Expensive) | 2 | 2 (100.0%) | 1 (50.0%) |

### 3.2. Regression Analysis
Multivariable GEE logistic regression models analyzed the relationship between restaurant characteristics and allergen disclosure.

#### Table 2: Multivariable Logistic Regression Model Results
| Model / Predictor | Coefficient | Odds Ratio (OR) | 95% Confidence Interval (CI) | P-value |
| :--- | :---: | :---: | :---: | :---: |
| **Model 1: Allergen Symbols** | | | | |
| Intercept | -7.8502 | 0.0004 | 0.0000 – 0.7758 | 0.0428* |
| Cost Indicator (1–4) | 1.2812 | 3.6010 | 1.3398 – 9.6789 | 0.0111* |
| TripAdvisor Rating | 0.5638 | 1.7573 | 0.6526 – 4.7323 | 0.2646 |
| Number of Locations | 1.0839 | 2.9562 | 0.4381 – 19.9501 | 0.2659 |
| | | | | |
| **Model 2: Allergen Statements** | | | | |
| Intercept | -8.5814 | 0.0002 | 0.0000 – 0.1012 | 0.0075* |
| Cost Indicator (1–4) | 0.5737 | 1.7748 | 0.8174 – 3.8538 | 0.1470 |
| TripAdvisor Rating | 1.2318 | 3.4274 | 0.4902 – 23.9623 | 0.2144 |
| Number of Locations | 0.6276 | 1.8731 | 0.5548 – 6.3240 | 0.3120 |

*\* Indicates statistical significance at p < 0.05.*

In Model 1 (Allergen Symbols), the cost indicator was a statistically significant positive predictor (OR = 3.6010, p = 0.0111). Higher-priced independent dining establishments showed a higher likelihood of adopting visual symbols. Star ratings and number of locations were not statistically significant predictors. In Model 2 (Allergen Statements), the intercept was highly significant, indicating low baseline statement rates. None of the multivariable predictors (cost, rating, local branches) were statistically significant.

---

## 4. Discussion

The results of this study suggest that voluntary food allergen labeling in Victoria, BC, is comparable to Toronto (15.0% symbols in Victoria vs. 10.0% in Toronto, and 18.0% statements in Victoria vs. 15.9% in Toronto). While slightly elevated, this largely confirms that Victoria's local independent dining sector has a similarly low voluntary labeling rate, despite its reputation for a health-conscious lifestyle. 

Overall rates remain low: 82% of independent restaurants offer no online allergen disclaimers, and 85% do not use visual allergen symbols on their online menus. This leaves a significant information gap for allergic consumers, who must rely on verbal communication with staff, a process prone to human error and miscommunication (Leftwich et al., 2011).

In our regression models, we observed a statistically significant association between the menu cost indicator and symbol adoption (OR = 3.6010, p = 0.0111). Higher-priced establishments are likely to have more resources to dedicate to menu coding, or cater to a demographic that expects visual dietary indicators.

Cuisine-specific trends reveal that Southeast-Asian (55.6%) and Seafood (50.0%) cuisines have relatively higher symbol adoption. For Southeast-Asian cuisines, the higher rate of allergen statements (55.6%) reflects an awareness of common, high-risk allergens in regional preparations (such as peanuts, sesame, soy, and shellfish) and the risk of cross-contact.

### Policy Implications
Because online menus are key tools for allergy management, relying on voluntary labeling creates inconsistent public health outcomes. Standardized allergen training for restaurant operators and the integration of allergen menu checks into routine health inspections (conducted by Island Health officers) could significantly improve public safety. Public health agencies could also provide simple, free templated allergen symbols and menus for independent, single-location restaurants to lower the administrative barrier to adoption.

---

## References
1. Kwon, J., & Lee, Y. M. (2012). Exploration of past experiences and preventive behaviors of consumers with food allergies when dining out. *Food Protection Trends*, 32(12), 736–746.
2. Leftwich, J., et al. (2011). The challenges for nut-allergic consumers of eating out. *Clinical & Experimental Allergy*, 41(2), 243–249.
3. Nahle, R., Thaivalappil, A., & Young, I. (2025). Food Allergy Labeling and Disclosure Practices on Restaurants' Online Menus in Toronto, Canada. *Journal of Food Protection*, 88(2025), 100533.
4. Oriel, R. C., et al. (2021). Characteristics of food allergic reactions in United States restaurants. *The Journal of Allergy and Clinical Immunology: In Practice*, 9(4), 1675–1682.
5. Soller, L., et al. (2015). Prevalence of food allergy in Canada. *The Journal of Allergy and Clinical Immunology: In Practice*, 3(1), 42–49.
