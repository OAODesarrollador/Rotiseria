'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';
import { formatPrice } from '@/lib/utils';
import { Flame, Plus, Sparkles, Star } from 'lucide-react';

export default function ProductCard({ item, isCombo = false, index = 0 }) {
    const { addToCart } = useCart();
    const [justAdded, setJustAdded] = useState(false);

    const handleAdd = () => {
        addToCart(item, isCombo);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 900);
    };

    const getImgSrc = () => {
        const src = item.imagen || '/images/Logo.jpg';
        try {
            const u = new URL(src, 'http://localhost');
            if (
                u.hostname
                && (
                    u.hostname.endsWith('.public.blob.vercel-storage.com')
                    || u.hostname.endsWith('.private.blob.vercel-storage.com')
                )
            ) {
                return `/api/image/proxy?url=${encodeURIComponent(src)}`;
            }
        } catch (e) {
            // keep original
        }

        return src;
    };

    return (
        <article className={styles.card} style={{ '--delay': `${Math.min(index, 8) * 55}ms` }}>
            <div className={styles.imageContainer}>
                <img
                    src={getImgSrc()}
                    alt={item.nombre}
                    className={styles.image}
                    loading="lazy"
                />
                <div className={styles.badges}>
                    {item.categoria && <span>{item.categoria}</span>}
                    {isCombo && <span><Sparkles size={13} /> Oferta</span>}
                    {!isCombo && index % 4 === 0 && <span><Star size={13} /> Popular</span>}
                    {!isCombo && /picante|fugazzeta|milanesa/i.test(`${item.nombre} ${item.descripcion || ''}`) && (
                        <span><Flame size={13} /> Intenso</span>
                    )}
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.row}>
                    <h3 className={styles.title}>{item.nombre}</h3>
                    <span className={styles.price}>{formatPrice(item.precio)}</span>
                </div>
                <p className={styles.description}>
                    {isCombo ? item.items : item.descripcion || 'Preparacion casera lista para sumar a tu pedido.'}
                </p>
                <div className={styles.meta}>
                    <span>Detalles rápidos</span>
                    <span>20-35 min</span>
                    <span>{item.categoria || (isCombo ? 'Oferta' : 'Rotisería')}</span>
                    <span>{index % 3 === 0 ? 'Popular' : 'Casero'}</span>
                </div>
                <div className={styles.actions}>
                    <button
                        className={`btn btn-primary ${styles.addButton} ${justAdded ? styles.added : ''}`}
                        onClick={handleAdd}
                        disabled={!item.disponible && !isCombo}
                    >
                        {item.disponible !== false ? (
                            <>
                                <Plus size={18} />
                                {justAdded ? 'Agregado' : 'Agregar'}
                            </>
                        ) : 'Sin stock'}
                    </button>
                </div>
            </div>
        </article>
    );
}
