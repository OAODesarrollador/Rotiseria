'use client';

import { useEffect, useState } from 'react';
import Carousel from '@/components/ui/Carousel';
import ComboModal from './ComboModal';
import styles from './Hero.module.css';
import { Clock, MapPin, ShoppingBag, Sparkles } from 'lucide-react';

export default function HeroSection({ highlightedCombos, allCombos, productCount = 0 }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 850);
        return () => clearTimeout(timer);
    }, []);

    const hasHighlighted = highlightedCombos && highlightedCombos.length > 0;

    return (
        <section className={styles.hero}>
            {loading && (
                <div className={styles.loader} role="status" aria-live="polite">
                    <div className={styles.loaderBurger} aria-hidden="true">
                        <span className={styles.bunTop} />
                        <span className={styles.lettuce} />
                        <span className={styles.cheese} />
                        <span className={styles.patty} />
                        <span className={styles.bunBottom} />
                    </div>
                    <span>Armando tu pedido...</span>
                </div>
            )}

            <div className={styles.bg} aria-hidden="true">
                <img src="/images/empanada.jpg" alt="" />
            </div>

            <div className={`container ${styles.inner}`}>
                <div className={styles.copy}>
                    <div className={styles.est}>Est. 2026 - Guemes 226</div>
                    <span className={styles.kicker}>
                        <Sparkles size={16} />
                        Rotiseria de barrio, pedido online
                    </span>
                    <h1 className={styles.title}>
                        <span>La Parrilla</span>
                        <span>La Parrilla</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Comida casera, combos abundantes y platos listos para retirar o recibir.
                    </p>
                    <div className={styles.actions}>
                        <a className={`btn btn-primary ${styles.cta}`} href="#productos">
                            <ShoppingBag size={20} />
                            Ver menu
                        </a>
                        {allCombos?.length > 0 && (
                            <button type="button" onClick={openModal} className={`btn btn-secondary ${styles.secondaryCta}`}>
                                Ver combos
                            </button>
                        )}
                    </div>
                    <div className={styles.stats} aria-label="Datos del servicio">
                        <span><Clock size={16} /> 20-35 min</span>
                        <span><MapPin size={16} /> Guemes 226</span>
                        <span>{productCount || 'Menu'} opciones</span>
                    </div>
                </div>

                <div className={styles.feature}>
                    
                    {hasHighlighted ? (
                        <Carousel items={highlightedCombos} />
                    ) : (
                        <div className={styles.heroPlate}>
                            <img src="/images/Logo.jpg" alt="La Parrilla" />
                            <span>Especiales del dia</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.marquee} aria-hidden="true">
                <div>
                    <span>minutas calientes</span>
                    <span>combos abundantes</span>
                    <span>retirá o pedí envío</span>
                    <span>rotisería local</span>
                </div>
                <div>
                    <span>minutas calientes</span>
                    <span>combos abundantes</span>
                    <span>retirá o pedí envío</span>
                    <span>rotisería local</span>
                </div>
            </div>

            <ComboModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                combos={allCombos}
            />
        </section>
    );
}
