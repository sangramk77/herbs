import { MessageCircle } from 'lucide-react';

interface WhatsAppOverlayProps {
    phone?: string | null;
}

function toWhatsAppNumber(phone?: string | null): string | null {
    const digits = (phone ?? '').replace(/\D/g, '');
    const localNumber =
        digits.startsWith('91') && digits.length === 12
            ? digits.slice(2)
            : digits.startsWith('0') && digits.length === 11
              ? digits.slice(1)
              : digits;

    return /^\d{10}$/.test(localNumber) ? `91${localNumber}` : null;
}

export function WhatsAppOverlay({ phone }: WhatsAppOverlayProps) {
    const number = toWhatsAppNumber(phone);

    if (!number) {
        return null;
    }

    return (
        <a
            href={`https://wa.me/${number}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
            className="fixed right-5 bottom-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none sm:right-7 sm:bottom-7"
        >
            <MessageCircle className="size-7" aria-hidden="true" />
        </a>
    );
}
