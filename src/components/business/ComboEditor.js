'use client';

import { useEffect, useState } from 'react';
import styles from './ComboEditor.module.css';

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

export default function ComboEditor({ combo = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        items: '',
        precio: '',
        imagen: '',
        destacado: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedImageName, setSelectedImageName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (combo) {
            setFormData({
                id: combo.id || '',
                nombre: combo.nombre || '',
                descripcion: combo.descripcion || '',
                items: combo.items || '',
                precio: combo.precio ?? '',
                imagen: combo.imagen || '',
                destacado: combo.destacado === true
            });
            setSelectedImageName(combo.imagen ? 'Imagen cargada' : '');
            setPreviewUrl(getPreviewSrc(combo.imagen));
        }
    }, [combo]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const validateForm = () => {
        const newErrors = {};
        if (!combo && !formData.id.trim()) {
            newErrors.id = 'El ID es requerido';
        }
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (formData.precio === '' || isNaN(formData.precio) || Number(formData.precio) < 0) {
            newErrors.precio = 'El precio debe ser válido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            uploadData.append('folder', 'combos');

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: uploadData
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error al subir imagen de combo', {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage('');

        try {
            const method = combo ? 'PATCH' : 'POST';
            const payload = combo
                ? { id: combo.id, ...formData }
                : formData;

            const response = await fetch('/api/admin/combos', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar combo');
            }

            setMessage(combo ? 'Combo actualizado' : 'Combo creado');
            if (onSave) onSave();

            if (!combo) {
                setFormData({
                    id: '',
                    nombre: '',
                    descripcion: '',
                    items: '',
                    precio: '',
                    imagen: '',
                    destacado: false
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
            <h2>{combo ? 'Editar Combo' : 'Crear Nuevo Combo'}</h2>

            {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="id">ID *</label>
                    <input
                        id="id"
                        type="text"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="Ej: c5"
                        maxLength="20"
                        disabled={!!combo}
                    />
                    {errors.id && <span className={styles.error}>{errors.id}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Combo Familiar"
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
                        placeholder="Ej: 1 Pollo + 1 Pizza + Coca 1.5L"
                        maxLength="500"
                        rows="3"
                    />
                    <small>{formData.descripcion.length}/500</small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="items">Items</label>
                    <textarea
                        id="items"
                        name="items"
                        value={formData.items}
                        onChange={handleChange}
                        placeholder="Ej: Pollo, Pizza, Coca"
                        maxLength="500"
                        rows="2"
                    />
                    <small>{formData.items.length}/500</small>
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
                        <label htmlFor="comboImagenUpload">Imagen</label>
                        <label htmlFor="comboImagenUpload" className={styles.fileLabel}>
                            Subir imagen a Vercel Blob
                        </label>
                        <input
                            id="comboImagenUpload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageUpload}
                            disabled={uploadingImage || loading}
                        />
                        {uploadingImage && <small>Subiendo imagen...</small>}
                        {selectedImageName && <small>Archivo: {selectedImageName}</small>}
                        {previewUrl && (
                            <div className={styles.imagePreview}>
                                <img src={previewUrl} alt="Vista previa del combo" />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="destacado"
                            checked={formData.destacado}
                            onChange={handleChange}
                        />
                        <span>Destacado</span>
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                        {loading ? 'Guardando...' : (combo ? 'Actualizar' : 'Crear')}
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
