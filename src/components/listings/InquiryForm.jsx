import { useState } from "react";
import { api } from "@/api/client";
import { Phone, Mail, CheckCircle } from "lucide-react";

export default function InquiryForm({ listingId, listingTitle, phone, email }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.entities.Inquiry.create({
      ...form,
      listing_id: listingId,
      listing_title: listingTitle,
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="text-center py-6">
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <h4 className="font-heading font-bold text-gray-900 mb-1">Richiesta inviata!</h4>
      <p className="text-sm text-gray-500">Ti contatteremo al più presto.</p>
    </div>
  );

  return (
    <div>
      <h4 className="font-heading font-bold text-gray-900 mb-4">Richiedi informazioni</h4>

      {(phone || email) && (
        <div className="flex flex-col gap-2 mb-5">
          {phone && (
            <a href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors text-sm font-semibold shadow-md shadow-brand-600/20">
              <Phone className="w-4 h-4" />
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}?subject=Info: ${encodeURIComponent(listingTitle)}`}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-brand-600 rounded-xl transition-colors text-sm font-semibold">
              <Mail className="w-4 h-4" />
              Scrivi email
            </a>
          )}
        </div>
      )}

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-xs text-gray-400 font-medium">oppure lascia un messaggio</span>
        </div>
      </div>

      <form onSubmit={handle} className="space-y-3">
        <input
          placeholder="Nome e cognome *"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
        <input
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
        <input
          placeholder="Telefono"
          value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
        <textarea
          placeholder="Il tuo messaggio *"
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          required
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-brand-600/20"
        >
          {loading ? "Invio in corso..." : "Invia richiesta"}
        </button>
      </form>
    </div>
  );
}