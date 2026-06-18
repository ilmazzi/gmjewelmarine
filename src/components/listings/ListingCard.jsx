import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);

export default function ListingCard({ listing }) {
  return (
    <Link to={`/annuncio/${listing.id}`} className="block group h-full">
      <div className={`h-full flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 ${
        listing.is_promoted ? "border-amber-200 shadow-amber-50/50" : "border-gray-100 shadow-sm"
      }`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 shrink-0">
          {listing.featured_image ? (
            <img
              src={listing.featured_image}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
              <span className="text-brand-200 text-4xl">⚓</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {listing.is_promoted && (
              <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                In evidenza
              </span>
            )}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              listing.condition === "new" ? "bg-green-500 text-white" : "bg-gray-800/70 text-white"
            }`}>
              {listing.condition === "new" ? "Nuovo" : "Usato"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex-1 mb-3">
            {(listing.brand || listing.year) && (
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                {[listing.brand, listing.year].filter(Boolean).join(" · ")}
              </p>
            )}
            <h3 className="font-heading font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
              {listing.title}
            </h3>
          </div>

          {(listing.engine_hp || listing.length_m) && (
            <div className="flex gap-3 mb-3 text-xs text-gray-400">
              {listing.engine_hp && <span>{listing.engine_hp} CV</span>}
              {listing.length_m && <span>{listing.length_m} m</span>}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            {listing.price_on_request ? (
              <span className="text-sm font-bold text-brand-600">Su richiesta</span>
            ) : listing.price ? (
              <span className="font-heading font-extrabold text-gray-900 text-base">
                {formatPrice(listing.price)}
              </span>
            ) : (
              <span className="text-sm text-gray-300">—</span>
            )}
            <span className="text-xs text-gray-400 group-hover:text-brand-600 transition-colors flex items-center gap-0.5">
              Dettagli <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}