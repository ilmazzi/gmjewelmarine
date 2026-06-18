import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";

export default function Footer() {
  const [settings, setSettings] = useState({});
  const [sections, setSections] = useState([]);
  const companyName = BRAND_NAME;
  const logoUrl = BRAND_LOGO;

  useEffect(() => {
    Promise.all([
      api.entities.SiteSettings.list(),
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
    ]).then(([siteData, brands]) => {
      const map = {};
      siteData.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
      const seen = new Set();
      const unique = [];
      brands.forEach(b => { if (!seen.has(b.section)) { seen.add(b.section); unique.push(b.section); } });
      setSections(unique);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-[#111827] text-white">

      {/* CTA strip — sobria, non urlata */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-white mb-1">
              Pronto a trovare la tua imbarcazione?
            </h3>
            <p className="text-gray-400 text-sm">Scopri il nostro catalogo sempre aggiornato.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/catalogo"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">
              Sfoglia il catalogo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {settings.phone && (
              <a href={`tel:${settings.phone}`}
                className="flex items-center gap-1.5 px-5 py-2.5 border border-white/20 text-white font-semibold rounded-lg text-sm hover:bg-white/10 transition-colors">
                <Phone className="w-3.5 h-3.5" /> Chiamaci
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt={companyName} className="h-10 w-auto object-contain" />
              <span className="font-heading font-extrabold text-white text-xl tracking-tight">
                {companyName}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              {settings.footer_tagline || "Specialisti nella vendita di barche, gommoni, motori e carrelli. Nuovo e usato selezionato."}
            </p>
            <div className="flex gap-2">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Categorie */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">Categorie</h4>
            <ul className="space-y-3">
              {sections.map(sec => (
                <li key={sec}>
                  <Link to={`/sezione/${sec}`} className="text-sm text-gray-400 hover:text-white transition-colors capitalize">
                    {sec}
                  </Link>
                </li>
              ))}
              <li><Link to="/catalogo" className="text-sm text-gray-400 hover:text-white transition-colors">Tutto il catalogo</Link></li>
              <li><Link to="/chi-siamo" className="text-sm text-gray-400 hover:text-white transition-colors">Chi Siamo</Link></li>
              <li><Link to="/contatti" className="text-sm text-gray-400 hover:text-white transition-colors">Contatti</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">Contatti</h4>
            <ul className="space-y-4">
              {settings.address && (
                <li className="flex items-start gap-2.5 text-sm text-gray-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-600" />
                  {settings.address}
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} {companyName}. Tutti i diritti riservati.</p>
          <Link to="/admin" className="text-xs text-gray-700 hover:text-gray-500 transition-colors">Area Admin</Link>
        </div>
      </div>
    </footer>
  );
}