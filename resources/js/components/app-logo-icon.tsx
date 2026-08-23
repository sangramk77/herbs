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
                src="/assets/img/logos.png"
                alt="Natural Rudraksh"
                className="h-full w-full object-contain"
                {...props}
            />
        </span>
    );
}
