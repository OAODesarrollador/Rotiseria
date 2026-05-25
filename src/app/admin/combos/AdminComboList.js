'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ComboEditor from '@/components/business/ComboEditor';
import styles from './AdminComboList.module.css';

function getComboImageSrc(src) {
    if (!src) return '';

    try {
        const url = new URL(src, 'http://localhost');
        if (
            url.hostname.endsWith('.public.blob.vercel-storage.com')
            || url.hostname.endsWith('.private.blob.vercel-storage.com')
        ) {
            return `/api/image/proxy?url=${encodeURIComponent(src)}`;
        }
    } catch {
        // Keep local or relative paths as-is.
    }

    return src;
}

function ComboImageThumb({ src, name }) {
    const [failed, setFailed] = useState(false);
    const imageSrc = getComboImageSrc(src);

    if (!imageSrc || failed) {
        return <span className={styles.imagePlaceholder}>Sin imagen</span>;
    }

    return (
        <img
            src={imageSrc}
            alt={name ? `Imagen de ${name}` : 'Imagen de la oferta'}
            className={styles.comboThumb}
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}

export default function AdminComboList() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchCombos();
    }, []);

    const fetchCombos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/combos');
            if (response.ok) {
                const data = await response.json();
                setCombos(data.data || []);
            } else {
                setMessage('Error al cargar ofertas');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/combos?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage('Oferta eliminada');
                fetchCombos();
            } else {
                setMessage('Error al eliminar oferta');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    const filteredCombos = combos.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && combos.length === 0) {
        return <div className={styles.loading}>Cargando ofertas...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>🍱 Gestión de Ofertas</h1>
                    <p className={styles.subtitle}>Administra precios, descripciones, items e imágenes</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={() => router.push('/admin/dashboard')} className={`btn btn-secondary ${styles.backBtn}`}>
                        ← Volver
                    </button>
                </div>
            </div>

            {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                    {message}
                    <button onClick={() => setMessage('')} className={`btn btn-ghost ${styles.closeBtn}`}>✕</button>
                </div>
            )}

            {showForm && !editingId ? (
                <ComboEditor
                    onSave={() => {
                        setShowForm(false);
                        fetchCombos();
                    }}
                    onCancel={() => setShowForm(false)}
                />
            ) : null}

            {editingId ? (
                <ComboEditor
                    combo={combos.find(c => c.id === editingId)}
                    onSave={() => {
                        setEditingId(null);
                        fetchCombos();
                    }}
                    onCancel={() => setEditingId(null)}
                />
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <button
                            className={`btn btn-primary ${styles.createBtn}`}
                            onClick={() => setShowForm(!showForm)}
                        >
                            + Crear Nueva Oferta
                        </button>

                        <div className={styles.filters}>
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Destacado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCombos.length > 0 ? (
                                    filteredCombos.map(combo => (
                                        <tr key={combo.id}>
                                            <td>{combo.id}</td>
                                            <td className={styles.thumbCell}>
                                                <ComboImageThumb src={combo.imagen} name={combo.nombre} />
                                            </td>
                                            <td className={styles.nameCell}>
                                                {combo.nombre}
                                                {(combo.items || combo.descripcion) && (
                                                    <small>{(combo.items || combo.descripcion).substring(0, 60)}...</small>
                                                )}
                                            </td>
                                            <td>${combo.precio}</td>
                                            <td>
                                                <span className={combo.destacado ? styles.available : styles.unavailable}>
                                                    {combo.destacado ? 'Sí' : 'No'}
                                                </span>
                                            </td>
                                            <td className={styles.actions}>
                                                <button
                                                    onClick={() => setEditingId(combo.id)}
                                                    className={`btn btn-secondary ${styles.editBtn}`}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(combo.id)}
                                                    className={`btn btn-danger ${styles.deleteBtn}`}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.noResults}>
                                            No se encontraron ofertas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.summary}>
                        Total: {filteredCombos.length} ofertas
                    </div>
                </>
            )}
        </div>
    );
}
