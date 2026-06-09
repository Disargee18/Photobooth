import React from 'react';

// Common placeholder event label
const EVENT_LABEL = "GROOM & BRIDE · MM/DD/YY";

// Helper for minimal SVG slots
const Slot = ({ x, y, w, h }) => (
  <rect x={x} y={y} width={w} height={h} fill="white" />
);

export const TEMPLATES = [
  {
    id: 'A',
    name: 'Layout A',
    size: '6x2 Strip · 3 Pose',
    slots: 3,
    orientation: 'portrait',
    aspectRatio: 3 / 4, // Portrait crop for each photo
    gridTemplate: `
      "p1"
      "p2"
      "p3"
      "footer"
    `,
    gridCols: '1fr',
    gridRows: '1fr 1fr 1fr 40px',
    preview: () => (
      <svg viewBox="0 0 100 300" className="w-full h-full text-white">
        <rect width="100" height="300" fill="black" />
        <Slot x="10" y="10" w="80" h="80" />
        <Slot x="10" y="100" w="80" h="80" />
        <Slot x="10" y="190" w="80" h="80" />
        <text x="50" y="285" fill="white" fontSize="8" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">EVENT LABEL</text>
      </svg>
    ),
  },
  {
    id: 'B',
    name: 'Layout B',
    size: '6x2 Strip · 3 Pose',
    slots: 3,
    orientation: 'portrait',
    aspectRatio: 4 / 3, // Landscape crop for wider photos in narrow strip
    gridTemplate: `
      "p1"
      "p2"
      "p3"
      "footer"
    `,
    gridCols: '1fr',
    gridRows: '1fr 1fr 1fr 40px',
    preview: () => (
      <svg viewBox="0 0 120 300" className="w-full h-full text-white">
        <rect width="120" height="300" fill="black" />
        <Slot x="10" y="10" w="100" h="70" />
        <Slot x="10" y="90" w="100" h="70" />
        <Slot x="10" y="170" w="100" h="70" />
        <text x="60" y="280" fill="white" fontSize="8" textAnchor="middle" fontFamily="sans-serif">EVENT LABEL</text>
      </svg>
    ),
  },
  {
    id: 'C',
    name: 'Layout C',
    size: '6x2 Strip · 4 Pose',
    slots: 4,
    orientation: 'portrait',
    aspectRatio: 3 / 4,
    gridTemplate: `
      "p1"
      "p2"
      "p3"
      "p4"
      "footer"
    `,
    gridCols: '1fr',
    gridRows: '1fr 1fr 1fr 1fr 40px',
    preview: () => (
      <svg viewBox="0 0 100 340" className="w-full h-full text-white">
        <rect width="100" height="340" fill="black" />
        <Slot x="10" y="10" w="80" h="65" />
        <Slot x="10" y="85" w="80" h="65" />
        <Slot x="10" y="160" w="80" h="65" />
        <Slot x="10" y="235" w="80" h="65" />
        <text x="50" y="325" fill="white" fontSize="8" textAnchor="middle" fontFamily="sans-serif">EVENT LABEL</text>
      </svg>
    ),
  },
  {
    id: 'D',
    name: 'Layout D',
    size: '6x2 Strip · 4 Pose',
    slots: 4,
    orientation: 'portrait',
    aspectRatio: 3 / 4,
    gridTemplate: `
      "p1 p2"
      "p3 p4"
      "footer footer"
    `,
    gridCols: '1fr 1fr',
    gridRows: '1fr 1fr 40px',
    preview: () => (
      <svg viewBox="0 0 100 300" className="w-full h-full text-white">
        <rect width="100" height="300" fill="black" />
        <Slot x="10" y="10" w="35" h="120" />
        <Slot x="55" y="10" w="35" h="120" />
        <Slot x="10" y="140" w="35" h="120" />
        <Slot x="55" y="140" w="35" h="120" />
        <text x="50" y="285" fill="white" fontSize="8" textAnchor="middle" fontFamily="sans-serif">EVENT LABEL</text>
      </svg>
    ),
  },
  {
    id: 'E',
    name: 'Layout E',
    size: '4x6 (4R) · 2 Pose',
    slots: 2,
    orientation: 'portrait',
    aspectRatio: 4 / 3, // Landscape stacked in a portrait frame
    gridTemplate: `
      "p1"
      "p2"
      "footer"
    `,
    gridCols: '1fr',
    gridRows: '1fr 1fr 40px',
    preview: () => (
      <svg viewBox="0 0 200 300" className="w-full h-full text-white">
        <rect width="200" height="300" fill="black" />
        <Slot x="10" y="10" w="180" h="120" />
        <Slot x="10" y="140" w="180" h="120" />
        <text x="100" y="285" fill="white" fontSize="10" textAnchor="middle" fontFamily="sans-serif">EVENT LABEL</text>
      </svg>
    ),
  },
  {
    id: 'F',
    name: 'Layout F',
    size: '4x6 (4R) · 1 Pose',
    slots: 1,
    orientation: 'portrait',
    aspectRatio: 3 / 4,
    gridTemplate: `
      "p1"
      "footer"
    `,
    gridCols: '1fr',
    gridRows: '1fr 40px',
    preview: () => (
      <svg viewBox="0 0 200 300" className="w-full h-full text-white">
        <rect width="200" height="300" fill="black" />
        <Slot x="10" y="10" w="180" h="250" />
        <text x="100" y="285" fill="white" fontSize="10" textAnchor="middle" fontFamily="sans-serif">EVENT LABEL</text>
      </svg>
    ),
  },
];
