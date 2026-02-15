import React from 'react';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
    delay?: number; // kept for compatibility, though CSS animation delay is usually set in style
    color?: string; // fallback color
    shineColor?: string; // shine color
    spread?: number; // not directly used in simple CSS implementation but kept for prop compatibility
    direction?: "left" | "right"; // direction of shine
    yoyo?: boolean; // not used in simple CSS implementation
    pauseOnHover?: boolean; // not used in simple CSS implementation
}

const ShinyText: React.FC<ShinyTextProps> = ({
    text,
    disabled = false,
    speed = 2,
    className = '',
    shineColor = '#ffffff',
    color = '#b5b5b5'
}) => {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={`relative inline-block overflow-hidden ${className} ${disabled ? '' : 'animate-shine'}`}
            style={{
                backgroundImage: `linear-gradient(120deg, transparent 40%, ${shineColor} 50%, transparent 60%)`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: color, // Fallback/Base color
                animationDuration: animationDuration,
            } as React.CSSProperties}
        >
            {/* Helper to ensure text takes up space and base color is visible if background-clip doesn't work perfectly or for base layer */}
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 via-white to-neutral-500 bg-[length:200%_auto] animate-shine">
                {text}
            </span>
            <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .animate-shine {
          animation: shine ${speed}s linear infinite;
        }
      `}</style>
        </div>
    );
};

// Refined implementation to better match the "shiny" effect usually requested
const ShinyTextRefined: React.FC<ShinyTextProps> = ({
    text,
    disabled = false,
    speed = 3,
    className = '',
    color = '#b5b5b5'
}) => {
    return (
        <div
            className={`text-[#b5b5b5a4] bg-clip-text text-transparent bg-gradient-to-r from-[#b5b5b5] via-[#fff] to-[#b5b5b5] ${disabled ? '' : 'animate-shine'} ${className}`}
            style={{
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                animationDuration: `${speed}s`,
                color: 'transparent' // Important for background-clip to work
            }}
        >
            {text}
            <style jsx>{`
                @keyframes shine {
                    0% { background-position: 100%; }
                    100% { background-position: -100%; }
                }
                .animate-shine {
                    animation: shine ${speed}s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ShinyTextRefined;
