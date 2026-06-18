import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.News.filter({ id })
      .then(data => setArticle(data[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-gray-400">
      <p className="text-lg mb-4">Articolo non trovato.</p>
      <Link to="/news" className="text-brand-600 text-sm font-medium hover:underline">← Torna alle news</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Tutte le news
        </Link>

        {article.cover_image && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {article.published_date && (
          <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
            <Calendar className="w-4 h-4" />
            {format(new Date(article.published_date), "d MMMM yyyy", { locale: it })}
          </p>
        )}

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg text-gray-500 border-l-4 border-brand-500 pl-4 mb-8 italic">{article.excerpt}</p>
        )}

        {article.content && (
          <div
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}
      </div>
    </div>
  );
}