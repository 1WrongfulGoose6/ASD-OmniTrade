// app/news/[slug]/page.js
import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_NEWS } from "../_data";
import NavBar from "@/components/NavBar";

export function generateStaticParams() {
  return MOCK_NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = MOCK_NEWS.find((n) => n.slug === slug);
  if (!article) return { title: "Article not found — OmniTrade" };
  return {
    title: `${article.title} — OmniTrade`,
    description: article.summary,
  };
}

function ArticlePage({ params }) {
  const { slug } = params;
  const article = MOCK_NEWS.find((n) => n.slug === slug);
  if (!article) return notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Wavy background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,0Z" />
        </svg>
      </div>

      {/* Top nav */}
      <NavBar />

      {/* Article */}
    <article className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12">
      {/* Glass panel */}
      <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/10 ring-1 ring-white/25 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="rounded-full bg-white/30 px-2 py-0.5">{article.tag}</span>
          <time>{new Date(article.date).toLocaleDateString()}</time>
        </div>

        <h1 className="mt-3 text-4xl font-bold drop-shadow">{article.title}</h1>
        <p className="mt-3 text-white/90">{article.summary}</p>

        <hr className="my-6 border-white/30" />

        <div className="prose prose-invert mt-4 max-w-none">
          {article.body.split("\n").map((p, i) => (
            <p key={i}>{p.trim()}</p>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/news"
            className="rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20"
          >
            ← Back to News
          </Link>
        </div>
      </div>
    </article>
    </main>
  );
}

ArticlePage.propTypes = {
  params: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export default ArticlePage;
