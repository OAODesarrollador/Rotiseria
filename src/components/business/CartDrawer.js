'use client';

import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartDrawer() {
    const { items, count, isOpen, setIsOpen, updateQuantity, removeFromCart, total } = useCart();
    const subtotal = total;

    return (
        <div
            className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
            onClick={() => setIsOpen(false)}
            aria-hidden={!isOpen}
        >
            <aside className={styles.drawer} onClick={e => e.stopPropagation()} aria-label="Carrito de compras">
                <div className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>Pedido actual</span>
                        <h2 className={styles.title}>Tu carrito</h2>
                    </div>
                    <div className={styles.countPill}>{count} item{count === 1 ? '' : 's'}</div>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Cerrar carrito" type="button">
                        <X size={22} />
                    </button>
                </div>

                <div className={styles.items}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}><ShoppingBag size={30} /></div>
                            <h3>Tu carrito esta vacio</h3>
                            <p>Sumá platos de la carta y volvé para finalizar tu pedido.</p>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className={styles.item}>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>{item.nombre}</span>
                                    <span className={styles.unitPrice}>{formatPrice(item.precio)} c/u</span>
                                    <div className={styles.controls}>
                                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.isCombo, -1)} aria-label={`Restar ${item.nombre}`} type="button">
                                            <Minus size={16} />
                                        </button>
                                        <span className={styles.quantity}>{item.quantity}</span>
                                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.isCombo, 1)} aria-label={`Sumar ${item.nombre}`} type="button">
                                            <Plus size={16} />
                                        </button>
                                        <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.isCombo)} aria-label={`Eliminar ${item.nombre}`} type="button">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <span className={styles.itemPrice}>{formatPrice(item.precio * item.quantity)}</span>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`} onClick={() => setIsOpen(false)}>
                            Finalizar pedido
                        </Link>
                    </div>
                )}
            </aside>
        </div>
    );
}
