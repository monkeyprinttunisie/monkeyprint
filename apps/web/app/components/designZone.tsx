"use client";
import React from 'react';

interface DesignZoneProps {
    zone: {
        id: string;
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
    };
    isActive: boolean;
    showBorder: boolean;
    children: React.ReactNode;
}

const DesignZone: React.FC<DesignZoneProps> = ({
    zone,
    isActive,
    showBorder = false,
    children
}) => {
    return (
        <div
            className={`absolute ${showBorder ? 'border-2 border-dashed border-blue-400 border-opacity-90' : ''}`}
            style={{
                left: `50%`,
                top: `60%`,
                width: `${zone.width}px`,
                height: `${zone.height}px`,
                transform: `translate(-50%, -50%) translate(${zone.x}px, ${zone.y}px) rotate(${zone.rotation}deg)`,
                overflow: 'hidden',
                zIndex: isActive ? 4 : 1
            }}
            data-zone-id={zone.id}
        >
            {children}
        </div>
    );
};

export default DesignZone;