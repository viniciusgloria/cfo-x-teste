import React, { useState, useRef, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Camera, Upload, RefreshCw, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect: (avatarUrl: string) => void;
  currentAvatar?: string;
}

export function AvatarModal({ isOpen, onClose, onAvatarSelect, currentAvatar }: AvatarModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate random seed for DiceBear API
  const generateRandomSeed = () => Math.random().toString(36).substring(2, 15);

  // Generate avatars using DiceBear API
  const generateAvatars = useCallback(async () => {
    setIsGenerating(true);
    try {
      const avatars: string[] = [];
      for (let i = 0; i < 6; i++) {
        const seed = generateRandomSeed();
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        avatars.push(avatarUrl);
      }
      setGeneratedAvatars(avatars);
    } catch (error) {
      toast.error('Erro ao gerar avatares');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG ou PNG.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 2MB.');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize to 200x200 (center crop square)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 200;

          canvas.width = size;
          canvas.height = size;

          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          const resizedDataUrl = canvas.toDataURL(file.type);
          setSelectedAvatar(resizedDataUrl);
          setIsUploading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao processar imagem');
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle avatar selection
  const handleAvatarClick = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (selectedAvatar) {
      onAvatarSelect(selectedAvatar);
      onClose();
      setSelectedAvatar('');
      setGeneratedAvatars([]);
    } else {
      toast.error('Selecione um avatar primeiro');
    }
  };

  // Generate avatars on modal open
  React.useEffect(() => {
    if (isOpen && generatedAvatars.length === 0) {
      generateAvatars();
    }
  }, [isOpen, generatedAvatars.length, generateAvatars]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar Foto do Perfil"
      size="large"
    >
      <div className="space-y-6">
        {/* Generated Avatars Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Avatares Sugeridos:
            </h3>
            <Button
              variant="outline"
              onClick={generateAvatars}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Gerar Novos
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {generatedAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarClick(avatar)}
                className={`relative w-24 h-24 rounded-full border-4 transition-all hover:scale-105 ${
                  selectedAvatar === avatar
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full rounded-full object-cover"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ou faça upload da sua própria imagem:
          </h3>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-600 dark:text-gray-400">Processando imagem...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Arraste uma imagem aqui ou{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      clique para selecionar
                    </button>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    JPG, PNG até 2MB • Será redimensionada para 200x200px
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedAvatar && (
            <div className="mt-4 flex justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img
                  src={selectedAvatar}
                  alt="Avatar selecionado"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAvatar}>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}