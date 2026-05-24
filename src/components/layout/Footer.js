'use client';

import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

const footerBits = [
    '/images/Carne.png',
    '/images/PanAbajo.png',
    '/images/tomate.png',
    '/images/queso.png',
    '/images/lechuga.png',
    '/images/huevo.png',
    '/images/PanArriba.png',
];

const pickJumpingBits = () => {
    const shuffled = [...footerBits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((src, index) => ({
        id: `${src}-${Date.now()}-${index}`,
        src,
        left: 8 + Math.random() * 78,
        delay: index * 0.18,
        duration: 2.45 + Math.random() * 0.5,
        rotation: -12 + Math.random() * 24,
    }));
};

export default function Footer() {
    const [jumpingBits, setJumpingBits] = useState([]);

    useEffect(() => {
        setJumpingBits(pickJumpingBits());
        const interval = setInterval(() => {
            setJumpingBits(pickJumpingBits());
        }, 2800);

        return () => clearInterval(interval);
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={styles.jumpBits} aria-hidden="true">
                {jumpingBits.map(bit => (
                    <img
                        key={bit.id}
                        src={bit.src}
                        alt=""
                        style={{
                            left: `${bit.left}%`,
                            '--jump-delay': `${bit.delay}s`,
                            '--jump-duration': `${bit.duration}s`,
                            '--jump-rotation': `${bit.rotation}deg`,
                        }}
                    />
                ))}
            </div>
            <div className={styles.container}>

                <div className={styles.column}>
                    <h3 className={styles.title}>La Parrilla</h3>
                    <p className={styles.text}>
                        La mejor comida casera, carnes asadas y minutas.<br />
                        Hacé tu pedido online y recibilo en tu casa.
                    </p>
                    <br />
                    <h4 className={styles.title} style={{ fontSize: '1rem' }}>Horarios</h4>
                    <p className={styles.text}>Mar a Dom: 19:30 - 23:30</p>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.title}>Contacto</h3>
                    <p className={styles.text}>📍 Güemes 226 - Barrio San Pedro </p>
                    <p className={styles.text}>📞 370-4zzzzzzz</p>
                    <p className={styles.text}>📧 contacto@laparrilla.com</p>
                </div>

                <div className={styles.column} style={{ flex: 1.5 }}>
                    <h3 className={styles.title}>Dónde Estamos</h3>
                    <div className={styles.mapContainer}>
                        <iframe
                        
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d859.0065822558453!2d-58.1922352!3d-26.1786543!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x945caf5f2565d14d%3A0xe01acbaa8cca425!2sDVD%20Estrenos!5e1!3m2!1ses!2sar!4v1770157030224!5m2!1ses!2sar"
                            className={styles.map}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

            </div>
            <div className={styles.copyright}>
                © {new Date().getFullYear()} La Parrilla. Todos los derechos reservados.
            </div>
        </footer>
    );
}
