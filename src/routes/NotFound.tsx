import { Link } from "react-router";

export function NotFound() {
  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Page not found</h1>
      <p className="mt-3 text-base text-ink/60">That page isn’t here.</p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Back to all recipes
      </Link>
    </>
  );
}
