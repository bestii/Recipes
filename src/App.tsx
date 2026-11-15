import { Route, Routes } from "react-router";
import { NotFound } from "./routes/NotFound";
import { RecipeDetail } from "./routes/RecipeDetail";
import { RecipeList } from "./routes/RecipeList";

export default function App() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes/:slug" element={<RecipeDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
