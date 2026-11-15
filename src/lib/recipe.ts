import { parse as parseYaml } from "yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

const ALLOWED_FIELDS = new Set(["title", "ingredients"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type Recipe = {
  slug: string;
  title: string;
  ingredients: string[];
  steps: string[];
};

export class RecipeError extends Error {
  readonly detail: string;

  constructor(source: string, detail: string) {
    super(`${source}: ${detail}`);
    this.name = "RecipeError";
    this.detail = detail;
  }
}

export function parseRecipe(raw: string, slug: string): Recipe {
  const { data, body } = splitFrontmatter(raw, slug);

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) {
    throw new RecipeError(slug, 'frontmatter needs a non-empty "title"');
  }

  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new RecipeError(slug, 'frontmatter needs a non-empty "ingredients" list');
  }

  const ingredients = data.ingredients.map((line: unknown) =>
    typeof line === "string" ? line.trim() : "",
  );
  if (ingredients.some((line: string) => line === "")) {
    throw new RecipeError(slug, 'every "ingredients" entry must be a non-empty string');
  }

  const steps = parseSteps(body, slug);
  if (steps.length === 0) {
    throw new RecipeError(slug, 'body needs at least one numbered step, like "1. Boil the pasta"');
  }

  return { slug, title, ingredients, steps };
}

function splitFrontmatter(
  raw: string,
  slug: string,
): { data: Record<string, unknown>; body: string } {
  const match = FRONTMATTER.exec(raw.replace(/^\uFEFF/, ""));
  if (!match) {
    throw new RecipeError(slug, 'file must start with a "---" frontmatter block');
  }

  const data: unknown = parseYaml(match[1]);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new RecipeError(slug, "frontmatter must be a YAML mapping");
  }

  const record = data as Record<string, unknown>;
  const unknown = Object.keys(record).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknown.length > 0) {
    throw new RecipeError(
      slug,
      `unexpected frontmatter field(s): ${unknown.join(", ")} — a recipe is title and ingredients only`,
    );
  }

  return { data: record, body: match[2] };
}

function parseSteps(body: string, slug: string): string[] {
  const steps: string[] = [];

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "") continue;

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      steps.push(numbered[1].trim());
      continue;
    }

    if (steps.length === 0) {
      throw new RecipeError(slug, "body must start with a numbered step, not prose");
    }

    steps[steps.length - 1] = `${steps[steps.length - 1]} ${line}`;
  }

  return steps;
}

export function buildRecipes(files: Record<string, string>): Recipe[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = slugFromPath(path);
      try {
        return parseRecipe(raw, slug);
      } catch (error) {
        if (error instanceof RecipeError) {
          throw new RecipeError(path, error.detail);
        }
        throw error;
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

function slugFromPath(path: string): string {
  const file = path.split(/[\\/]/).pop() ?? path;
  if (!file.endsWith(".md")) {
    throw new RecipeError(path, "recipe files must end in .md");
  }

  const slug = file.slice(0, -".md".length);
  if (!SLUG.test(slug)) {
    throw new RecipeError(path, "file name must be lowercase kebab-case, like cacio-e-pepe.md");
  }

  return slug;
}
