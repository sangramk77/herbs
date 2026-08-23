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
    image: '/assets/images/herbs-about-still-life.png',
};

export function AboutSection({ about = defaultAbout }: AboutSectionProps) {
    return (
        <section
            className="relative overflow-hidden bg-cover bg-center py-12 md:py-16 lg:py-20"
            style={{
                backgroundImage:
                    'url(/assets/images/herbs-about-background.png)',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#f4f8ef]/92 via-[#edf5f1]/78 to-[#e6eef9]/60" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Image */}
                    <div className="flex items-center justify-center">
                        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/30 p-2 shadow-[0_24px_80px_-28px_rgba(20,83,45,0.45)] backdrop-blur-sm">
                            <img
                                src={
                                    about.image.startsWith('/')
                                        ? about.image
                                        : `/upload/${about.image}`
                                }
                                alt="About Us"
                                className="aspect-[4/5] w-full max-w-md rounded-2xl object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center text-[#173c28]">
                        <div>
                            <h2 className="mb-6 bg-linear-to-r from-[#287441] via-[#3e8e4f] to-[#527eb5] bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_2px_16px_rgba(62,142,79,0.18)] md:text-4xl lg:text-5xl">
                                {about.heading1}
                            </h2>
                            <div
                                className="prose prose-sm md:prose-base max-w-none [&_p]:leading-relaxed [&_p]:text-[#345b3d]"
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
