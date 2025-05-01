import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from "react-simple-maps";

// Tunisia's geographical center coordinates (approximate)
const TUNISIA_CENTER: [number, number] = [10.0, 34.0];

// Tunisian cities/coverage areas
const tunisianMarkers: { name: string; coordinates: [number, number]; size: number }[] = [
    { name: "Tunis", coordinates: [10.1815, 36.8065], size: 25 },
    { name: "Sfax", coordinates: [10.7667, 34.7333], size: 20 },
    { name: "Sousse", coordinates: [10.6400, 35.8300], size: 15 },
    { name: "Bizerte", coordinates: [9.8739, 37.2746], size: 12 },
    { name: "Kairouan", coordinates: [10.1005, 35.6781], size: 12 },
    { name: "Gabès", coordinates: [10.1167, 33.8833], size: 10 }
];

export function CoverageMap() {
    return (
        <div className="w-full h-full relative">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 3000,
                    center: TUNISIA_CENTER,
                }}
            >
                <ZoomableGroup zoom={1} center={TUNISIA_CENTER}>
                    {/* This is the critical part that renders the map shapes */}
                    <Geographies geography="https://unpkg.com/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const isHighlighted = geo.properties.name === "Tunisia";
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={isHighlighted ? "#b8d8fc" : "#dbeafe"}
                                        stroke="#FFFFFF"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: {
                                                fill: isHighlighted ? "#b8d8fc" : "#bfdbfe",
                                                outline: "none"
                                            },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* Markers for cities in Tunisia */}
                    {tunisianMarkers.map(({ name, coordinates, size }) => (
                        <Marker key={name} coordinates={coordinates}>
                            <circle r={size / 4} fill="#3B82F6" fillOpacity={0.8} />
                            <circle r={size / 3} fill="#3B82F6" fillOpacity={0.2} />
                            <text
                                textAnchor="middle"
                                y={-size / 8}
                                style={{
                                    fontFamily: "system-ui",
                                    fontSize: size / 12,
                                    fill: "#3B82F6",
                                    fontWeight: "bold",
                                }}
                            >
                                {name}
                            </text>
                        </Marker>
                    ))}
                </ZoomableGroup>
            </ComposableMap>

            {/* Legend */}
            <div className="absolute top-40 right-35  p-1.5 rounded shadow-sm z-10">
                <h4 className="text-xs font-medium mb-1 text-gray-700">Coverage Map</h4>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80"></div>
                    <span className="text-xs text-gray-600">Shipping Coverage</span>
                </div>
            </div>
        </div>
    );
}