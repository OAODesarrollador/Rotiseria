'use client';

import { useState, useEffect } from 'react';
import styles from './ProductEditor.module.css';

function getPreviewSrc(src) {
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
        // Keep local object URLs and relative paths as-is.
    }

    return src;
}

export default function ProductEditor({ product = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: 'LA PARRILLA',
        imagen: '',
        disponible: true,
        orden: 99
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImageName, setSelectedImageName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [message, setMessage] = useState('');
    const defaultCategories = ['LA PARRILLA', 'COMBOS', 'BEBIDAS', 'POSTRES', 'EXTRAS'];
    const [categories, setCategories] = useState(defaultCategories);

    // Cargar datos del producto si es edición
    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: product.precio || '',
                categoria: product.categoria || 'LA PARRILLA',
                imagen: product.imagen || '',
                disponible: product.disponible !== false,
                orden: product.orden || 99
            });
            setSelectedImageName(product.imagen ? 'Imagen cargada' : '');
            setPreviewUrl(getPreviewSrc(product.imagen));
        }
    }, [product]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Obtener categorías desde la API (admin)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                if (!res.ok) return; // mantener por defecto
                const data = await res.json();
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    setCategories(data.data);
                }
            } catch (err) {
                // no hacer nada, usar categorías por defecto
            }
        };
        fetchCategories();
    }, []);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.precio || isNaN(formData.precio) || formData.precio < 0) {
            newErrors.precio = 'El precio debe ser válido';
        }
        if (!formData.categoria.trim()) {
            newErrors.categoria = 'La categoría es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedImageName(file.name);
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
        setUploadingImage(true);
        setMessage('');

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('folder', 'productos');

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: uploadData
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error al subir imagen de producto', {
                    status: response.status,
                    error: result.error,
                    details: result.details,
                });
                throw new Error(result.error || 'Error al subir imagen');
            }

            setFormData(prev => ({ ...prev, imagen: result.url }));
            setPreviewUrl(getPreviewSrc(result.url));
            setMessage('Imagen subida correctamente');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
            setSelectedImageName('');
            setPreviewUrl('');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const method = product ? 'PATCH' : 'POST';
            const payload = product 
                ? { id: product.id, ...formData }
                : formData;

            const response = await fetch('/api/admin/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar producto');
            }

            setMessage(product ? 'Producto actualizado' : 'Producto creado');
            if (onSave) {
                onSave();
            }
            
            // Limpiar formulario si es crear
            if (!product) {
                setFormData({
                    nombre: '',
                    descripcion: '',
                    precio: '',
                    categoria: 'LA PARRILLA',
                    imagen: '',
                    disponible: true,
                    orden: 99
                });
                setSelectedImageName('');
                setPreviewUrl('');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editor}>
            <h2>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>

            {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Asado Completo"
                        maxLength="100"
                    />
                    {errors.nombre && <span className={styles.error}>{errors.nombre}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Ej: Asado de tira con chimichurri casero"
                        maxLength="500"
                        rows="3"
                    />
                    <small>{formData.descripcion.length}/500</small>
                    {errors.descripcion && <span className={styles.error}>{errors.descripcion}</span>}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="precio">Precio ($) *</label>
                        <input
                            id="precio"
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                        />
                        {errors.precio && <span className={styles.error}>{errors.precio}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoría *</label>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                        >
                            {categories.map((c) => (
                                <option value={c} key={c}>{c}</option>
                            ))}
                        </select>
                        {errors.categoria && <span className={styles.error}>{errors.categoria}</span>}
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="orden">Orden de Presentación</label>
                        <input
                            id="orden"
                            type="number"
                            name="orden"
                            value={formData.orden}
                            onChange={handleChange}
                            min="0"
                            max="999"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="imagenUpload">Imagen</label>
                        <label htmlFor="imagenUpload" className={styles.fileLabel}>
                            Subir imagen a Vercel Blob
                        </label>
                        <input
                            id="imagenUpload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageUpload}
                            disabled={uploadingImage || loading}
                        />
                        {uploadingImage && <small>Subiendo imagen...</small>}
                        {selectedImageName && <small>Archivo: {selectedImageName}</small>}
                        {previewUrl && (
                            <div className={styles.imagePreview}>
                                <img src={previewUrl} alt="Vista previa del producto" />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="disponible"
                            checked={formData.disponible}
                            onChange={handleChange}
                        />
                        <span>Disponible</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                        {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className={`btn btn-secondary ${styles.cancelBtn}`}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
