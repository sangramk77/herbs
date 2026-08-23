import Autoplay from 'embla-carousel-autoplay';
import { MessageCircle } from 'lucide-react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';

interface Testimonial {
    id: string;
    name: string;
    designation?: string;
    description: string;
    image_url?: string | null;
}

interface TestimonialSectionProps {
    testimonials?: Testimonial[];
}

export function TestimonialSection({
    testimonials = [],
}: TestimonialSectionProps) {
    if (!testimonials.length) {
        return null;
    }

    return (
        <section className="aurora-glass-bg py-12 md:py-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <div className="relative mx-auto inline-flex flex-col items-center">
                        <div className="absolute -top-6 h-16 w-40 rounded-full bg-primary/20 blur-2xl" />
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-primary uppercase">
                            Testimonials
                        </div>
                        <h3 className="relative bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-3xl font-semibold tracking-tight text-transparent md:text-4xl lg:text-5xl">
                            Clients Feedbacks
                        </h3>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-primary/40" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-1 w-16 rounded-full bg-gradient-to-r from-primary/80 via-primary to-accent/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-px w-10 bg-primary/40" />
                        </div>
                    </div>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
                        Hear from seekers who chose authentic Rudraksha and felt
                        the difference — trusted guidance, genuine energy, and
                        results worth sharing.
                    </p>
                </div>

                {/* Testimonials Carousel */}
                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                        }),
                    ]}
                    className="mx-auto w-full max-w-5xl"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial) => (
                            <CarouselItem
                                key={testimonial.id}
                                className="md:basis-1/2 lg:basis-1/3"
                            >
                                <div className="relative flex h-full flex-col rounded-lg bg-background p-6 shadow-lg">
                                    {/* Quote Icon */}
                                    <div className="absolute top-4 right-4 text-primary/10">
                                        <MessageCircle className="h-16 w-16" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative flex h-full flex-col">
                                        {/* Image */}
                                        <div className="mb-4 flex justify-center">
                                            <img
                                                src={
                                                    testimonial.image_url ??
                                                    '/assets/img/user.jpg'
                                                }
                                                alt={testimonial.name}
                                                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div
                                            className="mb-4 flex-1 text-sm text-muted-foreground"
                                            dangerouslySetInnerHTML={{
                                                __html: testimonial.description,
                                            }}
                                        />

                                        {/* Name & Designation */}
                                        <div className="mt-auto text-center">
                                            <h5 className="font-semibold text-foreground">
                                                {testimonial.name}
                                            </h5>
                                            {testimonial.designation && (
                                                <p className="text-sm text-muted-foreground">
                                                    {testimonial.designation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Navigation arrows removed */}
                </Carousel>
            </div>
        </section>
    );
}
