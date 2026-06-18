import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.entities.SiteSettings.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 border-b border-gray-100 pb-12"
      >
        <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-3">Chi Siamo</p>
        <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-gray-900 mb-5 max-w-2xl leading-tight">
          {settings.about_title || "La nostra storia nel settore nautico."}
        </h1>
        <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
          {settings.about_subtitle || "Professionisti appassionati al tuo servizio per trovare la barca, il gommone o il motore dei tuoi sogni."}
        </p>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            {settings.about_content ? (
              <div
                className="prose text-gray-600 leading-relaxed text-base"
                dangerouslySetInnerHTML={{ __html: settings.about_content }}
              />
            ) : (
              <div className="space-y-5 text-gray-600 leading-relaxed text-base">
                <p>
                  Siamo una realtà specializzata nella compravendita di imbarcazioni, gommoni, motori marini e carrelli. La nostra esperienza pluriennale nel settore ci permette di offrire ai nostri clienti una selezione curata e di qualità, sia di prodotti nuovi che di usato selezionato.
                </p>
                <p>
                  Il nostro showroom offre un ampio catalogo di imbarcazioni di ogni tipologia, dalle piccole barche a vela ai potenti gommoni open, dai motori fuoribordo di ultima generazione ai carrelli su misura.
                </p>
                <p>
                  Ogni annuncio che pubblichiamo è accuratamente verificato e documentato. Ci impegniamo a fornire informazioni complete e trasparenti, affinché tu possa fare la scelta giusta in totale serenità.
                </p>
              </div>
            )}

            {settings.orari && (
              <div className="mt-8 p-5 rounded-2xl bg-brand-50 border border-brand-100">
                <p className="text-xs text-brand-500 uppercase tracking-wider mb-2 font-semibold">Orari di apertura</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{settings.orari}</p>
              </div>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-6">Contattaci</h3>

            {settings.address && (
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Indirizzo</p>
                <p className="text-gray-800 text-sm font-medium">{settings.address}</p>
              </div>
            )}

            {settings.phone && (
              <a href={`tel:${settings.phone}`}
                className="block p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 hover:bg-brand-50 transition-all group">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Telefono</p>
                <p className="text-gray-800 text-sm font-medium group-hover:text-brand-600 transition-colors">{settings.phone}</p>
              </a>
            )}

            {settings.email && (
              <a href={`mailto:${settings.email}`}
                className="block p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 hover:bg-brand-50 transition-all group">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Email</p>
                <p className="text-gray-800 text-sm font-medium group-hover:text-brand-600 transition-colors">{settings.email}</p>
              </a>
            )}

            {(settings.instagram || settings.facebook) && (
              <div className="flex gap-3 pt-2">
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 text-gray-600 hover:text-brand-600 transition-all text-sm font-medium">
                    Instagram
                  </a>
                )}
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 text-gray-600 hover:text-brand-600 transition-all text-sm font-medium">
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}