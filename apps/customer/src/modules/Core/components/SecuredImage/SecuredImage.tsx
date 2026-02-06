import React, { type ImgHTMLAttributes } from 'react';
import { getProxiedImageUrl } from '../../../../utils/urlUtils';

interface SecuredImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    // Add any custom props here if needed
    fallbackSrc?: string;
}

export const SecuredImage: React.FC<SecuredImageProps> = ({ src, alt, className, style, fallbackSrc, ...props }) => {
    // Use the proxy utility to get a URL that bypasses ngrok warning
    const proxiedSrc = getProxiedImageUrl(src);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
        } else {
            // Optional: hide the image or show a placeholder if no fallback is provided
            // e.currentTarget.style.display = 'none';
        }
    };

    return (
        <img
            src={proxiedSrc || fallbackSrc}
            alt={alt}
            className={className}
            style={style}
            onError={handleError}
            {...props}
        />
    );
};
