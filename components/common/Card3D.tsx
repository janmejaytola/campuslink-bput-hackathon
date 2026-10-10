'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt angle in degrees, default 5
  glare?: boolean;
  highlightBorder?: boolean;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}

export function Card3D({
  children,
  className = '',
  maxTilt = 5,
  glare = true,
  highlightBorder = false,
  onClick,
  role,
  ariaLabel,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTouchOrReducedMotion, setIsTouchOrReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const m1 = window.matchMedia('(hover: none)');
    const m2 = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setIsTouchOrReducedMotion(m1.matches || m2.matches);
    };
    update();
    m1.addEventListener('change', update);
    m2.addEventListener('change', update);
    return () => {
      m1.removeEventListener('change', update);
      m2.removeEventListener('change', update);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTouchOrReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalised between -1 and 1
    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    const rotateX = -normY * maxTilt;
    const rotateY = normX * maxTilt;

    setTransform(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`);

    if (glare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.16,
      });
    }
  };

  const handlePointerEnter = () => {
    if (isTouchOrReducedMotion) return;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    if (isTouchOrReducedMotion) return;
    setIsHovered(false);
    setTransform('rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative preserve-3d transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:focus-visible:ring-[#16CFFF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#020817] ${
        isHovered ? 'z-10' : 'z-0'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        transform: isTouchOrReducedMotion ? undefined : transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Specular Glare Overlay */}
      {glare && !isTouchOrReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(22, 207, 255, 0.28) 0%, rgba(0, 229, 212, 0.09) 35%, transparent 70%)`,
            opacity: glarePosition.opacity,
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle illuminated border halo when hovered or active */}
      {highlightBorder && (
        <div
          className={`pointer-events-none absolute -inset-[1px] rounded-[inherit] bg-gradient-to-r from-[#16CFFF]/40 via-[#00E5D4]/30 to-[#00BFA6]/40 blur-xs transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-40'
          }`}
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
}
