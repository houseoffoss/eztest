'use client';

import React from 'react';

interface EZTestLogoProps {
  width?: number;
  height?: number;
  patternId?: string;
}

export function EZTestLogo({
  width = 24,
  height = 24,
  patternId = 'pattern0_105_611'
}: EZTestLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="24" height="24" fill={`url(#${patternId})`} />
      <defs>
        <pattern
          id={patternId}
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref={`#image_${patternId}`}
            transform="scale(0.03125 0.0344828)"
          />
        </pattern>
        <image
          id={`image_${patternId}`}
          width="32"
          height="29"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}
