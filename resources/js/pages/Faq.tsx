import { Head, Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight, HelpCircle, Home } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import SiteLayout from '@/layouts/SiteLayout';
import type { Product, Settings } from '@/types/site-types';

interface FAQItem {
    _id: string;
    question: string;
    answer: string;
}

interface FaqProps {
    faqs: FAQItem[];
    settings: Settings;
    products?: Product[];
    wishlist?: {
        count: number;
        items: any[];
    };
    cart?: {
        count: number;
        price: number;
        items: any[];
    };
    user?: {
        name: string;
    };
}

export default function Faq({
    faqs,
    settings,
    products = [],
    wishlist = { count: 0, items: [] },
    cart = { count: 0, price: 0, items: [] },
    user,
}: FaqProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <SiteLayout
            settings={settings}
            products={products}
            wishlist={wishlist}
            cart={cart}
            user={user}
            title="FAQ - Natural Rudraksh"
            metaDescription="Answers to common questions about Rudraksha, orders, shipping, and care."
        >
            <Head title="FAQ" />

            {/* Breadcrumb */}
            <div className="border-b bg-gradient-to-r from-orange-50/50 to-amber-50/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center text-orange-600 transition-colors hover:text-orange-700"
                        >
                            <Home className="h-4 w-4" />
                        </Link>
                        <ChevronRight className="h-4 w-4 text-orange-400" />
                        <span className="font-semibold text-orange-900">
                            FAQ
                        </span>
                    </nav>
                </div>
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden border-b bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOTdiMTYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTEyIDM2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
                <div className="relative container mx-auto px-4 py-16 text-center">
                    <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-orange-300/50 bg-white/80 px-5 py-2 text-sm font-semibold text-orange-700 shadow-sm backdrop-blur-sm">
                        <HelpCircle className="h-4 w-4" />
                        Frequently Asked Questions
                    </div>
                    <h1 className="mt-6 bg-gradient-to-r from-orange-900 via-orange-800 to-amber-900 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                        How can we help?
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-700">
                        Find quick answers about Rudraksha, orders, shipping,
                        and care. If you still need help, our team is just a
                        message away.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-orange-300 bg-white/80 text-orange-700 backdrop-blur-sm hover:bg-orange-50 hover:text-orange-800"
                            asChild
                        >
                            <Link href="/contact">Contact support</Link>
                        </Button>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:from-orange-700 hover:to-amber-700"
                            asChild
                        >
                            <Link href="/product">Browse products</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* FAQ List */}
            <div className="container mx-auto px-4 py-16">
                {faqs.length > 0 ? (
                    <div className="mx-auto max-w-3xl space-y-4">
                        {faqs.map((faq) => {
                            const faqId = String(faq._id);
                            const isOpen = openId === faqId;
                            return (
                                <Collapsible
                                    key={faqId}
                                    open={isOpen}
                                    onOpenChange={(open) =>
                                        setOpenId(open ? faqId : null)
                                    }
                                    className="group overflow-hidden rounded-2xl border border-orange-200/60 bg-white shadow-md transition-all duration-300 hover:border-orange-300 hover:shadow-xl"
                                >
                                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50">
                                        <span className="text-lg font-bold text-gray-900 group-hover:text-orange-900">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`h-6 w-6 flex-shrink-0 text-orange-600 transition-all duration-300 ${
                                                isOpen
                                                    ? 'rotate-180'
                                                    : 'rotate-0'
                                            }`}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                        <div className="border-t border-orange-100 bg-gradient-to-br from-orange-50/30 to-amber-50/30 px-6 py-5">
                                            <div className="prose prose-orange max-w-none text-base leading-relaxed text-gray-700">
                                                <ReactMarkdown>
                                                    {faq.answer}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-12 text-center shadow-sm">
                        <div className="rounded-full bg-orange-100 p-4">
                            <HelpCircle className="h-12 w-12 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            No FAQs available
                        </h2>
                        <p className="text-base text-gray-600">
                            We're working on new answers. Reach out if you have
                            a question.
                        </p>
                        <Button
                            size="lg"
                            className="mt-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:from-orange-700 hover:to-amber-700"
                            asChild
                        >
                            <Link href="/contact">Contact support</Link>
                        </Button>
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
