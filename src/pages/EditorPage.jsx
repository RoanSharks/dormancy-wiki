import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { savePage, getPages, getPageBySlug } from "../api";

async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Failed to upload image." }));
    throw new Error(data.message || "Failed to upload image.");
  }
  return response.json();
}


const initialForm = {
  title: "",
  slug: "",
  summary: "",
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  category: "",
  image: "", // New image field
};

export default function EditorPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [categories, setCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Autofill form if editing
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Fetch categories
    getPages(token)
      .then((pages) => {
        const cats = Array.from(
          new Set(
            pages
              .map((p) => p.category)
              .filter((c) => c && c.trim() !== "")
          )
        );
        setCategories(cats);
      })
      .catch(() => setCategories([]));

    // Check for ?edit=slug param
    const params = new URLSearchParams(location.search);
    const editSlug = params.get("edit");
    if (editSlug) {
      getPageBySlug(editSlug, token)
        .then((page) => {
          setForm({
            title: page.title || "",
            slug: page.slug || "",
            summary: page.summary || "",
            content: page.content || "",
            category: page.category || "",
            image: page.image || "",
          });
          setCustomCategory("");
        })
        .catch(() => {
          setStatus({ type: "error", message: "Failed to load page for editing." });
        });
    }
  }, [location.search]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection or custom input
  const handleCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, category: e.target.value }));
    setCustomCategory("");
  };
  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    setForm((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const token = localStorage.getItem("token");
    try {
      const result = await savePage(form, token);
      setStatus({ type: "success", message: "Page saved. Redirecting..." });
      setForm(initialForm);
      setTimeout(() => navigate(`/wiki/${result.slug}`), 700);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-8 backdrop-blur-sm">
      <h1 className="font-title text-3xl text-cyan-100">Wiki Editor</h1>
      <p className="mt-2 text-slate-300">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Update existing pages by reusing a slug.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {/* Category selection */}
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Category</span>
          <select
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
            value={customCategory ? "" : form.category}
            onChange={handleCategoryChange}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">Or enter a custom category:</span>
          <input
            type="text"
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring mt-1"
            placeholder="Custom category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Title</span>
          <input
            required
            name="title"
            value={form.title}
            onChange={updateField}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Slug</span>
          <input
            required
            name="slug"
            value={form.slug}
            onChange={updateField}
            placeholder="example-page-slug"
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Summary</span>
          <input
            required
            name="summary"
            value={form.summary}
            onChange={updateField}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
          />
        </label>

        {/* Image upload field */}
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Image (optional, .jpg/.png/.gif, max 2MB)</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setStatus({ type: "", message: "" });
              const token = localStorage.getItem("token");
              try {
                const result = await uploadImage(file, token);
                setForm((prev) => ({ ...prev, image: result.url }));
                setStatus({ type: "success", message: "Image uploaded!" });
              } catch (err) {
                setStatus({ type: "error", message: err.message });
              }
            }}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
          />
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="mt-2 rounded-lg max-h-32 border border-slate-700 shadow"
              style={{ maxWidth: '100%' }}
            />
          )}
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Content</span>
          <textarea
            required
            name="content"
            value={form.content}
            onChange={updateField}
            rows={8}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-slate-100 outline-none ring-cyan-300/50 transition focus:ring"
          />
        </label>

        {status.message ? (
          <p
            className={[
              "rounded-xl p-3 text-sm",
              status.type === "success"
                ? "border border-emerald-300/50 bg-emerald-900/30 text-emerald-100"
                : "border border-rose-300/50 bg-rose-900/30 text-rose-100",
            ].join(" ")}
          >
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-full border border-cyan-200/50 bg-cyan-300/20 px-5 py-2 font-medium text-cyan-100 transition hover:bg-cyan-300/35"
        >
          Save Wiki Entry
        </button>
      </form>
    </section>
  );
}
