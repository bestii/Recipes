import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Recipe } from "../lib/recipe";
import { findRecipe } from "../lib/recipes";

export function RecipeDetail() {
  const { slug } = useParams();
  const recipe = findRecipe(slug);

  if (!recipe) {
    return (
      <>
        <BackLink />
        <h1 className="mt-6 font-serif text-3xl tracking-tight">Recipe not found</h1>
        <p className="mt-3 text-base text-ink/60">That recipe isn’t in the collection.</p>
      </>
    );
  }

  return <RecipePage key={recipe.slug} recipe={recipe} />;
}

function RecipePage({ recipe }: { recipe: Recipe }) {
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());

  useEffect(() => {
    document.title = `${recipe.title} · Recipes`;
    return () => {
      document.title = "Recipes";
    };
  }, [recipe.title]);

  function toggle(index: number) {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <article>
      <BackLink />

      <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
        {recipe.title}
      </h1>

      <section className="mt-10" aria-labelledby="ingredients-heading">
        <h2
          id="ingredients-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
        >
          Ingredients
        </h2>
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="py-2.5 text-[17px] leading-relaxed">
              {ingredient}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="steps-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="steps-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
          >
            Steps
          </h2>
          <p className="text-[11px] text-ink/40">Tap to mark done</p>
        </div>

        <ol className="mt-4 space-y-2.5">
          {recipe.steps.map((step, index) => {
            const isDone = done.has(index);
            return (
              <li key={index}>
                <button
                  type="button"
                  aria-pressed={isDone}
                  onClick={() => toggle(index)}
                  className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isDone
                      ? "border-ink/5 bg-ink/[0.03]"
                      : "border-ink/10 bg-card hover:border-ink/20"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      isDone ? "bg-accent text-paper" : "bg-ink/8 text-ink/70"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`text-[17px] leading-relaxed transition ${
                      isDone ? "text-ink/40 line-through decoration-ink/25" : ""
                    }`}
                  >
                    {step}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm text-ink/55 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span aria-hidden="true">←</span> All recipes
    </Link>
  );
}
