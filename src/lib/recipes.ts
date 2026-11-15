import { buildRecipes, type Recipe } from "./recipe";

const files = import.meta.glob<string>("../recipes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const recipes: Recipe[] = buildRecipes(files);

export function findRecipe(slug: string | undefined): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}
