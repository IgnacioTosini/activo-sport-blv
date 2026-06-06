"use client";

import { useEffect, useRef } from "react";
import "./cursor-glow.scss";

export default function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            if (!glowRef.current) return;

            glowRef.current.style.transform = `
                translate(${e.clientX - 175}px, ${e.clientY - 175}px)
            `;
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
        };
    }, []);

    return <div ref={glowRef} className="cursor-glow" />;
}