import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Search, FileText } from "lucide-react";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.entities.Listing.list("-created_date", 200),
      api.entities.Category.list(),
    ]).then(([l, c]) => {
      setListings(l);
      setCategories(c);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (listing) => {
    await api.entities.Listing.update(listing.id, { is_published: !listing.is_published });
    load();
  };

  const togglePromote = async (listing) => {
    await api.entities.Listing.update(listing.id, { is_promoted: !listing.is_promoted });
    load();
  };

  const deleteListing = async (id) => {
    if (!confirm("Eliminare questo annuncio?")) return;
    await api.entities.Listing.delete(id);
    load();
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "—";

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (l) => {
    if (l.price_on_request) return "Su richiesta";
    if (l.price) return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(l.price);
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Annunci</h1>
        <Link
          to="/admin/annunci/nuovo"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuovo annuncio
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Cerca annunci..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nessun annuncio trovato.</p>
            <Link to="/admin/annunci/nuovo" className="inline-flex items-center gap-1.5 mt-4 text-sm text-brand-600 hover:underline font-medium">
              <Plus className="w-3.5 h-3.5" /> Crea il primo annuncio
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titolo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stato</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prezzo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {l.featured_image ? (
                          <img src={l.featured_image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{l.title}</p>
                          <div className="flex gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${l.condition === "new" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                              {l.condition === "new" ? "Nuovo" : "Usato"}
                            </span>
                            {l.is_promoted && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">Promo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-500">{getCategoryName(l.category_id)}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${l.is_published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {l.is_published ? "Pubblicato" : "Bozza"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">{formatPrice(l)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePromote(l)}
                          title={l.is_promoted ? "Rimuovi promozione" : "Metti in promozione"}
                          className={`p-1.5 rounded-lg transition-colors ${l.is_promoted ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePublish(l)}
                          title={l.is_published ? "Nascondi" : "Pubblica"}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {l.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/admin/annunci/${l.id}`}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteListing(l.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}