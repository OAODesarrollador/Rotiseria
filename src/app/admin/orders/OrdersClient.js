'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import styles from './orders.module.css';

const PAYMENT_MAP = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    mercadopago: 'Tarjeta (MP)',
    mercadopago_app: 'Mercado Pago',
};

export default function OrdersClient() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [range, setRange] = useState('today');
    const [savingId, setSavingId] = useState('');
    const router = useRouter();

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch('/api/admin/orders/recent');
            if (!res.ok) {
                throw new Error('No se pudieron cargar los pedidos');
            }
            const data = await res.json();
            setOrders(data.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        if (range === 'today') return orders.filter((order) => order.day === 'today');
        if (range === 'yesterday') return orders.filter((order) => order.day === 'yesterday');
        return orders.filter((order) => order.day === 'today' || order.day === 'yesterday');
    }, [orders, range]);

    const setDeliveryStatus = async (orderId, deliveryStatus) => {
        try {
            setSavingId(orderId);
            const res = await fetch('/api/admin/orders/recent', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, deliveryStatus })
            });

            if (!res.ok) {
                throw new Error('No se pudo actualizar el estado del pedido');
            }

            setOrders((prev) => prev.map((order) => (
                order.id === orderId ? { ...order, deliveryStatus } : order
            )));
        } catch (err) {
            setError(err.message || 'Error al actualizar estado');
        } finally {
            setSavingId('');
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>🧾 Pedidos Recientes</h1>
                    <p>Pedidos del día actual y del día anterior</p>
                </div>
                <div className={styles.actions}>
                    <button onClick={loadOrders} className={`btn btn-primary ${styles.refreshBtn}`} disabled={loading}>
                        ⟳ Actualizar
                    </button>
                    <button onClick={() => router.push('/admin/dashboard')} className={`btn btn-secondary ${styles.backBtn}`}>
                        ← Volver
                    </button>
                </div>
            </header>

            {loading ? <div className={styles.info}>Cargando pedidos...</div> : null}
            {error ? <div className={styles.error}>{error}</div> : null}

            {!loading && !error ? (
                <>
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterBtn} ${range === 'today' ? styles.active : ''}`}
                            onClick={() => setRange('today')}
                        >
                            Hoy
                        </button>
                        <button
                            className={`${styles.filterBtn} ${range === 'yesterday' ? styles.active : ''}`}
                            onClick={() => setRange('yesterday')}
                        >
                            Ayer
                        </button>
                        <button
                            className={`${styles.filterBtn} ${range === 'all' ? styles.active : ''}`}
                            onClick={() => setRange('all')}
                        >
                            Todos
                        </button>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Entrega</th>
                                    <th>Pago</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Entregado</th>
                                    <th>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{new Date(order.date).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>#{order.id.slice(0, 8)}</td>
                                        <td>
                                            <div>{order.customerName}</div>
                                            <small>{order.customerPhone}</small>
                                        </td>
                                        <td>
                                            {order.deliveryMethod === 'envio' ? 'Envío' : 'Retiro'}
                                            {order.deliveryAddress ? <small>{order.deliveryAddress}</small> : null}
                                        </td>
                                        <td>{PAYMENT_MAP[order.paymentMethod] || order.paymentMethod}</td>
                                        <td>{formatPrice(order.total || 0)}</td>
                                        <td>
                                            <div className={styles.statusStack}>
                                                <span className={`${styles.status} ${styles.paymentStatus}`}>
                                                    Pago: {order.status || 'Pendiente'}
                                                </span>
                                                <span className={`${styles.status} ${order.deliveryStatus === 'ENTREGADO' ? styles.statusDelivered : styles.statusNotDelivered}`}>
                                                    Entrega: {order.deliveryStatus === 'ENTREGADO' ? 'Entregado' : 'No entregado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <label className={styles.deliveryCheckboxWrap}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.deliveryCheckbox}
                                                    checked={order.deliveryStatus === 'ENTREGADO'}
                                                    onChange={(e) => setDeliveryStatus(order.id, e.target.checked ? 'ENTREGADO' : 'NO_ENTREGADO')}
                                                    disabled={savingId === order.id}
                                                    aria-label={`Marcar pedido ${order.id.slice(0, 8)} como entregado`}
                                                />
                                            </label>
                                        </td>
                                        <td>
                                            <small>{order.itemsDisplay || '-'}</small>
                                            {order.comments ? <small>Obs: {order.comments}</small> : null}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className={styles.empty}>Sin pedidos para este filtro.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}
        </main>
    );
}
