'use client';

import { useEffect, useState } from 'react';
import styles from './CursorGlow.module.css';

const TRAIL_LENGTH = 7;

export default function CursorGlow() {
    const [position, setPosition] = useState({ x: -120, y: -120 });
    const [trail, setTrail] = useState(Array.from({ length: TRAIL_LENGTH }, () => ({ x: -120, y: -120 })));
    const [active, setActive] = useState(false);

    useEffect(() => {
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!canHover || reducedMotion) return undefined;

        let target = { x: -120, y: -120 };
        let frame;
        const handleMove = (event) => {
            target = { x: event.clientX, y: event.clientY };
            setPosition(target);
        };
        const handleOver = (event) => {
            setActive(Boolean(event.target.closest('a, button, [role="button"], input, select, textarea')));
        };
        const animateTrail = () => {
            setTrail(prev => {
                const next = [...prev];
                next[0] = {
                    x: next[0].x + (target.x - next[0].x) * 0.35,
                    y: next[0].y + (target.y - next[0].y) * 0.35,
                };
                for (let i = 1; i < next.length; i += 1) {
                    next[i] = {
                        x: next[i].x + (next[i - 1].x - next[i].x) * 0.34,
                        y: next[i].y + (next[i - 1].y - next[i].y) * 0.34,
                    };
                }
                return next;
            });
            frame = requestAnimationFrame(animateTrail);
        };

        window.addEventListener('pointermove', handleMove);
        document.addEventListener('mouseover', handleOver);
        frame = requestAnimationFrame(animateTrail);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            document.removeEventListener('mouseover', handleOver);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <>
            {trail.map((dot, index) => (
                <span
                    key={index}
                    className={styles.trail}
                    style={{
                        '--scale': `${1 - index * 0.09}`,
                        '--alpha': `${0.42 - index * 0.045}`,
                        transform: `translate3d(${dot.x}px, ${dot.y}px, 0) scale(${1 - index * 0.09})`,
                    }}
                    aria-hidden="true"
                />
            ))}
            <div
                className={`${styles.cursor} ${active ? styles.active : ''}`}
                style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
                aria-hidden="true"
            />
        </>
    );
}
