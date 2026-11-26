import React, { useMemo } from 'react';

function hashCodeDeterministik(str, seed = 0) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function adalahFinderPattern(r, c, size) {
  const diKiriAtas = r < 7 && c < 7;
  const diKananAtas = r < 7 && c >= size - 7;
  const diKiriBawah = r >= size - 7 && c < 7;
  return diKiriAtas || diKananAtas || diKiriBawah;
}

function nilaiFinder(r, c) {
  if (r === 0 || r === 6 || c === 0 || c === 6) return true;
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
  return false;
}

export default function DeterministicQR({ value = 'CTX-TICKET', size = 104, dimmed = false }) {
  const gridSize = 21;

  const cells = useMemo(() => {
    const matrix = [];
    for (let r = 0; r < gridSize; r += 1) {
      for (let c = 0; c < gridSize; c += 1) {
        let dark = false;

        if (adalahFinderPattern(r, c, gridSize)) {
          let localR = r;
          let localC = c;
          if (c >= gridSize - 7) localC = c - (gridSize - 7);
          if (r >= gridSize - 7) localR = r - (gridSize - 7);
          dark = nilaiFinder(localR, localC);
        } else if (
          (r === 7 && (c < 8 || c >= gridSize - 8)) ||
          (c === 7 && (r < 8 || r >= gridSize - 8)) ||
          (r === gridSize - 8 && c < 8)
        ) {
          dark = false;
        } else if (r === 6 || c === 6) {
          dark = (r + c) % 2 === 0;
        } else {
          const bitHash = hashCodeDeterministik(`${value}:${r}:${c}`, r * 31 + c);
          dark = bitHash % 2 === 0;
        }

        if (dark) {
          matrix.push({ r, c });
        }
      }
    }
    return matrix;
  }, [value]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      shapeRendering="crispEdges"
      aria-label={`Kode QR untuk ${value}`}
      className={dimmed ? 'opacity-35 grayscale' : ''}
    >
      <rect width={gridSize} height={gridSize} fill="#FFFFFF" />
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c}
          y={r}
          width="1"
          height="1"
          fill="#14151A"
        />
      ))}
    </svg>
  );
}
