import { useEffect, useState } from 'react';

export function TopLoadingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    window.addEventListener('cfoshowloading', show as EventListener);
    window.addEventListener('cfohideloading', hide as EventListener);

    return () => {
      window.removeEventListener('cfoshowloading', show as EventListener);
      window.removeEventListener('cfohideloading', hide as EventListener);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div className="h-1 bg-gradient-to-r from-green-400 via-green-600 to-green-400 animate-loading" style={{ width: '100%' }} />
    </div>
  );
}
