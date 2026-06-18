import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SECTION_IMAGES_DEFAULT = {
  barche: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1600&q=85",
  gommoni: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1600&q=85",
  motori: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85",
  carrelli: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=85",
  usato: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=85",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);

function ListingMiniCard({ listing }) {
  return (
    <Link to={`/annuncio/${listing.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0 w-52">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {listing.featured_image ? (
          <img src={listing.featured_image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">⚓</div>
        )}
        <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
          listing.condition === "new" ? "bg-white text-gray-700" : "bg-gray-800 text-white"
        }`}>
          {listing.condition === "new" ? "Nuovo" : "Usato"}
        </span>
      </div>
      <div className="p-3">
        {listing.brand && (
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-0.5">{listing.brand}</p>
        )}
        <h4 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
          {listing.title}
        </h4>
        <p className="text-xs font-bold text-gray-900">
          {listing.price_on_request ? "Su richiesta" : listing.price ? formatPrice(listing.price) : "—"}
        </p>
      </div>
    </Link>
  );
}

export default function SectionBlock({ section }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgImage, setBgImage] = useState(SECTION_IMAGES_DEFAULT[section] || SECTION_IMAGES_DEFAULT.barche);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.entities.Listing.filter({ section, is_published: true }, "-sort_order", 12)
      .then(setListings).catch(() => {}).finally(() => setLoading(false));

    api.entities.SiteSettings.filter({ key: `section_img_${section}` })
      .then(data => { if (data[0]?.value) setBgImage(data[0].value); })
      .catch(() => {});
  }, [section]);

  if (!loading && listings.length === 0) return null;
  const label = section.charAt(0).toUpperCase() + section.slice(1);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" });

  return (
    <div className="mb-2">
      {/* Banner fotografico */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={bgImage} alt={label} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="font-heading font-bold text-white text-3xl sm:text-4xl tracking-tight drop-shadow-md">
            {label}
          </h2>
          <Link
            to={`/sezione/${section}`}
            className="mt-2 flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Vedi tutti <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Griglia card */}
      <div className="bg-gray-50 py-10 px-4 sm:px-8 lg:px-16 mb-6">
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-52 rounded-xl bg-gray-200 animate-pulse overflow-hidden">
                <div className="aspect-[4/3]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
            {listings.length > 4 && (
              <>
                <button onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
              {listings.map(listing => (
                <div key={listing.id} style={{ scrollSnapAlign: "start" }}>
                  <ListingMiniCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}