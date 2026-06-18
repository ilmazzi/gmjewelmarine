import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { api } from "@/api/client";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [sections, setSections] = useState([]); // [{ key, label, brands: [{name, models}] }]
  const [staticLinks] = useState([
    { label: "Catalogo", path: "/catalogo" },
    { label: "Offerte", path: "/catalogo?promoted=true" },
    { label: "News", path: "/news" },
    { label: "Chi Siamo", path: "/chi-siamo" },
    { label: "Contatti", path: "/contatti" },
  ]);
  const location = useLocation();
  const closeTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      api.entities.SiteSettings.list(),
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
    ]).then(([siteData, brands]) => {
      const map = {};
      siteData.forEach(s => { map[s.key] = s.value; });
      setSettings(map);

      // Build sections with their brands
      const sectionMap = {};
      brands.forEach(b => {
        if (!sectionMap[b.section]) sectionMap[b.section] = [];
        sectionMap[b.section].push({ name: b.name, models: b.models || [] });
      });

      // Respect saved order if present
      const orderSetting = siteData.find(s => s.key === "sections_order");
      let orderedKeys;
      if (orderSetting?.value) {
        const saved = orderSetting.value.split(",").map(s => s.trim()).filter(Boolean);
        const remaining = Object.keys(sectionMap).filter(k => !saved.includes(k));
        orderedKeys = [...saved.filter(k => sectionMap[k]), ...remaining.filter(k => sectionMap[k])];
      } else {
        orderedKeys = Object.keys(sectionMap);
      }

      const built = orderedKeys.map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        brands: sectionMap[key],
      }));
      setSections(built);
    }).catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); setActiveMenu(null); }, [location]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = (key) => { clearTimeout(closeTimer.current); setActiveMenu(key); };
  const handleMouseLeave = () => { closeTimer.current = setTimeout(() => setActiveMenu(null), 150); };
  const isActive = (path) => { const [p] = path.split("?"); return location.pathname === p; };

  const activeSectionData = sections.find(s => s.key === activeMenu);

  const brandSlug = (name) => encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"));
  const companyName = BRAND_NAME;
  const logoUrl = BRAND_LOGO;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm" : "bg-white/95 backdrop-blur-md"} border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logoUrl} alt={companyName} className="h-11 w-auto object-contain" />
              <span className="font-heading font-bold text-gray-900 text-lg hidden sm:inline">{companyName}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0" onMouseLeave={handleMouseLeave}>
              {/* Dynamic section links */}
              {sections.map(sec => (
                <div key={sec.key} className="relative" onMouseEnter={() => handleMouseEnter(sec.key)}>
                  <Link to={`/sezione/${sec.key}`}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${isActive(`/sezione/${sec.key}`) ? "text-brand-600" : "text-gray-700 hover:text-gray-900"}`}>
                    {sec.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === sec.key ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              ))}
              {/* Static links */}
              {staticLinks.map(link => (
                <Link key={link.path} to={link.path}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${isActive(link.path) ? "text-brand-600" : "text-gray-700 hover:text-gray-900"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Phone + Mobile toggle */}
            <div className="flex items-center gap-3">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
                  <Phone className="w-3.5 h-3.5" />{settings.phone}
                </a>
              )}
              <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega-menu */}
        {activeSectionData && activeSectionData.brands.length > 0 && (
          <div className="hidden lg:block absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50"
            onMouseEnter={() => handleMouseEnter(activeSectionData.key)}
            onMouseLeave={handleMouseLeave}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {activeSectionData.brands.map((brand, i) => (
                  <div key={i}>
                    <Link to={`/sezione/${activeSectionData.key}/${brandSlug(brand.name)}`}
                      className="block font-bold text-gray-900 text-sm mb-2 hover:text-brand-600 transition-colors uppercase tracking-wide">
                      {brand.name}
                    </Link>
                    <ul className="space-y-1">
                      {brand.models.map((m, j) => (
                        <li key={j}>
                          <Link to={`/sezione/${activeSectionData.key}/${brandSlug(brand.name)}?model=${encodeURIComponent(m)}`}
                            className="block text-sm text-gray-500 hover:text-brand-600 transition-colors py-0.5">
                            {m}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt={companyName} className="h-9 w-auto object-contain" />
                <span className="font-heading font-bold text-gray-900">{companyName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              {sections.map(sec => (
                <Link key={sec.key} to={`/sezione/${sec.key}`}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-50 hover:text-gray-900 capitalize">
                  {sec.label}
                </Link>
              ))}
              {staticLinks.map(link => (
                <Link key={link.path} to={link.path}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  {link.label}
                </Link>
              ))}
            </nav>
            {settings.phone && (
              <div className="px-5 pb-8">
                <a href={`tel:${settings.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl">
                  <Phone className="w-4 h-4" />{settings.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}