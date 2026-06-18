import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { FileText, Tag, MessageSquare, Star, Plus } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ listings: 0, categories: 0, unread: 0, promoted: 0 });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.entities.Listing.list(),
      api.entities.Category.list(),
      api.entities.Inquiry.list("-created_date", 10),
    ]).then(([listings, cats, inquiries]) => {
      setStats({
        listings: listings.length,
        categories: cats.length,
        unread: inquiries.filter(i => !i.is_read).length,
        promoted: listings.filter(l => l.is_promoted).length,
      });
      setRecentInquiries(inquiries.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Annunci totali", value: stats.listings, icon: FileText, path: "/admin/annunci", color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Categorie", value: stats.categories, icon: Tag, path: "/admin/categorie", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In promozione", value: stats.promoted, icon: Star, path: "/admin/annunci", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Messaggi non letti", value: stats.unread, icon: MessageSquare, path: "/admin/messaggi", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Benvenuto nel pannello di controllo.</p>
        </div>
        <Link
          to="/admin/annunci/nuovo"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuovo annuncio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, path, color, bg }) => (
          <Link key={label} to={path} className="group bg-white border border-gray-100 hover:border-brand-200 hover:shadow-md rounded-xl p-5 transition-all">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-heading font-bold text-2xl text-gray-900 mb-0.5">{loading ? "—" : value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent messages */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading font-semibold text-gray-900 text-sm">Ultimi messaggi</h3>
          <Link to="/admin/messaggi" className="text-xs text-brand-600 hover:underline font-medium">Vedi tutti</Link>
        </div>
        {recentInquiries.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Nessun messaggio ricevuto.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInquiries.map(inq => (
              <div key={inq.id} className="px-6 py-4 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!inq.is_read ? "bg-brand-500" : "bg-gray-200"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800">{inq.name}</span>
                    {inq.listing_title && (
                      <span className="text-xs text-gray-400 truncate">· {inq.listing_title}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{inq.message}</p>
                </div>
                <span className="text-xs text-gray-300 shrink-0">
                  {new Date(inq.created_date).toLocaleDateString("it-IT")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}