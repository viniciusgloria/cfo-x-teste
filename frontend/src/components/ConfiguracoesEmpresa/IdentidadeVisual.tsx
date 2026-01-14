import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface IdentidadeVisualProps {
  data: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  onUploadLogo?: (tipo: 'sidebar' | 'miniSidebar' | 'favicon', file: File) => Promise<void>;
  isLoading: boolean;
}

const IMAGE_SPECS = {
  sidebar: { width: 246, height: 55, name: 'Logo Sidebar' },
  miniSidebar: { width: 40, height: 40, name: 'Mini Logo' },
  favicon: { width: 40, height: 40, name: 'Favicon' },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateImageDimensions = (
  file: File,
  tipo: 'sidebar' | 'miniSidebar' | 'favicon'
): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.onload = () => {
        const spec = IMAGE_SPECS[tipo];
        // Permitir 10% de tolerância nas dimensões
        const tolerance = 0.1;
        const widthMatch = Math.abs(img.width - spec.width) / spec.width <= tolerance;
        const heightMatch = Math.abs(img.height - spec.height) / spec.height <= tolerance;
        resolve(widthMatch && heightMatch);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export function IdentidadeVisual({
  data,
  onChange,
  onUploadLogo,
  isLoading,
}: IdentidadeVisualProps) {
  const refSidebar = useRef<HTMLInputElement>(null);
  const refMiniSidebar = useRef<HTMLInputElement>(null);
  const refFavicon = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState<string | null>(null);

  // Monitorar mudanças de dark mode
  useEffect(() => {
    // Verificar estado inicial
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Criar observer para mudanças de classe
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleLogoChange = async (
    tipo: 'sidebar' | 'miniSidebar' | 'favicon',
    ref: React.RefObject<HTMLInputElement>
  ) => {
    const file = ref.current?.files?.[0];
    if (!file) return;

  const spec = IMAGE_SPECS[tipo];

  // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PNG, JPG, SVG ou ICO');
      return;
    }

    // Validar dimensões
    const isValidDimensions = await validateImageDimensions(file, tipo);
    if (!isValidDimensions) {
      toast.error(
        `Dimensões incorretas. Esperado ${spec.width}x${spec.height}px (tolerância ±10%)`
      );
      return;
    }

    try {
      setUploadingLogo(tipo);

      if (onUploadLogo) {
        await onUploadLogo(tipo, file);
        toast.success(`${spec.name} atualizado com sucesso`);
      } else {
        // Simulação: converter para data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const key =
            tipo === 'sidebar'
              ? 'logo_sidebar'
              : tipo === 'miniSidebar'
                ? 'logo_mini'
                : 'favicon';
          onChange({ [key]: dataUrl });
          toast.success(`${spec.name} atualizado com sucesso`);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingLogo(null);
      // Limpar input
      if (ref.current) ref.current.value = '';
    }
  };

  const handleRemoveLogo = (tipo: 'sidebar' | 'miniSidebar' | 'favicon') => {
    const key =
      tipo === 'sidebar'
        ? 'logo_sidebar'
        : tipo === 'miniSidebar'
          ? 'logo_mini'
          : 'favicon';
    onChange({ [key]: null });
    toast.success('Logo removido');
  };

  const handleDrag = (e: React.DragEvent, tipo: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(tipo);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    tipo: 'sidebar' | 'miniSidebar' | 'favicon',
    ref: React.RefObject<HTMLInputElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (ref.current) {
        // @ts-ignore: assigning FileList to input files is supported in browsers
        ref.current.files = files;
        handleLogoChange(tipo, ref);
      }
    }
  };

  const renderLogoPreview = (
    tipo: 'sidebar' | 'miniSidebar' | 'favicon',
    logo: any,
    ref: React.RefObject<HTMLInputElement>
  ) => {
    const spec = IMAGE_SPECS[tipo];
    // Inverter somente se: dark mode está ativo E opção está selecionada
    const shouldInvert = isDarkMode && data.aplicar_inversao_logo === true;
    const isActive = dragActive === tipo;

    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        style={{ minHeight: '180px' }}
        onDragEnter={(e) => handleDrag(e, tipo)}
        onDragLeave={(e) => handleDrag(e, tipo)}
        onDragOver={(e) => handleDrag(e, tipo)}
        onDrop={(e) => handleDrop(e, tipo, ref)}
        onClick={() => ref.current?.click()}
      >
        {logo ? (
          <div className="text-center space-y-2">
            <img
              src={logo}
              alt={spec.name}
              className="max-w-full max-h-32 object-contain mx-auto"
              style={{ filter: shouldInvert ? 'invert(1)' : 'none' }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Clique ou arraste para substituir</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arraste a imagem aqui</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ou clique para selecionar</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">({spec.width}x{spec.height}px)</p>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/x-icon"
          onChange={() => {
            const refMap = {
              sidebar: refSidebar,
              miniSidebar: refMiniSidebar,
              favicon: refFavicon,
            } as const;
            handleLogoChange(tipo, refMap[tipo]);
          }}
          disabled={isLoading || uploadingLogo === tipo}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Seção de Logos */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Logos e Imagens
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo Sidebar */}
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Logo Sidebar:
            </label>
            {renderLogoPreview('sidebar', data.logo_sidebar || data.logo || null, refSidebar)}
            <div className="mt-3 space-y-2">
              {(data.logo_sidebar || data.logo) && (
                <Button
                  onClick={() => handleRemoveLogo('sidebar')}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full text-red-600 hover:text-red-700 flex items-center justify-center gap-2 whitespace-nowrap"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              * Recomendado: PNG ou SVG com fundo transparente.
            </p>
          </div>

          {/* Mini Logo */}
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Mini Logo:
            </label>
            {renderLogoPreview('miniSidebar', data.logo_mini || null, refMiniSidebar)}
            <div className="mt-3 space-y-2">
              {data.logo_mini && (
                <Button
                  onClick={() => handleRemoveLogo('miniSidebar')}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full text-red-600 hover:text-red-700 flex items-center justify-center gap-2 whitespace-nowrap"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              * Recomendado: PNG ou SVG com fundo transparente.
            </p>
          </div>

          {/* Favicon */}
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Favicon:
            </label>
            {renderLogoPreview('favicon', data.favicon || null, refFavicon)}
            <div className="mt-3 space-y-2">
              {data.favicon && (
                <Button
                  onClick={() => handleRemoveLogo('favicon')}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full text-red-600 hover:text-red-700 flex items-center justify-center gap-2 whitespace-nowrap"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              * Ícone da aba do navegador em formato PNG com fundo transparente.
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Seção de Tema */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Tema
        </h3>

        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="aplicar_inversao_logo"
            checked={data.aplicar_inversao_logo !== false}
            onChange={(e) =>
              onChange({ aplicar_inversao_logo: e.target.checked })
            }
            disabled={isLoading}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label
            htmlFor="aplicar_inversao_logo"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Inverter cores do logo em tema escuro
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          * Se habilitado, o logo terá cores invertidas de forma automática quando o tema escuro estiver ativo.
        </p>
      </div>

      {/* Card informativo */}
      <div className="bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
        <p className="text-sm text-purple-900 dark:text-purple-300 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span><strong>Dica:</strong> Use imagens em PNG com fundo transparente para melhor
          compatibilidade. As dimensões sugeridas devem ser respeitadas para melhor
          visualização.</span>
        </p>
      </div>
    </div>
  );
}

export default IdentidadeVisual;
