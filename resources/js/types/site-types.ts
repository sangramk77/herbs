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
    image1Url?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeyword?: string[];
    stock: number;
    is_in_wishlist: boolean;
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
