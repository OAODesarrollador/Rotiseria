import { fetchCatalog } from '@/lib/catalog';
import ProductGrid from '@/components/home/ProductGrid';
import CartDrawer from '@/components/business/CartDrawer';
import HeroSection from '@/components/home/HeroSection';

// Revalidate every minute
export const revalidate = 60;

export default async function Home() {
  const { products, combos } = await fetchCatalog();
  const highlighted = combos.filter(c => c.destacado);

  return (
    <>
      <div style={{ marginTop: '0' }}>
        <HeroSection highlightedCombos={highlighted} allCombos={combos} />
      </div>

      <div className="container" style={{ paddingBottom: '80px', marginTop: '40px' }}>

        {/* Products */}
        <section id="productos" style={{ marginTop: '0' }}>
          <h2 className="section-title">Carta Completa</h2>
          <ProductGrid items={products} isCombo={false} showFilters={true} />
        </section>
      </div>
      <CartDrawer />
    </>
  );
}
