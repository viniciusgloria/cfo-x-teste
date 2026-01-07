import React, { useRef, useState } from 'react';

export function Ripple({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function createRipple(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setRipple(false);
    setTimeout(() => setRipple(true), 10);
    setTimeout(() => setRipple(false), 400);
  }

  return (
    <div
      ref={ref}
      onClick={createRipple}
      className="relative overflow-hidden"
      style={{ display: 'contents' }}
    >
      {children}
      {coords && ripple && (
        <span
          className="pointer-events-none absolute block rounded-full bg-emerald-200/60 animate-ripple"
          style={{
            left: coords.x - 100,
            top: coords.y - 100,
            width: 200,
            height: 200,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}
