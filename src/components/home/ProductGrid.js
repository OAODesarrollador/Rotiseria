'use client';

import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ items, isCombo, showFilters }) {
    const [filter, setFilter] = useState('Todos');
    const categories = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];

    const visible = filter === 'Todos' ? items : items.filter(i => i.categoria === filter);

    return (
        <div>
            {showFilters && (
                <div className={styles.filters}>
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setFilter(c)}
                            className={`btn ${filter === c ? 'btn-primary' : 'btn-secondary'} ${filter === c ? styles.activeFilter : styles.filter}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}
            <div className={styles.grid}>
                {visible.map(item => (
                    <ProductCard key={item.id} item={item} isCombo={isCombo} />
                ))}
            </div>
        </div>
    );
}
