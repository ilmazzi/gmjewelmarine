import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(price);

export default function PromotedSection() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Listing.filter({ is_promoted: true, is_published: true }, "-created_date", 6)
      .then(setListings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              In evidenza
            </p>
            <h2 className="font-heading font-extrabold text-3xl text-gray-900">Annunci selezionati</h2>
          </div>
          <Link to="/catalogo?promoted=true" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Vedi tutti <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link to={`/annuncio/${listing.id}`} className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {listing.featured_image ? (
                      <img src={listing.featured_image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                        <span className="text-brand-200 text-3xl">⚓</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full uppercase tracking-wide shadow-sm">
                        In evidenza
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                        listing.condition === "new" ? "bg-green-500 text-white" : "bg-gray-800/70 text-white"
                      }`}>
                        {listing.condition === "new" ? "Nuovo" : "Usato"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {(listing.brand || listing.year) && (
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                        {[listing.brand, listing.year].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <h3 className="font-heading font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mb-2">
                      {listing.title}
                    </h3>
                    {(listing.engine_hp || listing.length_m) && (
                      <div className="flex gap-3 text-xs text-gray-400 mb-3">
                        {listing.engine_hp && <span>{listing.engine_hp} CV</span>}
                        {listing.length_m && <span>{listing.length_m} m</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {listing.price_on_request ? (
                        <span className="text-sm font-bold text-brand-600">Su richiesta</span>
                      ) : listing.price ? (
                        <span className="font-heading font-extrabold text-gray-900 text-lg">{formatPrice(listing.price)}</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                      <span className="text-xs text-gray-400 group-hover:text-brand-600 transition-colors font-medium flex items-center gap-1">
                        Dettagli <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}