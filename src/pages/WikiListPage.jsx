import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPages } from "../api";

export default function WikiListPage() {
  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getPages().then(setPages).catch((err) => setError(err.message));
  }, []);

  // Group by category
  const categories = {};
  for (const page of pages) {
    const cat = page.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(page);
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="font-title text-3xl text-cyan-100 mb-8 text-left">All Wiki Articles</h1>
      {error && <p className="text-red-400 mb-4 text-left">{error}</p>}
      {Object.keys(categories).length === 0 && <p className="text-slate-300 text-left">No articles found.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(categories).map(([cat, articles]) => (
          <section
            key={cat}
            className="wiki-category-card p-6 flex flex-col"
            style={{ minHeight: '220px' }}
          >
            <h2 className="font-title text-xl text-cyan-200 font-bold mb-4 text-left">{cat}</h2>
            <ul className="space-y-3">
              {articles.map((page) => (
                <li
                  key={page.slug}
                  className="flex flex-row items-center bg-slate-900/60 rounded-xl p-3 border border-slate-700 shadow group hover:bg-slate-800/80 transition"
                  style={{ minHeight: '96px' }}
                >
                  <div className="flex-1 flex flex-col items-start">
                    <Link
                      to={`/wiki/${page.slug}`}
                      className="text-cyan-300 hover:text-cyan-200 hover:underline text-lg font-medium transition-colors"
                    >
                      {page.title}
                    </Link>
                    <span className="text-slate-400 text-sm mt-1">{page.summary}</span>
                  </div>
                  {page.image && (
                    <div className="ml-4 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={page.image}
                        alt={page.title}
                        className="rounded-lg border border-slate-700 object-cover"
                        style={{ width: '64px', height: '64px', aspectRatio: '1 / 1', boxShadow: '0 2px 8px #0008' }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
