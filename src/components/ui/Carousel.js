'use client';

import { useState, useEffect } from 'react';
import styles from './Carousel.module.css';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, ChevronRight, Clock, Plus, Star } from 'lucide-react';

export default function Carousel({ items }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { addToCart } = useCart();

    const getImgSrc = (src) => {
        const raw = src || '/images/Logo.jpg';
        try {
            const u = new URL(raw, 'http://localhost');
            if (u.hostname && (u.hostname.includes('drive.google.com') || u.hostname.includes('lh3.googleusercontent.com'))) {
                return `/api/image/proxy?url=${encodeURIComponent(raw)}`;
            }
        } catch {
            // Keep original src if URL parsing fails
        }
        return raw;
    };

    const goToNextSlide = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const goToPrevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
        }, 4000);

        return () => clearInterval(timer);
    }, [items.length]);

    if (!items || items.length === 0) return null;

    return (
        <div className={styles.carouselContainer}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
                >
                    <div className={styles.imageSide}>
                        <img src={getImgSrc(item.imagen)} alt={item.nombre} className={styles.image} />
                        <span className={styles.badge}>
                            <Star size={14} />
                            Combo destacado
                        </span>
                    </div>

                    <div className={styles.contentSide}>
                        <span className={styles.meta}><Clock size={15} /> Listo en 20-35 min</span>
                        <h2 className={styles.title}>{item.nombre}</h2>
                        <p className={styles.description}>
                            {item.items || item.descripcion}
                        </p>

                        <div className={styles.actionRow}>
                            <span className={styles.price}>{formatPrice(item.precio)}</span>
                            <button
                                className={`btn btn-primary ${styles.addButton}`}
                                onClick={() => addToCart(item, true)}
                            >
                                <Plus size={20} />
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={goToPrevSlide}
                aria-label="Imagen anterior"
            >
                <ChevronLeft size={22} />
            </button>

            <button
                type="button"
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={goToNextSlide}
                aria-label="Imagen siguiente"
            >
                <ChevronRight size={22} />
            </button>

            <div className={styles.controls}>
                {items.map((_, idx) => (
                    <button
                        type="button"
                        key={idx}
                        className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Ver combo ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

