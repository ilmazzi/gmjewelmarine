import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/api/client";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1800&q=80",
    title: "",
    subtitle: "",
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.entities.SiteSettings.list(),
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
    ]).then(([siteData, brands]) => {
      const map = {};
      siteData.forEach(s => { map[s.key] = s.value; });

      if (map.hero_slides) {
        try {
          const parsed = JSON.parse(map.hero_slides);
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        } catch {}
      } else if (map.hero_image) {
        setSlides([{
          image: map.hero_image,
          title: map.hero_title || "",
          subtitle: map.hero_subtitle || "",
        }]);
      }

      const seen = new Set();
      const unique = [];
      brands.forEach(b => { if (!seen.has(b.section)) { seen.add(b.section); unique.push(b.section); } });
      setSections(unique);
    }).catch(() => {});
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/catalogo?search=${encodeURIComponent(search)}`);
  };

  const slide = slides[current] || DEFAULT_SLIDES[0];

  return (
    <section className="relative mb-20 h-screen min-h-[600px] max-h-[900px] overflow-visible pt-16">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 overflow-hidden"
        >
          <img
            src={slide.image}
            alt={slide.title || ""}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current + "-text"}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {slide.tag && (
                <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur text-white text-xs font-semibold rounded-full mb-5 border border-white/20">
                  {slide.tag}
                </span>
              )}
              {slide.title && (
                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.06] mb-5 drop-shadow-md">
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
                  {slide.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Section quick links */}
          {sections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sections.map(sec => (
                <Link key={sec} to={`/sezione/${sec}`}
                  className="px-4 py-2 bg-white/15 backdrop-blur border border-white/25 hover:bg-white/25 text-white rounded-full text-sm font-medium transition-all capitalize">
                  {sec}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="absolute bottom-0 left-0 right-0 z-30 translate-y-1/2 px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-slate-900/20"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca marca, modello o categoria"
                className="h-14 w-full rounded-xl border border-gray-100 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
            <button
              type="submit"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 px-7 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition-all hover:-translate-y-0.5 hover:from-brand-900 hover:via-brand-800 hover:to-brand-700"
            >
              Cerca nel catalogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}