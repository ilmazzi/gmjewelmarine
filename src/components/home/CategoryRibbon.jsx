import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=90";

export default function CategoryRibbon() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api.entities.Brand.filter({ is_active: true }, "sort_order")
      .then(brands => {
        const seen = new Set();
        const unique = [];
        brands.forEach(b => {
          if (!seen.has(b.section)) {
            seen.add(b.section);
            unique.push(b.section);
          }
        });
        setSections(unique);
      }).catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-black overflow-hidden" style={{ minHeight: 380 }}>

          {/* Background image — right half only, fading into black */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2" />
            <div className="w-1/2 relative">
              <img
                src={HERO_IMAGE}
                alt="GM Jewel Marine"
                className="w-full h-full object-cover object-center"
                style={{ minHeight: 380 }}
              />
              {/* Fade to black from left */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to right, #000000 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0) 100%)" }} />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: 380 }}>

            {/* Main heading */}
            <div className="px-10 pt-12 pb-6 flex-1 flex items-center">
              <h2
                className="font-heading font-extrabold text-white leading-none"
                style={{ fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "-0.03em", maxWidth: "50%" }}
              >
                Cosa stai<br />cercando?
              </h2>
            </div>

            {/* Bottom bar — thin separator + nav links */}
            <div className="border-t border-white/20 px-10 py-5 flex items-center gap-10">
              <Link
                to="/catalogo"
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                Scopri <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-8 ml-auto flex-wrap">
                {sections.map(sec => (
                  <Link
                    key={sec}
                    to={`/sezione/${sec}`}
                    className="text-white hover:text-white/60 font-heading font-semibold capitalize transition-colors whitespace-nowrap"
                    style={{ fontSize: "1.25rem" }}
                  >
                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}