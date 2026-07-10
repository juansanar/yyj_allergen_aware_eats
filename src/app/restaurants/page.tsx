import { RestaurantExplorer } from "@/components/RestaurantExplorer";

export const metadata = {
  title: "Victoria BC Restaurant Menu Search | YYJ Allergen-Aware Eats",
  description: "Search menus of 100 nonchain restaurants in Victoria, BC, and filter by priority food allergens (gluten, peanuts, dairy, etc.).",
};

export default function RestaurantsPage() {
  return <RestaurantExplorer />;
}
