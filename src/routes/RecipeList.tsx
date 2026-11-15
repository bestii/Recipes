import { Link } from "react-router";
import { recipes } from "../lib/recipes";

function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function RecipeList() {
  return (
    <>
      <header className="border-b border-ink/10 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          My kitchen
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-none tracking-tight sm:text-5xl">
          Recipes
        </h1>
        <p className="mt-4 text-sm text-ink/55">
          {recipes.length === 0 ? "Nothing saved yet." : `${recipes.length} saved`}
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="mt-10 max-w-prose text-base leading-relaxed text-ink/60">
          Add a Markdown file to{" "}
          <code className="rounded bg-ink/5 px-1.5 py-0.5 text-[0.9em]">src/recipes</code> and it
          appears here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {recipes.map((recipe) => (
            <li key={recipe.slug}>
              <Link
                to={`/recipes/${recipe.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-card px-5 py-4 transition hover:border-ink/20 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span>
                  <span className="block font-serif text-xl leading-snug group-hover:underline group-hover:decoration-ink/30 group-hover:underline-offset-4">
                    {recipe.title}
                  </span>
                  <span className="mt-1 block text-xs text-ink/45">
                    {countLabel(recipe.ingredients.length, "ingredient")} ·{" "}
                    {countLabel(recipe.steps.length, "step")}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-ink/50"
                >
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
