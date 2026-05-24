'use client';

import { useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ items, isCombo, showFilters }) {
    const [filter, setFilter] = useState('Todos');
    const categories = ['Todos', ...new Set(items.map(i => i.categoria).filter(Boolean))];

    const visible = filter === 'Todos' ? items : items.filter(i => i.categoria === filter);
    const sections = filter === 'Todos' && categories.length > 1
        ? categories
            .filter(c => c !== 'Todos')
            .map(category => ({
                category,
                items: items.filter(i => i.categoria === category)
            }))
            .filter(section => section.items.length > 0)
        : [{ category: filter === 'Todos' ? 'Todos los platos' : filter, items: visible }];

    return (
        <div className={styles.catalog}>
            {showFilters && (
                <div className={styles.filters} aria-label="Filtrar por categoria">
                    {categories.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setFilter(c)}
                            className={`${styles.filter} ${filter === c ? styles.activeFilter : ''}`}
                            aria-pressed={filter === c}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}
            {sections.map(section => (
                <section key={section.category} className={styles.categoryBlock}>
                    {section.category !== 'Todos los platos' && (
                        <div className={styles.categoryHeader}>
                            <div>
                                <span className={styles.sectionLabel}>Especialidad</span>
                                <h3>{section.category}</h3>
                            </div>
                            <span>{section.items.length} opciones</span>
                        </div>
                    )}
                    <div className={styles.grid}>
                        {section.items.map((item, index) => (
                            <ProductCard key={item.id} item={item} isCombo={isCombo} index={index} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
