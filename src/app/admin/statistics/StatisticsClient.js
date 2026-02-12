'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './statistics.module.css';

export default function StatisticsClient() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        products: 0,
        availableProducts: 0,
        combos: 0,
        categories: 0
    });
    const router = useRouter();

    useEffect(() => {
        const loadStats = async () => {
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

                setStats({
                    products: products.length,
                    availableProducts: products.filter((p) => p.disponible).length,
                    combos: combos.length,
                    categories: categories.length
                });
            } catch (err) {
                setError(err.message || 'Error al cargar estadísticas');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>📊 Estadísticas</h1>
                    <p>Resumen rápido del estado del catálogo</p>
                </div>
                <button onClick={() => router.push('/admin/dashboard')} className={`btn btn-secondary ${styles.backBtn}`}>
                    ← Volver
                </button>
            </div>

            {loading ? <div className={styles.loading}>Cargando estadísticas...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {!loading && !error ? (
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
                        <span className={styles.label}>Combos Totales</span>
                        <strong>{stats.combos}</strong>
                    </article>
                    <article className={styles.statCard}>
                        <span className={styles.label}>Categorías Totales</span>
                        <strong>{stats.categories}</strong>
                    </article>
                </section>
            ) : null}
        </main>
    );
}
