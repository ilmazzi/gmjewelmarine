import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Mail, MailOpen, Trash2, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminMessages() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    api.entities.Inquiry.list("-created_date", 100)
      .then(setInquiries).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (inq) => {
    if (!inq.is_read) {
      await api.entities.Inquiry.update(inq.id, { is_read: true });
      load();
    }
    setSelected(inq);
  };

  const del = async (id) => {
    if (!confirm("Eliminare questo messaggio?")) return;
    await api.entities.Inquiry.delete(id);
    setSelected(null);
    load();
  };

  const unread = inquiries.filter(i => !i.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Messaggi</h1>
          {unread > 0 && (
            <p className="text-sm text-brand-600 mt-0.5 font-medium">{unread} non {unread === 1 ? "letto" : "letti"}</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Nessun messaggio ricevuto.</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[640px] overflow-y-auto">
              {inquiries.map(inq => (
                <button
                  key={inq.id}
                  onClick={() => markRead(inq)}
                  className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${selected?.id === inq.id ? "bg-brand-50 border-l-2 border-brand-500" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!inq.is_read ? "bg-brand-500" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm font-medium truncate ${!inq.is_read ? "text-gray-900" : "text-gray-500"}`}>
                          {inq.name}
                        </span>
                        <span className="text-xs text-gray-300 shrink-0">
                          {new Date(inq.created_date).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                      {inq.listing_title && (
                        <p className="text-xs text-brand-500 truncate mb-0.5">{inq.listing_title}</p>
                      )}
                      <p className="text-xs text-gray-400 line-clamp-1">{inq.message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm">
          {selected ? (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selected.created_date).toLocaleString("it-IT")}
                  </p>
                </div>
                <button
                  onClick={() => del(selected.id)}
                  className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {selected.listing_title && selected.listing_id && (
                <Link
                  to={`/annuncio/${selected.listing_id}`}
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-brand-600 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {selected.listing_title}
                </Link>
              )}

              {/* Contacts */}
              <div className="flex flex-wrap gap-2">
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selected.phone}
                  </a>
                )}
              </div>

              {/* Message body */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selected.message}</p>
              </div>

              {/* Reply actions */}
              <div className="flex gap-2 pt-1">
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.listing_title || "")}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Rispondi via email
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Chiama
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-300">
              <MailOpen className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Seleziona un messaggio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}