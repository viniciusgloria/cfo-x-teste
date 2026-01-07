import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationProgress: dispatcha eventos customizados para mostrar/ocultar a barra de loading
 * ao detectar mudanças de rota. Mostra a barra imediatamente e a esconde depois de um pequeno delay
 * para evitar flicker em rotas rápidas.
 */
export function NavigationProgress() {
  const loc = useLocation();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // show
    window.dispatchEvent(new CustomEvent('cfoshowloading'));

    // clear any previous
    if (timer.current) window.clearTimeout(timer.current);

    // hide after a short delay or when component re-renders next time
    timer.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cfohideloading'));
      timer.current = null;
    }, 500);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // trigger on pathname changes
  }, [loc.pathname]);

  return null;
}
