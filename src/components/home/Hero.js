import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.bg}>
                <img src="/images/combo1.jpg" alt="Parrilla Background" />
            </div>
            <div className={styles.content}>
                <h1 className={styles.title}>La Parrilla</h1>
                <p className={styles.subtitle}>Sabor casero, directo a tu mesa</p>
                <Link href="#ofertas" className="btn btn-primary cta">
                    Ver Ofertas
                </Link>
            </div>
        </section>
    );
}
