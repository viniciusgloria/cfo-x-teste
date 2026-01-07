import { ImgHTMLAttributes, ReactNode } from 'react';
import { User } from 'lucide-react';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
}

export function Avatar({ src, alt = '', size = 'md', className = '', children, ...props }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'md' ? 'avatar-md' : size === 'lg' ? 'avatar-lg' : 'avatar-xl';
  const base = `avatar ${sizeClass} ${className}`.trim();

  if (src) {
    return <img src={src} alt={alt} className={base} {...props} />;
  }

  return (
    <div className={base} {...(props as any)}>
      {children ?? <User />}
    </div>
  );
}
