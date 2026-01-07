import { useEffect } from 'react';

/**
 * Hook small helper to set document.title while mounted and restore previous title on unmount.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

export default usePageTitle;
