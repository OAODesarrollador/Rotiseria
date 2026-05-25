import { fetchCatalog } from '@/lib/catalog';
import ProductGrid from '@/components/home/ProductGrid';
import CartDrawer from '@/components/business/CartDrawer';
import HeroSection from '@/components/home/HeroSection';

// Revalidate every minute
export const revalidate = 60;

export default async function Home() {
  const { products, combos } = await fetchCatalog();
  const highlighted = combos.filter(c => c.destacado);
  const menuCount = products.length + combos.length;

  return (
    <>
      <HeroSection highlightedCombos={highlighted} allCombos={combos} productCount={menuCount} />

      <section className="flavor-strip" aria-hidden="true">
        <div>
          <span>al fuego</span>
          <span>bien cargado</span>
          <span>hecho al momento</span>
          <span>sabor de rotisería</span>
          <span>al fuego</span>
          <span>bien cargado</span>
          <span>hecho al momento</span>
          <span>sabor de rotisería</span>
        </div>
      </section>

      <div className="section-curve" aria-hidden="true" />

      <div className="container menu-shell">

        <section id="productos" style={{ marginTop: '0' }}>
          <div className="menu-heading">
            <span className="eyebrow">Carta caliente</span>
            <h2 className="section-title">Elegí tu pedido</h2>
            <p>Platos de rotisería, ofertas y favoritos listos para sumar al carrito.</p>
          </div>
          <ProductGrid items={products} isCombo={false} showFilters={true} />
        </section>
      </div>

      <div className="section-curve section-curve--finale" aria-hidden="true" />

      <section className="jump-finale" aria-label="Cierre de la carta">
        <div className="jump-finale__ticker" aria-hidden="true">
          <span>sentilo</span>
          <span>pedilo</span>
          <span>compartilo</span>
          <span>sentilo</span>
        </div>
        <div className="container jump-finale__inner">
          <div className="jump-finale__copy">
            <span className="eyebrow">Último llamado</span>
            <h2>Comé caliente, comé bien.</h2>
            <p>Armá tu pedido con favoritos de rotisería y terminá la compra en pocos pasos.</p>
            <a href="#productos" className="btn btn-primary">Volver a la carta</a>
          </div>

          <div className="jump-finale__stage" aria-hidden="true">
            <img className="jump-finale__main" src="/images/combo1.jpg" alt="" />
            <img className="jump-finale__piece piece-one" src="/images/empanada.jpg" alt="" />
            <img className="jump-finale__piece piece-two" src="/images/combo2.jpg" alt="" />
            <img className="jump-finale__piece piece-three" src="/images/combo3.jpg" alt="" />
            <img className="jump-finale__piece piece-four" src="/images/combo4.jpg" alt="" />
          </div>
        </div>
      </section>
      <CartDrawer />
    </>
  );
}
