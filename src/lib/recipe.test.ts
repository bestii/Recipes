import { describe, expect, it } from "vite-plus/test";
import { buildRecipes, parseRecipe, RecipeError } from "./recipe";

const recipe = `---
title: Cacio e Pepe
ingredients:
  - 200 g spaghetti
  - 80 g Pecorino Romano
---

1. Boil the pasta.
2. Toast the pepper.
`;

describe("parseRecipe", () => {
  it("reads the title, ingredients and steps", () => {
    expect(parseRecipe(recipe, "cacio-e-pepe")).toEqual({
      slug: "cacio-e-pepe",
      title: "Cacio e Pepe",
      ingredients: ["200 g spaghetti", "80 g Pecorino Romano"],
      steps: ["Boil the pasta.", "Toast the pepper."],
    });
  });

  it('accepts "1)" step markers', () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\n---\n\n1) Slice.\n2) Toast.\n`;
    expect(parseRecipe(raw, "toast").steps).toEqual(["Slice.", "Toast."]);
  });

  it("joins wrapped step lines onto the step above", () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\n---\n\n1. Slice the bread\nand leave it out.\n`;
    expect(parseRecipe(raw, "toast").steps).toEqual(["Slice the bread and leave it out."]);
  });

  it("trims surrounding whitespace", () => {
    const raw = `---\ntitle:   Toast   \ningredients:\n  -   bread  \n---\n\n1.   Slice.   \n`;
    expect(parseRecipe(raw, "toast")).toMatchObject({
      title: "Toast",
      ingredients: ["bread"],
      steps: ["Slice."],
    });
  });

  it("rejects a file with no frontmatter block", () => {
    expect(() => parseRecipe(`1. Just a step.\n`, "toast")).toThrow(/frontmatter block/);
  });

  it("rejects a missing title", () => {
    const raw = `---\ningredients:\n  - bread\n---\n\n1. Slice.\n`;
    expect(() => parseRecipe(raw, "toast")).toThrow(RecipeError);
    expect(() => parseRecipe(raw, "toast")).toThrow(/toast: .*title/);
  });

  it("rejects missing or empty ingredients", () => {
    expect(() => parseRecipe(`---\ntitle: Toast\n---\n\n1. Slice.\n`, "toast")).toThrow(
      /ingredients/,
    );
    expect(() =>
      parseRecipe(`---\ntitle: Toast\ningredients: []\n---\n\n1. Slice.\n`, "toast"),
    ).toThrow(/ingredients/);
  });

  it("rejects an ingredient that is not a string", () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\n  -\n---\n\n1. Slice.\n`;
    expect(() => parseRecipe(raw, "toast")).toThrow(/non-empty string/);
  });

  it("rejects a body with no numbered steps", () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\n---\n\n`;
    expect(() => parseRecipe(raw, "toast")).toThrow(/numbered step/);
  });

  it("rejects frontmatter fields the app would ignore", () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\nservings: 2\n---\n\n1. Slice.\n`;
    expect(() => parseRecipe(raw, "toast")).toThrow(/unexpected frontmatter field\(s\): servings/);
  });

  it("rejects prose that starts the body", () => {
    const raw = `---\ntitle: Toast\ningredients:\n  - bread\n---\n\nSome notes.\n\n1. Slice.\n`;
    expect(() => parseRecipe(raw, "toast")).toThrow(/must start with a numbered step/);
  });
});

describe("buildRecipes", () => {
  it("derives the slug from the file name and sorts by title", () => {
    const files = {
      "./recipes/zucchini-fritters.md": `---\ntitle: Zucchini Fritters\ningredients:\n  - zucchini\n---\n\n1. Fry.\n`,
      "./recipes/apple-cake.md": `---\ntitle: apple cake\ningredients:\n  - apples\n---\n\n1. Bake.\n`,
    };

    expect(buildRecipes(files).map(({ slug, title }) => ({ slug, title }))).toEqual([
      { slug: "apple-cake", title: "apple cake" },
      { slug: "zucchini-fritters", title: "Zucchini Fritters" },
    ]);
  });

  it("names the offending file when a recipe is invalid", () => {
    const files = { "./recipes/broken.md": `---\ntitle: Broken\n---\n\n1. Go.\n` };
    expect(() => buildRecipes(files)).toThrow(/broken\.md: .*ingredients/);
  });

  it("rejects a file name that is not lowercase kebab-case", () => {
    const files = { "./recipes/Dal Tadka.md": `---\ntitle: Dal\n---\n\n1. Simmer.\n` };
    expect(() => buildRecipes(files)).toThrow(/kebab-case/);
  });
});
