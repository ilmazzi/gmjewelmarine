import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Star, Shield, Headphones } from "lucide-react";
import { api } from "@/api/client";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [settings, setSettings] = useState({});
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.entities.SiteSettings.list(),
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
    ]).then(([siteData, brands]) => {
      const map = {};
      siteData.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
      // Unique sections
      const seen = new Set();
      const unique = [];
      brands.forEach(b => { if (!seen.has(b.section)) { seen.add(b.section); unique.push(b.section); } });
      setSections(unique);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/catalogo?search=${encodeURIComponent(search)}`);
  };

  const heroImage = settings.hero_image || "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1800&q=80";

  return (
    <section className="relative pt-16 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[88vh] py-12">
          <div className="order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-6 border border-brand-100">
                <Star className="w-3 h-3 fill-current" />
                {settings.hero_tag || "Specialisti nautici dal 2000"}
              </span>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-[1.08] mb-6">
                {settings.hero_title ? settings.hero_title : (<>Trova la tua<br /><span className="text-brand-600">barca ideale.</span></>)}
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                {settings.hero_subtitle || "Barche, gommoni, motori e carrelli. Nuovo e usato selezionato dai migliori venditori."}
              </p>

              <form onSubmit={handleSearch} className="mb-8 max-w-xl rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-brand-900/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Cerca marca, modello o categoria"
                      className="h-14 w-full rounded-xl border border-gray-100 bg-gray-50 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all" />
                  </div>
                  <button type="submit" className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition-all hover:-translate-y-0.5 hover:from-brand-900 hover:via-brand-800 hover:to-brand-700">
                    Cerca nel catalogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>

              {/* Dynamic section quick links */}
              {sections.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {sections.map(sec => (
                    <Link key={sec} to={`/sezione/${sec}`}
                      className="px-4 py-2 bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 rounded-full text-sm text-gray-600 font-medium transition-all shadow-sm capitalize">
                      {sec}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /><span>Annunci verificati</span></div>
                <div className="flex items-center gap-1.5"><Headphones className="w-4 h-4 text-brand-500" /><span>Assistenza dedicata</span></div>
                <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-current" /><span>25+ anni di esperienza</span></div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/10 aspect-[4/3]">
              <img src={heroImage} alt="GM Jewel Marine" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Annunci disponibili</p>
                    <p className="font-heading font-bold text-gray-900 text-xl">Scopri il catalogo</p>
                  </div>
                  <Link to="/catalogo" className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-800 to-brand-600 text-white text-sm font-semibold rounded-lg hover:from-brand-900 hover:to-brand-700 transition-colors whitespace-nowrap">
                    Sfoglia <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-60 -z-10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-100 rounded-full blur-2xl opacity-60 -z-10" />
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none" />
    </section>
  );
}