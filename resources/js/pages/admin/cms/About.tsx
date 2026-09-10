import { Head, router } from '@inertiajs/react';
import { Film, Play, Plus, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';

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

interface AboutPageProps {
    auth?: { user?: { name: string; avatar?: string } };
    about: AboutData;
}

const ICON_OPTIONS = [
    'BookOpen',
    'FlaskConical',
    'Network',
    'Gem',
    'HeartHandshake',
    'ShieldCheck',
    'BadgeCheck',
    'Layers',
    'Star',
    'Award',
    'Truck',
    'Globe',
];

const ACCEPTED_GALLERY_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];
const GALLERY_IMAGE_ACCEPT = ACCEPTED_GALLERY_IMAGE_TYPES.join(',');
const GALLERY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const getYouTubeId = (url: string): string | null => {
    const match =
        url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        ) || url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);

    return match?.[1] ?? null;
};

const getVideoEmbedUrl = (url: string): string | null => {
    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
        return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

    if (vimeoMatch?.[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&autoplay=1`;
    }

    return null;
};

const getVideoDisplayPath = (video: VideoItem): string =>
    video.type === 'local' ? (video.path ?? video.url) : video.url;

const getLocalVideoSrc = (video: VideoItem): string | null => {
    if (video.type !== 'local') {
        return null;
    }

    return video.url.startsWith('/') || video.url.startsWith('http')
        ? video.url
        : (video.path ?? video.url);
};

const requestJson = async <T,>(
    url: string,
    method: 'POST' | 'DELETE',
    body?: FormData | Record<string, unknown>,
): Promise<T> => {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    const isFormData = body instanceof FormData;
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            ...(!isFormData && body
                ? { 'Content-Type': 'application/json' }
                : {}),
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
    const data: unknown = await response.json();

    if (!response.ok) {
        const message =
            typeof data === 'object' && data !== null && 'message' in data
                ? (data as { message?: string }).message
                : undefined;
        throw new Error(message || 'The request could not be completed.');
    }

    return data as T;
};

export default function AboutAdminPage({ auth, about }: AboutPageProps) {
    // ── About Content state ──────────────────────────────────────────
    const [aboutHeading, setAboutHeading] = useState(about.about_heading ?? '');
    const [aboutDescription, setAboutDescription] = useState(
        about.about_description ?? '',
    );
    const [aboutImageUrl, setAboutImageUrl] = useState(about.about_image_url);
    const [savingAbout, setSavingAbout] = useState(false);
    const aboutImageRef = useRef<HTMLInputElement>(null);

    // ── Mission / Vision ─────────────────────────────────────────────
    const [missionText, setMissionText] = useState(about.mission_text ?? '');
    const [visionText, setVisionText] = useState(about.vision_text ?? '');
    const [savingMV, setSavingMV] = useState(false);

    // ── Credentials ──────────────────────────────────────────────────
    const [credentialsText, setCredentialsText] = useState(
        about.credentials_text ?? '',
    );
    const [savingCreds, setSavingCreds] = useState(false);

    // ── Gallery ──────────────────────────────────────────────────────
    const [gallery, setGallery] = useState<GalleryItem[]>(about.gallery);
    const [galleryDesc, setGalleryDesc] = useState('');
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [deletingGalleryImage, setDeletingGalleryImage] = useState<
        string | null
    >(null);
    const galleryImageRef = useRef<HTMLInputElement>(null);

    // ── Videos ───────────────────────────────────────────────────────
    const [videos, setVideos] = useState<VideoItem[]>(about.videos);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [addingVideo, setAddingVideo] = useState(false);
    const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const videoFileRef = useRef<HTMLInputElement>(null);

    // ── Experience ───────────────────────────────────────────────────
    const [expItems, setExpItems] = useState<ExperienceItem[]>(
        about.experience_items,
    );
    const [savingExp, setSavingExp] = useState(false);

    // ════════════════════════════════════════════════════════════════
    // Handlers
    // ════════════════════════════════════════════════════════════════

    const handleSaveAbout = () => {
        setSavingAbout(true);
        const form = new FormData();
        form.append('about_heading', aboutHeading);
        form.append('about_description', aboutDescription);
        if (aboutImageRef.current?.files?.[0]) {
            form.append('about_image', aboutImageRef.current.files[0]);
        }
        router.post('/admin/cms/about/content', form, {
            preserveScroll: true,
            onSuccess: () => toast.success('About content saved.'),
            onError: () => toast.error('Failed to save about content.'),
            onFinish: () => setSavingAbout(false),
        });
    };

    const handleDeleteAboutImage = async () => {
        try {
            await requestJson('/admin/cms/about/image', 'DELETE');
            setAboutImageUrl(null);
            toast.success('Image deleted.');
        } catch {
            toast.error('Failed to delete image.');
        }
    };

    const handleSaveMV = () => {
        setSavingMV(true);
        router.post(
            '/admin/cms/about/mission-vision',
            { mission_text: missionText, vision_text: visionText },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Mission & Vision saved.'),
                onError: () => toast.error('Failed to save.'),
                onFinish: () => setSavingMV(false),
            },
        );
    };

    const handleSaveCredentials = () => {
        setSavingCreds(true);
        router.post(
            '/admin/cms/about/credentials',
            { credentials_text: credentialsText },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Credentials saved.'),
                onError: () => toast.error('Failed to save.'),
                onFinish: () => setSavingCreds(false),
            },
        );
    };

    const handleGalleryUpload = async () => {
        const file = galleryImageRef.current?.files?.[0];
        if (!file) {
            toast.error('Please select an image.');
            return;
        }

        if (!ACCEPTED_GALLERY_IMAGE_TYPES.includes(file.type)) {
            toast.error('Please upload a JPG, PNG, GIF, or WebP image.');
            return;
        }

        if (file.size > GALLERY_IMAGE_MAX_BYTES) {
            toast.error('Please upload an image smaller than 10 MB.');
            return;
        }

        setUploadingGallery(true);
        const form = new FormData();
        form.append('image', file);
        form.append('description', galleryDesc);
        try {
            const data = await requestJson<{ gallery: GalleryItem[] }>(
                '/admin/cms/about/gallery',
                'POST',
                form,
            );
            setGallery(data.gallery);
            setGalleryDesc('');
            if (galleryImageRef.current) galleryImageRef.current.value = '';
            toast.success('Image added to gallery.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload image. Ensure it is a valid JPG, PNG, GIF, or WebP file under 10 MB.',
            );
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleDeleteGalleryImage = async (imageName: string) => {
        if (!imageName) {
            toast.error('Unable to delete this image.');
            return;
        }

        setDeletingGalleryImage(imageName);
        try {
            const data = await requestJson<{ gallery: GalleryItem[] }>(
                '/admin/cms/about/gallery',
                'DELETE',
                { image: imageName },
            );
            setGallery(data.gallery);
            toast.success('Image removed.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete image.',
            );
        } finally {
            setDeletingGalleryImage(null);
        }
    };

    const handleAddVideo = async () => {
        const videoFile = videoFileRef.current?.files?.[0];

        if (!newVideoTitle.trim()) {
            toast.error('Please enter a title.');
            return;
        }

        if (!newVideoUrl.trim() && !videoFile) {
            toast.error('Please enter a URL or upload a video file.');
            return;
        }

        setAddingVideo(true);
        const form = new FormData();
        form.append('title', newVideoTitle);
        if (newVideoUrl.trim()) {
            form.append('url', newVideoUrl);
        }
        if (videoFile) {
            form.append('video', videoFile);
        }

        try {
            const data = await requestJson<{ videos: VideoItem[] }>(
                '/admin/cms/about/videos',
                'POST',
                form,
            );
            setVideos(data.videos);
            setNewVideoTitle('');
            setNewVideoUrl('');
            if (videoFileRef.current) videoFileRef.current.value = '';
            toast.success('Video added.');
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to add video.',
            );
        } finally {
            setAddingVideo(false);
        }
    };

    const handleDeleteVideo = async (id: string) => {
        setDeletingVideo(id);
        try {
            const data = await requestJson<{ videos: VideoItem[] }>(
                '/admin/cms/about/videos',
                'DELETE',
                { id },
            );
            setVideos(data.videos);
            toast.success('Video removed.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete video.',
            );
        } finally {
            setDeletingVideo(null);
        }
    };

    const handleSaveExperience = async () => {
        setSavingExp(true);
        try {
            await requestJson('/admin/cms/about/experience', 'POST', {
                experience_items: expItems,
            });
            toast.success('Experience items saved.');
        } catch {
            toast.error('Failed to save experience items.');
        } finally {
            setSavingExp(false);
        }
    };

    const updateExpItem = (
        index: number,
        field: keyof ExperienceItem,
        value: string,
    ) => {
        setExpItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const addExpItem = () => {
        setExpItems((prev) => [
            ...prev,
            { icon: 'ShieldCheck', title: '', description: '' },
        ]);
    };

    const removeExpItem = (index: number) => {
        setExpItems((prev) => prev.filter((_, i) => i !== index));
    };

    // ════════════════════════════════════════════════════════════════
    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="About Page Settings" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        About Page
                    </h2>
                    <p className="text-muted-foreground">
                        Manage all content displayed on the About Us page.
                    </p>
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
                        {[
                            {
                                value: 'content',
                                label: 'About Content',
                                activeClass:
                                    'data-[state=active]:bg-indigo-600 data-[state=active]:text-white',
                            },
                            {
                                value: 'mission-vision',
                                label: 'Mission & Vision',
                                activeClass:
                                    'data-[state=active]:bg-orange-600 data-[state=active]:text-white',
                            },
                            {
                                value: 'gallery',
                                label: 'Gallery',
                                activeClass:
                                    'data-[state=active]:bg-pink-600 data-[state=active]:text-white',
                            },
                            {
                                value: 'credentials',
                                label: 'Credentials',
                                activeClass:
                                    'data-[state=active]:bg-amber-600 data-[state=active]:text-white',
                            },
                            {
                                value: 'videos',
                                label: 'Videos',
                                activeClass:
                                    'data-[state=active]:bg-red-600 data-[state=active]:text-white',
                            },
                            {
                                value: 'experience',
                                label: 'Experience',
                                activeClass:
                                    'data-[state=active]:bg-emerald-600 data-[state=active]:text-white',
                            },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`rounded-lg text-stone-700 transition-all data-[state=active]:shadow dark:text-zinc-400 ${tab.activeClass}`}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── About Content ── */}
                    <TabsContent value="content" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="about-heading">
                                        Heading
                                    </Label>
                                    <Input
                                        id="about-heading"
                                        value={aboutHeading}
                                        onChange={(e) =>
                                            setAboutHeading(e.target.value)
                                        }
                                        placeholder="e.g. Rooted in Nature, Made for Everyday Wellbeing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="about-description">
                                        Description (HTML supported)
                                    </Label>
                                    <Textarea
                                        id="about-description"
                                        value={aboutDescription}
                                        onChange={(e) =>
                                            setAboutDescription(e.target.value)
                                        }
                                        rows={10}
                                        placeholder="Enter HTML content..."
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label>About Image</Label>
                                    {aboutImageUrl && (
                                        <div className="relative w-48">
                                            <img
                                                src={aboutImageUrl}
                                                alt="About"
                                                className="w-full rounded-xl border object-cover shadow"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleDeleteAboutImage}
                                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    <Input
                                        id="about-image-input"
                                        ref={aboutImageRef}
                                        type="file"
                                        accept="image/*"
                                    />
                                </div>
                                <Button
                                    id="save-about-btn"
                                    onClick={handleSaveAbout}
                                    disabled={savingAbout}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {savingAbout
                                        ? 'Saving…'
                                        : 'Save About Content'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Mission & Vision ── */}
                    <TabsContent value="mission-vision" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mission &amp; Vision</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mission-text">
                                        Mission Text (HTML supported)
                                    </Label>
                                    <Textarea
                                        id="mission-text"
                                        value={missionText}
                                        onChange={(e) =>
                                            setMissionText(e.target.value)
                                        }
                                        rows={8}
                                        className="font-mono text-sm"
                                        placeholder="<p>Our mission...</p>"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vision-text">
                                        Vision Text (HTML supported)
                                    </Label>
                                    <Textarea
                                        id="vision-text"
                                        value={visionText}
                                        onChange={(e) =>
                                            setVisionText(e.target.value)
                                        }
                                        rows={8}
                                        className="font-mono text-sm"
                                        placeholder="<p>Our vision...</p>"
                                    />
                                </div>
                                <Button
                                    id="save-mv-btn"
                                    onClick={handleSaveMV}
                                    disabled={savingMV}
                                    className="bg-orange-600 text-white hover:bg-orange-700"
                                >
                                    {savingMV
                                        ? 'Saving…'
                                        : 'Save Mission & Vision'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Gallery ── */}
                    <TabsContent value="gallery" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Photo Gallery</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Upload new image */}
                                <div className="rounded-xl border border-dashed border-pink-300 bg-pink-50 p-6 dark:bg-pink-950/20">
                                    <h3 className="mb-4 font-semibold text-stone-700 dark:text-stone-300">
                                        Add New Image
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="gallery-image-input">
                                                Image File
                                            </Label>
                                            <Input
                                                id="gallery-image-input"
                                                ref={galleryImageRef}
                                                type="file"
                                                accept={GALLERY_IMAGE_ACCEPT}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gallery-desc">
                                                Description (optional)
                                            </Label>
                                            <Input
                                                id="gallery-desc"
                                                value={galleryDesc}
                                                onChange={(e) =>
                                                    setGalleryDesc(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Caption for this image"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        id="add-gallery-btn"
                                        onClick={handleGalleryUpload}
                                        disabled={uploadingGallery}
                                        className="mt-4 bg-pink-600 text-white hover:bg-pink-700"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploadingGallery
                                            ? 'Uploading…'
                                            : 'Upload Image'}
                                    </Button>
                                </div>

                                {/* Gallery grid */}
                                {gallery.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {gallery.map((item) => (
                                            <div
                                                key={item.image}
                                                className="group relative overflow-hidden rounded-xl border bg-white shadow-sm"
                                            >
                                                <div className="aspect-square overflow-hidden">
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={
                                                                item.description
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <div className="px-2 py-1.5">
                                                        <p className="line-clamp-2 text-xs text-stone-600">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteGalleryImage(
                                                            item.image,
                                                        )
                                                    }
                                                    disabled={
                                                        deletingGalleryImage ===
                                                        item.image
                                                    }
                                                    className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
                                                    aria-label="Delete image"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-sm text-stone-400">
                                        No images in gallery yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Credentials ── */}
                    <TabsContent value="credentials" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Our Credentials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="credentials-text">
                                        Credentials Text (HTML supported)
                                    </Label>
                                    <Textarea
                                        id="credentials-text"
                                        value={credentialsText}
                                        onChange={(e) =>
                                            setCredentialsText(e.target.value)
                                        }
                                        rows={10}
                                        className="font-mono text-sm"
                                        placeholder="<p>We are certified...</p>"
                                    />
                                </div>
                                <Button
                                    id="save-creds-btn"
                                    onClick={handleSaveCredentials}
                                    disabled={savingCreds}
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    {savingCreds
                                        ? 'Saving…'
                                        : 'Save Credentials'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Videos ── */}
                    <TabsContent value="videos" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Videos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-6 dark:bg-red-950/20">
                                    <h3 className="mb-4 font-semibold text-stone-700 dark:text-stone-300">
                                        Add Video
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="video-title">
                                                Video Title
                                            </Label>
                                            <Input
                                                id="video-title"
                                                value={newVideoTitle}
                                                onChange={(e) =>
                                                    setNewVideoTitle(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. How to choose the right herbal product"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="video-url">
                                                YouTube / Vimeo URL
                                            </Label>
                                            <Input
                                                id="video-url"
                                                value={newVideoUrl}
                                                onChange={(e) =>
                                                    setNewVideoUrl(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="video-file">
                                                Upload Local Video
                                            </Label>
                                            <Input
                                                id="video-file"
                                                ref={videoFileRef}
                                                type="file"
                                                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        Add either a YouTube/Vimeo URL or upload
                                        MP4, MOV, AVI, MKV, or WEBM up to 100
                                        MB.
                                    </p>
                                    <Button
                                        id="add-video-btn"
                                        onClick={handleAddVideo}
                                        disabled={addingVideo}
                                        className="mt-4 bg-red-600 text-white hover:bg-red-700"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {addingVideo ? 'Adding…' : 'Add Video'}
                                    </Button>
                                </div>

                                {/* Video list */}
                                {videos.length > 0 ? (
                                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {videos.map((video) => {
                                            const youtubeId = getYouTubeId(
                                                video.url,
                                            );
                                            const embedUrl = getVideoEmbedUrl(
                                                video.url,
                                            );
                                            const localVideoSrc =
                                                getLocalVideoSrc(video);

                                            return (
                                                <div
                                                    key={video.id}
                                                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                                                >
                                                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-stone-900 to-stone-700">
                                                        {youtubeId ? (
                                                            <>
                                                                <img
                                                                    src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
                                                                    alt={
                                                                        video.title
                                                                    }
                                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                                    loading="lazy"
                                                                    onError={(
                                                                        event,
                                                                    ) => {
                                                                        event.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-stone-950/45 via-transparent to-transparent"
                                                                    onClick={() =>
                                                                        setSelectedVideo(
                                                                            video,
                                                                        )
                                                                    }
                                                                    aria-label={`Play ${video.title}`}
                                                                >
                                                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/18 text-white shadow-xl ring-1 ring-white/35 backdrop-blur-md transition group-hover:scale-105">
                                                                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                                                                    </span>
                                                                </button>
                                                            </>
                                                        ) : localVideoSrc ? (
                                                            <>
                                                                <video
                                                                    src={
                                                                        localVideoSrc
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                    preload="metadata"
                                                                    muted
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-stone-950/45 via-transparent to-transparent"
                                                                    onClick={() =>
                                                                        setSelectedVideo(
                                                                            video,
                                                                        )
                                                                    }
                                                                    aria-label={`Play ${video.title}`}
                                                                >
                                                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/18 text-white shadow-xl ring-1 ring-white/35 backdrop-blur-md transition group-hover:scale-105">
                                                                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                                                                    </span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/80">
                                                                    <Film className="h-10 w-10" />
                                                                    <span className="text-xs font-semibold tracking-wide uppercase">
                                                                        External
                                                                        video
                                                                    </span>
                                                                </div>
                                                                {embedUrl && (
                                                                    <button
                                                                        type="button"
                                                                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-stone-950/45 via-transparent to-transparent"
                                                                        onClick={() =>
                                                                            setSelectedVideo(
                                                                                video,
                                                                            )
                                                                        }
                                                                        aria-label={`Play ${video.title}`}
                                                                    >
                                                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/18 text-white shadow-xl ring-1 ring-white/35 backdrop-blur-md transition group-hover:scale-105">
                                                                            <Play className="ml-0.5 h-6 w-6 fill-current" />
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDeleteVideo(
                                                                    video.id,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingVideo ===
                                                                video.id
                                                            }
                                                            className="absolute top-3 right-3 h-9 w-9 border-red-200 bg-white/90 text-red-600 shadow-sm backdrop-blur hover:bg-red-50"
                                                            aria-label={`Delete ${video.title}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2 p-4">
                                                        <p className="line-clamp-1 font-semibold text-stone-900 dark:text-stone-100">
                                                            {video.title}
                                                        </p>
                                                        <p className="line-clamp-2 min-h-8 text-xs leading-4 break-all text-stone-500">
                                                            {getVideoDisplayPath(
                                                                video,
                                                            )}
                                                        </p>
                                                        <span className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                            {video.type ===
                                                            'local'
                                                                ? 'Uploaded video'
                                                                : youtubeId
                                                                  ? 'YouTube'
                                                                  : 'External URL'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-sm text-stone-400">
                                        No videos added yet.
                                    </p>
                                )}

                                <Dialog
                                    open={selectedVideo !== null}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setSelectedVideo(null);
                                        }
                                    }}
                                >
                                    <DialogContent
                                        showClose={false}
                                        className="max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_34%),linear-gradient(135deg,#0c0a09,#18181b_52%,#020617)] p-0 text-white shadow-2xl shadow-stone-950/60 sm:max-w-5xl"
                                    >
                                        {selectedVideo && (
                                            <>
                                                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl sm:px-6">
                                                    <div className="min-w-0">
                                                        <p className="mb-1 text-xs font-semibold tracking-wide text-red-200 uppercase">
                                                            Video Preview
                                                        </p>
                                                        <DialogTitle className="line-clamp-1 text-lg font-bold text-white sm:text-xl">
                                                            {
                                                                selectedVideo.title
                                                            }
                                                        </DialogTitle>
                                                    </div>
                                                    <DialogClose asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 shrink-0 rounded-full border-white/20 bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur hover:bg-white/20 hover:text-white"
                                                            aria-label="Close video"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </DialogClose>
                                                </div>

                                                <div className="p-3 sm:p-5">
                                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ring-1 shadow-black/45 ring-white/10">
                                                        <div className="aspect-video">
                                                            {getVideoEmbedUrl(
                                                                selectedVideo.url,
                                                            ) ? (
                                                                <iframe
                                                                    src={
                                                                        getVideoEmbedUrl(
                                                                            selectedVideo.url,
                                                                        ) ??
                                                                        undefined
                                                                    }
                                                                    title={
                                                                        selectedVideo.title
                                                                    }
                                                                    className="h-full w-full"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            ) : getLocalVideoSrc(
                                                                  selectedVideo,
                                                              ) ? (
                                                                <video
                                                                    src={
                                                                        getLocalVideoSrc(
                                                                            selectedVideo,
                                                                        ) ??
                                                                        undefined
                                                                    }
                                                                    className="h-full w-full object-contain"
                                                                    controls
                                                                    autoPlay
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70">
                                                                    <Film className="h-10 w-10" />
                                                                    <p className="text-sm">
                                                                        Preview
                                                                        unavailable
                                                                        for this
                                                                        video
                                                                        URL.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
                                                        <p className="line-clamp-1 text-sm text-white/55">
                                                            {getVideoDisplayPath(
                                                                selectedVideo,
                                                            )}
                                                        </p>
                                                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                                                            {selectedVideo.type ===
                                                            'local'
                                                                ? 'Uploaded video'
                                                                : getYouTubeId(
                                                                        selectedVideo.url,
                                                                    )
                                                                  ? 'YouTube'
                                                                  : 'External URL'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Experience ── */}
                    <TabsContent value="experience" className="mt-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Experience Items</CardTitle>
                                    <Button
                                        id="add-exp-btn"
                                        size="sm"
                                        onClick={addExpItem}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <Plus className="mr-1.5 h-4 w-4" /> Add
                                        Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {expItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="grid gap-3 rounded-xl border bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_2fr_auto] dark:bg-zinc-900"
                                    >
                                        <div className="space-y-1">
                                            <Label htmlFor={`exp-icon-${i}`}>
                                                Icon
                                            </Label>
                                            <select
                                                id={`exp-icon-${i}`}
                                                value={item.icon}
                                                onChange={(e) =>
                                                    updateExpItem(
                                                        i,
                                                        'icon',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm dark:bg-zinc-800"
                                            >
                                                {ICON_OPTIONS.map((icon) => (
                                                    <option
                                                        key={icon}
                                                        value={icon}
                                                    >
                                                        {icon}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`exp-title-${i}`}>
                                                Title
                                            </Label>
                                            <Input
                                                id={`exp-title-${i}`}
                                                value={item.title}
                                                onChange={(e) =>
                                                    updateExpItem(
                                                        i,
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Knowledge"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`exp-desc-${i}`}>
                                                Description
                                            </Label>
                                            <Input
                                                id={`exp-desc-${i}`}
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateExpItem(
                                                        i,
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Short description..."
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeExpItem(i)}
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    id="save-exp-btn"
                                    onClick={handleSaveExperience}
                                    disabled={savingExp}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    {savingExp
                                        ? 'Saving…'
                                        : 'Save Experience Items'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
