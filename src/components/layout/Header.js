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
                    <img src="/images/Logo2.jpg" alt="La Parrilla" />
                    <span>La Parrilla</span>
                </Link>
                <nav className={styles.nav} aria-label="Principal">
                    <a href="#productos">Menu</a>
                    <Link href="/checkout">Carrito</Link>
                </nav>
                <button
                    className={styles.cartBtn}
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir carrito"
                    type="button"
                >
                    <ShoppingCart size={24} />
                    {count > 0 && <span className={styles.badge}>{count}</span>}
                </button>
            </div>
        </header>
    );
}
