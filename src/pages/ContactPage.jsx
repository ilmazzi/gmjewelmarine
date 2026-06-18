import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.entities.SiteSettings.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.entities.Inquiry.create({ ...form, listing_title: "Contatto generico" });
    setSent(true);
    setLoading(false);
  };

  const contactItems = [
    { label: "Telefono", value: settings.phone, href: `tel:${settings.phone}` },
    { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { label: "Indirizzo", value: settings.address, href: null },
  ].filter(i => i.value);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Contattaci</p>
          <h1 className="font-heading font-extrabold text-4xl text-gray-900 mb-4">Siamo qui per te.</h1>
          <p className="text-gray-500 text-base max-w-xl">Hai domande su un annuncio o vuoi saperne di più? Scrivici o chiamaci direttamente.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Messaggio inviato</h3>
                <p className="text-gray-500 text-sm">Ti risponderemo il prima possibile.</p>
              </div>
            ) : (
              <>
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-6">Invia un messaggio</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Nome *"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      className="border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                    <Input
                      type="email"
                      placeholder="Email *"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required
                      className="border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <Input
                    placeholder="Telefono"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="border-gray-200 text-gray-900 placeholder:text-gray-400"
                  />
                  <Textarea
                    placeholder="Il tuo messaggio *"
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    required
                    rows={5}
                    className="border-gray-200 resize-none text-gray-900 placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 h-auto"
                  >
                    {loading ? "Invio in corso..." : "Invia messaggio"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            {contactItems.map(({ label, value, href }) => (
              <div key={label}>
                {href ? (
                  <a href={href} className="block p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 hover:bg-brand-50 transition-all group">
                     <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">{label}</p>
                     <p className="text-gray-800 font-medium group-hover:text-brand-600 transition-colors">{value}</p>
                   </a>
                  ) : (
                   <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                     <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">{label}</p>
                     <p className="text-gray-800 font-medium">{value}</p>
                   </div>
                )}
              </div>
            ))}

            {settings.orari && (
              <div className="p-5 rounded-2xl bg-brand-50 border border-brand-100">
                <p className="text-xs text-brand-500 uppercase tracking-wider mb-2 font-semibold">Orari di apertura</p>
                <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{settings.orari}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}