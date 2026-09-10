export interface Banner {
    id: string;
    image1: string;
    mobileImage?: string;
    heading1: string;
    heading2: string;
    description: string;
}

export interface Blog {
    id: string;
    blogTitle: string;
    seoUrl: string;
    thumbnail: string;
    thumbnail_url?: string;
    post_by: string;
    publishDate: string;
}

export interface Feature {
    icon: string;
    title: string;
    description: string;
}

export interface SocialLinks {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
}

export interface Settings {
    site_name?: string;
    email1: string;
    address: string;
    phone1: string;
    fbLink: string;
    twitterLink: string;
    instaLink: string;
    youtubeLink: string;
    cod_charge: number;
    headerScripts?: string;
    footerScripts?: string;
    default_video_1?: string | null;
    default_video_2?: string | null;
    homepageVideo?: string | null;
    categoryVideo?: string | null;
    trustFeatures?: { id: string; image_url: string }[];
    tickerText?: string | null;
    tickerEnabled?: boolean;
    globalMetaTitle?: string | null;
    globalMetaDescription?: string | null;
    globalMetaKeywords?: string | null;
    globalOgTitle?: string | null;
    globalOgDescription?: string | null;
    globalOgImageUrl?: string | null;
    globalTwitterTitle?: string | null;
    globalTwitterDescription?: string | null;
    globalTwitterImageUrl?: string | null;
    globalOgImageWidth?: number;
    globalOgImageHeight?: number;
}

export interface Product {
    id: string;
    productsName: string;
    seoUrl: string;
    image1: string;
    price: number;
    mrp: number;
    discount?: number;
    categoryId?: string;
    categoryName?: string;
    categorySlug?: string;
}

export interface ProductDetail extends Product {
    description: string;
    short_description?: string;
    images: string[];
    videos?: string[];
    image1Url?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeyword?: string[];
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    stock: number;
    is_in_wishlist: boolean;
    measurement_options?: {
        value: number;
        label: string;
        price: number;
        mrp: number | null;
    }[];
}

export interface SeoMeta {
    title: string;
    description: string;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    keywords?: string | null;
    canonicalUrl: string;
    imageUrl: string;
    twitterImageUrl?: string | null;
    imageWidth?: string | null;
    imageHeight?: string | null;
    imageAlt?: string | null;
    type?: 'website' | 'article' | 'product';
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
    categoryId?: string | null;
    categorySlug?: string | null;
    measurement_value?: number | null;
    measurement_label?: string | null;
}

export interface CartInfo {
    count: number;
    price: number;
    items: CartItem[];
}

export interface MegaMenuItem {
    id: string;
    name: string;
    url: string;
    image: string;
    categoryId?: string;
    categoryName?: string;
    categorySlug?: string;
}

export interface NavCategory {
    id: string;
    name: string;
    slug: string;
}

export interface SiteNavItem {
    label: string;
    url: string;
    icon?: string;
    megaMenu?: MegaMenuItem[];
}
