import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** A real, scannable QR code drawn as one SVG path. */
export const QrCode: React.FC<{ data: string; size: number; color?: string }> = ({
  data,
  size,
  color = '#111',
}) => {
  const { n, d } = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(data);
    q.make();
    const count = q.getModuleCount();
    let path = '';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (q.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { n: count, d: path };
  }, [data]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <path d={d} fill={color} />
    </svg>
  );
};
