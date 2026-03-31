import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPages, setPagePin } from "../api";

export default function HomePage() {
  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");
  const [loadingPin, setLoadingPin] = useState("");

  // Admin check
  let isAdmin = false;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.admin || payload.username === "Fatigue";
    } catch {}
  }

  useEffect(() => {
    getPages().then(setPages).catch((err) => setError(err.message));
  }, []);

  // Sort: pinned first, then featured (max 3 each)
  const pinned = pages.filter((p) => p.pinned).sort((a, b) => a.slug === "welcome-to-dormancy" ? -1 : b.slug === "welcome-to-dormancy" ? 1 : 0).slice(0, 3);
  const featured = pages.filter((p) => !p.pinned && p.slug !== "welcome-to-dormancy").slice(0, 3);

  async function handlePin(page, pin) {
    setLoadingPin(page.slug);
    try {
      await setPagePin(page.slug, pin, token);
      const updated = await getPages();
      setPages(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPin("");
    }
  }

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 p-8 shadow-2xl shadow-blue-900/30">
        {/* <p className="mb-2 text-cyan-300"><strike>stasis</strike></p> */}
        <h1 className="font-title text-4xl leading-tight text-white sm:text-6xl">
          Dormancy
          <span className="block font-title text-cyan-200">Official Wiki</span>
        </h1>
        <p className="mt-6 max-w-2xl text-slate-200">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec blandit
          elementum lacus, vitae vestibulum risus suscipit vel. Vivamus dignissim,
          nibh at feugiat bibendum, erat justo volutpat augue, sed gravida magna odio
          vel lectus.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title text-2xl text-cyan-100">Featured Articles</h2>
          <Link to="/admin" className="text-sm text-cyan-300 underline-offset-4 hover:underline">
            Add or edit page
          </Link>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-300/40 bg-rose-900/30 p-4 text-rose-100">{error}</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...pinned, ...featured].map((page, index) => (
            <div key={page.slug} className="relative">
              <Link
                to={`/wiki/${page.slug}`}
                className="group rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:-translate-y-1 hover:border-cyan-200/50 block"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-cyan-300/80 flex items-center gap-1">
                      Lore File
                      {page.pinned && (
                        <span title="Pinned" className="ml-1 text-yellow-300">
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2l2.39 4.84L18 7.27l-4 3.89L15.18 18 10 14.77 4.82 18 6 11.16l-4-3.89 5.61-.43z"/></svg>
                        </span>
                      )}
                    </p>
                    <h3 className="mt-2 font-title text-xl text-white group-hover:text-cyan-100 truncate">{page.title}</h3>
                    <p className="mt-3 text-sm text-slate-300 truncate">{page.summary}</p>
                  </div>
                  {page.image && page.slug !== "welcome-to-dormancy" && (
                    <div className="ml-4 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={page.image}
                        alt={page.title}
                        className="rounded-lg border border-slate-700 object-cover"
                        style={{ width: '64px', height: '64px', aspectRatio: '1 / 1', boxShadow: '0 2px 8px #0008' }}
                      />
                    </div>
                  )}
                </div>
              </Link>
              {isAdmin && page.slug !== "welcome-to-dormancy" && (
                <button
                  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full border ${page.pinned ? "border-yellow-300 text-yellow-300 bg-yellow-900/20" : "border-cyan-300 text-cyan-200 bg-cyan-900/20"} hover:bg-cyan-800/40 transition z-10`}
                  disabled={loadingPin === page.slug}
                  onClick={() => handlePin(page, !page.pinned)}
                  title={page.pinned ? "Unpin" : "Pin"}
                >
                  {loadingPin === page.slug ? "..." : page.pinned ? "Unpin" : "Pin"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
