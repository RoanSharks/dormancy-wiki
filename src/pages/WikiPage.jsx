import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPageBySlug, deletePage } from "../api";

export default function WikiPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Check admin
  let isAdmin = false;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.username === "Fatigue";
    } catch {}
  }

  useEffect(() => {
    getPageBySlug(slug)
      .then((data) => {
        setPage(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
        setPage(null);
      });
  }, [slug]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    setDeleting(true);
    try {
      await deletePage(slug, token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-400/40 bg-rose-900/30 p-6">
        <p className="text-rose-100">{error}</p>
        <Link to="/" className="mt-4 inline-block text-cyan-300 hover:text-cyan-100">
          Return home
        </Link>
      </section>
    );
  }

  if (!page) {
    return <p className="text-slate-300">Loading article...</p>;
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-8 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-widest text-cyan-300/80">Dormancy Wiki Entry</p>
      <h1 className="mt-2 font-title text-4xl text-white">{page.title}</h1>
      {page.image && (
        <img
          src={page.image}
          alt={page.title}
          className="my-6 rounded-lg shadow max-h-64 w-auto object-cover border border-slate-700"
          style={{ maxWidth: '100%' }}
        />
      )}
      <p className="mt-8 whitespace-pre-line leading-8 text-slate-200">{page.content}</p>
      <div className="mt-8 flex gap-4 items-center">
        <Link to="/" className="text-cyan-300 hover:text-cyan-100">
          Back to homepage
        </Link>
        {isAdmin && (
          <>
            <Link
              to={`/admin?edit=${encodeURIComponent(slug)}`}
              className="rounded-full border border-cyan-400 bg-cyan-900/40 text-cyan-100 px-4 py-1.5 font-bold hover:bg-cyan-800/60 transition"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full border border-red-400 bg-red-900/40 text-red-100 px-4 py-1.5 font-bold hover:bg-red-800/60 transition disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
