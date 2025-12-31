import React, { SVGProps } from 'react';

export function IconShareNeural(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      {/* Focusing Corners */}
      <path d="M4 8V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Top & Bottom Pluses */}
      <path d="M12 2v3M10.5 3.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 19v3M10.5 20.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Side Dots */}
      <circle cx="2" cy="12" r="1" fill="currentColor" />
      <circle cx="22" cy="12" r="1" fill="currentColor" />

      {/* Central Hexagon */}
      <path d="M7 12l2.5-4.4h5l2.5 4.4-2.5 4.4h-5L7 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Center Arrow */}
      <path d="M9.5 12h5M12.5 10l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
