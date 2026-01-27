import React, { useState, useEffect, ImgHTMLAttributes } from 'react';

interface SecuredImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    // Add any custom props here if needed
    fallbackSrc?: string;
}

export const SecuredImage: React.FC<SecuredImageProps> = ({ src, alt, className, style, fallbackSrc, ...props }) => {
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        // Reset state when src changes
        setLoading(true);
        setError(false);
        setImageSrc(undefined);

        if (!src) {
            setLoading(false);
            return;
        }

        // Check if it's an ngrok URL (or we can just apply this to all merchant-images if needed)
        // Applying to all for consistency if they might be behind ngrok
        const isNgrok = src.includes('ngrok') || src.includes('merchant-images');

        if (!isNgrok) {
            setImageSrc(src);
            setLoading(false);
            return;
        }

        let objectUrl: string | null = null;
        let isActive = true;

        const fetchImage = async () => {
            try {
                const response = await fetch(src, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'Cache-Control': 'no-cache', // Optional: avoid browser cache issues
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${response.statusText}`);
                }

                const blob = await response.blob();
                if (isActive) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageSrc(objectUrl);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching image:', err);
                if (isActive) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isActive = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (loading) {
        // Optional: Render user-provided fallback or a skeleton here if desired.
        // For now, render nothing or a placeholder div to avoid layout shift usually handled by CSS
        return <div className={`image-loading-placeholder ${className}`} style={{ ...style, backgroundColor: '#f0f0f0' }}></div>;
    }

    if (error) {
        if (fallbackSrc) {
            return <img src={fallbackSrc} alt={alt} className={className} style={style} {...props} />;
        }
        // Render a broken image icon or nothing
        return <div className={`image-error-placeholder ${className}`} style={{ ...style, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</div>;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            style={style}
            {...props}
        />
    );
};
