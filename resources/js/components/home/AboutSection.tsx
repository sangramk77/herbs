interface AboutData {
    heading1: string;
    description: string;
    image: string;
}

interface AboutSectionProps {
    about?: AboutData;
}

const defaultAbout: AboutData = {
    heading1: 'A Product Of Punyatoya Enterprises.',
    description:
        '<p>"Natural Rudraksh" (www.naturalrudraksh.com) is one of the largest wholesaler of Natural Rudraksh In India. It deals with almost all varieties of Rudraksh and deliver round the India.</p><p>Natural Rudraksh is one of the trusted brand comes under "Punyatoya Enterprises", registered In Odisha, India.</p>',
    image: '1169489111necklace.png',
};

export function AboutSection({ about = defaultAbout }: AboutSectionProps) {
    return (
        <section
            className="relative bg-cover bg-fixed bg-center py-12 md:py-16 lg:py-20"
            style={{
                backgroundImage: 'url(/assets/img/bg/para.png)',
            }}
        >
            {/* Lighter Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Image */}
                    <div className="flex items-center justify-center">
                        <div className="overflow-hidden rounded-lg">
                            <img
                                src={`/upload/${about.image}`}
                                alt="About Us"
                                className="h-auto w-full max-w-md object-contain"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center text-white">
                        <div>
                            <h2 className="mb-6 bg-linear-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_2px_20px_rgba(251,191,36,0.5)] md:text-4xl lg:text-5xl">
                                {about.heading1}
                            </h2>
                            <div
                                className="prose prose-sm md:prose-base max-w-none [&_p]:leading-relaxed [&_p]:text-amber-100/90 [&_p]:drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
                                style={{ mixBlendMode: 'screen' }}
                                dangerouslySetInnerHTML={{
                                    __html: about.description,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
