'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './statistics.module.css';

export default function StatisticsClient() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [stats, setStats] = useState({
        products: 0,
        availableProducts: 0,
        unavailableProducts: 0,
        availabilityRate: 0,
        combos: 0,
        featuredCombos: 0,
        categories: 0,
        topCategories: []
    });
    const router = useRouter();

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [productsRes, combosRes, categoriesRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/combos'),
                fetch('/api/admin/categories')
            ]);

            if (!productsRes.ok || !combosRes.ok || !categoriesRes.ok) {
                throw new Error('No se pudieron obtener las estadísticas');
            }

            const [productsData, combosData, categoriesData] = await Promise.all([
                productsRes.json(),
                combosRes.json(),
                categoriesRes.json()
            ]);

            const products = productsData.data || [];
            const combos = combosData.data || [];
            const categories = categoriesData.data || [];
            const availableProducts = products.filter((p) => p.disponible).length;
            const unavailableProducts = products.length - availableProducts;
            const availabilityRate = products.length > 0
                ? Math.round((availableProducts / products.length) * 100)
                : 0;
            const featuredCombos = combos.filter((c) => c.destacado).length;

            const categoryCount = products.reduce((acc, product) => {
                const key = product.categoria || 'Sin categoría';
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            const topCategories = Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            setStats({
                products: products.length,
                availableProducts,
                unavailableProducts,
                availabilityRate,
                combos: combos.length,
                featuredCombos,
                categories: categories.length,
                topCategories
            });
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>📊 Estadísticas</h1>
                    <p>Resumen rápido del estado del catálogo</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={loadStats} className={`btn btn-primary ${styles.refreshBtn}`} disabled={loading}>
                        ⟳ Actualizar
                    </button>
                    <button onClick={() => router.push('/admin/dashboard')} className={`btn btn-secondary ${styles.backBtn}`}>
                        ← Volver
                    </button>
                </div>
            </div>

            {loading ? <div className={styles.loading}>Cargando estadísticas...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {!loading && !error ? (
                <>
                    <section className={styles.grid}>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos Totales</span>
                            <strong>{stats.products}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos Disponibles</span>
                            <strong>{stats.availableProducts}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Productos No Disponibles</span>
                            <strong>{stats.unavailableProducts}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Disponibilidad del Catálogo</span>
                            <strong>{stats.availabilityRate}%</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Combos Totales</span>
                            <strong>{stats.combos}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Combos Destacados</span>
                            <strong>{stats.featuredCombos}</strong>
                        </article>
                        <article className={styles.statCard}>
                            <span className={styles.label}>Categorías Totales</span>
                            <strong>{stats.categories}</strong>
                        </article>
                    </section>

                    <section className={styles.detailPanel}>
                        <h2>Top categorías por cantidad de productos</h2>
                        {stats.topCategories.length > 0 ? (
                            <ul className={styles.topList}>
                                {stats.topCategories.map(([category, qty]) => (
                                    <li key={category}>
                                        <span>{category}</span>
                                        <strong>{qty}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay datos de categorías para mostrar.</p>
                        )}
                    </section>

                    <p className={styles.updatedAt}>
                        Última actualización: {lastUpdated ? lastUpdated.toLocaleString('es-AR') : '-'}
                    </p>
                </>
            ) : null}
        </main>
    );
}
