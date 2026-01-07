import React from 'react';
import toast from 'react-hot-toast';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log the error so we can inspect it in console
    // Also show a toast to the user instead of blank page
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
    try {
      toast.error('Ocorreu um erro ao abrir o modal. Veja console para mais detalhes.');
    } catch (e) {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">Ocorreu um erro ao renderizar este painel. Verifique o console para detalhes.</div>
      );
    }
    return this.props.children as any;
  }
}
