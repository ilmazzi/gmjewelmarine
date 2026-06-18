import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { ChevronLeft, ChevronRight, Share2, X, Ruler, Zap, Calendar } from "lucide-react";
import InquiryForm from "@/components/listings/InquiryForm";
import { motion } from "framer-motion";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    Promise.all([
      api.entities.Listing.filter({ id }),
      api.entities.SiteSettings.list(),
    ]).then(([listings, siteSettings]) => {
      const l = listings[0];
      if (l) {
        setListing(l);
        if (l.category_id) {
          api.entities.Category.filter({ id: l.category_id })
            .then(cats => setCategory(cats[0]))
            .catch(() => {});
        }
      }
      const map = {};
      siteSettings.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);

  const allImages = listing ? [
    listing.featured_image,
    ...(listing.images || [])
  ].filter(Boolean) : [];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 pt-24 flex flex-col items-center justify-center gap-4">
      <h2 className="font-heading text-2xl text-gray-500">Annuncio non trovato</h2>
      <Link to="/catalogo" className="text-brand-600 hover:underline text-sm">← Torna al catalogo</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/catalogo" className="hover:text-brand-600 transition-colors">Catalogo</Link>
            {category && <><span>/</span><Link to={`/sezione/${category.slug || category.name.toLowerCase()}`} className="hover:text-brand-600 transition-colors">{category.name}</Link></>}
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[200px]">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
            {/* LEFT: Gallery + Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                {/* Main image */}
                <div
                  className="relative aspect-[16/9] overflow-hidden cursor-zoom-in group bg-gray-100"
                  onClick={() => allImages.length > 0 && setLightbox(true)}
                >
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[currentImage]}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-brand-50">
                      <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); setCurrentImage(p => (p - 1 + allImages.length) % allImages.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setCurrentImage(p => (p + 1) % allImages.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                        {currentImage + 1} / {allImages.length}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {listing.is_promoted && (
                      <span className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                        In Promozione
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow ${
                      listing.condition === "new" ? "bg-green-500 text-white" : "bg-gray-800/80 text-white"
                    }`}>
                      {listing.condition === "new" ? "Nuovo" : "Usato"}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                          i === currentImage
                            ? "ring-2 ring-brand-600 ring-offset-1 opacity-100"
                            : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + meta */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {category && (
                    <span className="text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-100">
                      {category.name}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    listing.condition === "new"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-gray-50 text-gray-600 border-gray-100"
                  }`}>
                    {listing.condition === "new" ? "Nuovo" : "Usato"}
                  </span>
                </div>

                <h1 className="font-heading font-extrabold text-2xl lg:text-3xl text-gray-900 leading-snug mb-2">
                  {listing.title}
                </h1>

                {listing.brand && (
                  <p className="text-gray-400 text-sm uppercase tracking-wider">
                    {[listing.brand, listing.model, listing.year].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {/* Quick specs */}
              {(listing.engine_hp || listing.length_m || listing.year) && (
                <div className="grid grid-cols-3 gap-3">
                  {listing.engine_hp && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-brand-600" />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Potenza</p>
                      <p className="font-heading font-bold text-gray-900">{listing.engine_hp} CV</p>
                    </div>
                  )}
                  {listing.length_m && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                        <Ruler className="w-4 h-4 text-brand-600" />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Lunghezza</p>
                      <p className="font-heading font-bold text-gray-900">{listing.length_m} m</p>
                    </div>
                  )}
                  {listing.year && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-brand-600" />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Anno</p>
                      <p className="font-heading font-bold text-gray-900">{listing.year}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-gray-900 mb-4 text-lg">Descrizione</h3>
                  <div
                    className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: listing.description }}
                  />
                </div>
              )}

              {/* Specs table */}
              {listing.specs && listing.specs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-gray-900 mb-4 text-lg">Specifiche Tecniche</h3>
                  <div className="divide-y divide-gray-50">
                    {listing.specs.map((spec, i) => (
                      <div key={i} className="flex justify-between items-center py-3">
                        <span className="text-sm text-gray-500">{spec.label}</span>
                        <span className="text-sm text-gray-900 font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Price + Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Prezzo</p>
                  {listing.price_on_request ? (
                    <p className="font-heading font-extrabold text-2xl text-brand-600 mb-1">Su richiesta</p>
                  ) : listing.price ? (
                    <p className="font-heading font-extrabold text-3xl text-gray-900 mb-1">
                      {formatPrice(listing.price)}
                    </p>
                  ) : (
                    <p className="text-gray-400 mb-1">Prezzo non specificato</p>
                  )}
                  <p className="text-xs text-gray-400">IVA inclusa dove applicabile</p>
                </div>

                {/* Contact card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <InquiryForm
                    listingId={listing.id}
                    listingTitle={listing.title}
                    phone={settings.phone}
                    email={settings.email}
                  />
                </div>

                {/* Share */}
                <button
                  onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-all bg-white shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Condividi annuncio
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={allImages[currentImage]}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setCurrentImage(p => (p - 1 + allImages.length) % allImages.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setCurrentImage(p => (p + 1) % allImages.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}