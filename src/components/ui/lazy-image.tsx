import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

const LazyImage = ({ className, wrapperClassName, src, alt, style, ...props }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative', wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        style={style}
        className={cn('transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
