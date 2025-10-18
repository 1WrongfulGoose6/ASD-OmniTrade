// app/news/page.js
import { useState, useEffect } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/news?category=general&limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        setNews(data.news || []);
      } catch {
        // ignore
      }
      finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6 pb-16">
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-4 sm:px-6 py-3">
          <h1 className="text-2xl font-semibold">News</h1>
        </div>

        {loading ? (
          <div className="text-center text-white/80">Loading news…</div>
        ) : (
          <NewsGridClient initialNews={news} />
        )}
      </section>
    </main>
  );
}
