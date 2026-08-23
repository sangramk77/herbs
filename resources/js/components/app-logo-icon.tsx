import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    const classes = ['inline-flex items-center justify-center', className]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes}>
            <img
                src="/assets/brand/herbs-mark.svg"
                alt="Herbs"
                className="h-full w-full object-contain"
                {...props}
            />
        </span>
    );
}
