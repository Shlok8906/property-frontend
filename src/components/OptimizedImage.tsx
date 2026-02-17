import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

function getWebpSource(src: string): string | null {
  // Performance: prefer a WebP variant when the file naming convention supports it.
  // Example: image.jpg -> image.webp (falls back to original if unavailable).
  if (!src) return null;
  if (/\.webp(\?|$)/i.test(src)) return src;

  const [path, query = ''] = src.split('?');
  if (!/\.(png|jpe?g)$/i.test(path)) return null;
  const webpPath = path.replace(/\.(png|jpe?g)$/i, '.webp');
  return query ? `${webpPath}?${query}` : webpPath;
}

export function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
  fetchPriority = 'auto'
}: OptimizedImageProps) {
  const webpSource = useMemo(() => getWebpSource(src), [src]);

  return (
    <picture>
      {webpSource && <source srcSet={webpSource} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={cn('w-full h-full object-cover', className)}
      />
    </picture>
  );
}
