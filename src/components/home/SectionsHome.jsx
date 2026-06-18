import { useEffect, useState } from "react";
import { api } from "@/api/client";
import SectionBlock from "./SectionBlock";

export default function SectionsHome() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    Promise.all([
      api.entities.Brand.filter({ is_active: true }, "sort_order"),
      api.entities.SiteSettings.filter({ key: "sections_order" }),
    ]).then(([brands, settings]) => {
      const seen = new Set();
      const unique = [];
      brands.forEach(b => {
        if (!seen.has(b.section)) { seen.add(b.section); unique.push(b.section); }
      });

      const orderVal = settings[0]?.value;
      if (orderVal) {
        const saved = orderVal.split(",").map(s => s.trim()).filter(Boolean);
        const remaining = unique.filter(s => !saved.includes(s));
        setSections([...saved.filter(s => unique.includes(s)), ...remaining]);
      } else {
        setSections(unique);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="py-6 space-y-10">
      {sections.map(sec => (
        <SectionBlock key={sec} section={sec} />
      ))}
    </div>
  );
}