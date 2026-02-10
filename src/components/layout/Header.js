'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

export default function Header() {
    const { count, setIsOpen } = useCart();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/images/Logo2.jpg" alt="La Parrilla" style={{ height: '50px', borderRadius: '50%' }} />
                        <span>La Parrilla</span>
                    </div>
                </Link>
                <button
                    className={`btn btn-ghost ${styles.cartBtn}`}
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir carrito"
                >
                    <ShoppingCart size={24} />
                    {count > 0 && <span className={styles.badge}>{count}</span>}
                </button>
            </div>
        </header>
    );
}
