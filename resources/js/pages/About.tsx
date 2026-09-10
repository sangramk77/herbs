import { Head } from '@inertiajs/react';

import { AboutHero } from '@/components/about/AboutHero';
import { AceProducts } from '@/components/about/AceProducts';
import { CredentialsSection } from '@/components/about/CredentialsSection';
import { ExperienceSection } from '@/components/about/ExperienceSection';
import { GallerySection } from '@/components/about/GallerySection';
import { MissionVision } from '@/components/about/MissionVision';
import { VideoSection } from '@/components/about/VideoSection';
import { WhyChooseSection } from '@/components/about/WhyChooseSection';
import { BackToTop } from '@/components/site/BackToTop';
import SiteLayout from '@/layouts/SiteLayout';
import type { Settings } from '@/types/site-types';

interface GalleryItem {
    image: string;
    description: string;
    image_url: string | null;
}

interface VideoItem {
    id: string;
    title: string;
    url: string;
    type?: 'external' | 'local';
    path?: string | null;
}

interface ExperienceItem {
    icon: string;
    title: string;
    description: string;
}

interface AboutData {
    about_heading: string | null;
    about_description: string | null;
    about_image: string | null;
    about_image_url: string | null;
    mission_text: string | null;
    vision_text: string | null;
    credentials_text: string | null;
    gallery: GalleryItem[];
    videos: VideoItem[];
    experience_items: ExperienceItem[];
}

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    image_url: string | null;
}

interface AboutPageProps {
    settings: Settings;
    about: AboutData;
    categories: CategoryItem[];
}

export default function AboutPage({
    settings,
    about,
    categories,
}: AboutPageProps) {
    return (
        <SiteLayout
            settings={settings}
            title={`About Us – ${settings.site_name || 'Herbs'}`}
            metaDescription={`Learn about ${settings.site_name || 'Herbs'} – our mission, values, gallery, credentials, and experience.`}
        >
            <Head>
                <title>{`About Us – ${settings.site_name || 'Herbs'}`}</title>
            </Head>

            <div className="min-h-screen font-display">
                <div>
                    {/* About Hero */}
                    <AboutHero
                        heading={about.about_heading}
                        description={about.about_description}
                        imageUrl={about.about_image_url}
                    />

                    {/* Mission & Vision */}
                    <MissionVision
                        missionText={about.mission_text}
                        visionText={about.vision_text}
                    />

                    {/* Gallery */}
                    {about.gallery.length > 0 && (
                        <GallerySection gallery={about.gallery} />
                    )}

                    {/* Our Credentials */}
                    {about.credentials_text && (
                        <CredentialsSection
                            text={about.credentials_text}
                            videos={about.videos.slice(0, 2)}
                        />
                    )}

                    {/* Videos */}
                    {about.videos.length > 2 && (
                        <VideoSection videos={about.videos.slice(2)} />
                    )}

                    {/* Our Experience */}
                    {about.experience_items.length > 0 && (
                        <ExperienceSection items={about.experience_items} />
                    )}

                    {/* Ace Products */}
                    {categories.length > 0 && (
                        <AceProducts categories={categories} />
                    )}

                    <WhyChooseSection />
                </div>
            </div>

            <BackToTop />
        </SiteLayout>
    );
}
