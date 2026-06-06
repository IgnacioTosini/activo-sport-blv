import { fetchBrands } from "@/actions/brands";
import { getProductByFeatured } from "@/actions/products";
import { Catalog, Hero } from "@/components/sections";
import { About } from "@/components/sections/about/About";
import { GlossaryOfSoccerShoes } from "@/components/sections/glossaryOfSoccerShoes/GlossaryOfSoccerShoes";
import { PremiumBrands } from "@/components/sections/premiumBrands/PremiumBrands";
import { BrandsBanner } from "@/components/ui/brandsBanner/BrandsBanner";

export default async function Home() {
  const brands = await fetchBrands();
  const products = await getProductByFeatured(true);
  return (
    <main>
      <Hero />
      <BrandsBanner brands={brands} />
      <Catalog products={products} />
      <PremiumBrands brands={brands} />
      <GlossaryOfSoccerShoes />
      <About />
      {/* <Review /> */}
    </main>
  );
}
