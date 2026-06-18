import HeroCarousel from "@/components/home/HeroCarousel";
import PromotedSection from "@/components/home/PromotedSection";
import SectionsHome from "@/components/home/SectionsHome";
import NewsSnippet from "@/components/home/NewsSnippet";

export default function Home() {
  return (
    <div>
      <HeroCarousel />
      <PromotedSection />
      <SectionsHome />
      <NewsSnippet />
    </div>
  );
}