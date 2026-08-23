import { Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string | File;
    onChange: (value: string | File) => void;
    onRemove: () => void;
    label?: string;
    maxSizeMB?: number;
    helperText?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label = 'Upload Image',
    maxSizeMB = 5,
    helperText,
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Clean up object URL on unmount or value change
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof value === 'string') {
            setPreviewUrl(value);
        } else {
            setPreviewUrl('');
        }
    }, [value]);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload only JPG, PNG, or WebP images');
            return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File size should be less than ${maxSizeMB}MB`);
            return;
        }

        // Pass the file directly to parent
        onChange(file);
    };

    const handleRemove = () => {
        onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id={`file-upload-${label}`}
            />

            {!value && (
                <label
                    htmlFor={`file-upload-${label}`}
                    className={cn(
                        'flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                    )}
                >
                    <Upload className="mb-1 h-6 w-6 text-gray-400 dark:text-zinc-500" />
                    <p className="text-xs text-gray-600 dark:text-zinc-400">
                        {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">
                        {helperText ?? `JPG, PNG or WebP (max ${maxSizeMB}MB)`}
                    </p>
                </label>
            )}

            {value && (
                <div className="relative w-32">
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Uploaded"
                            className="h-24 w-32 rounded-lg object-cover"
                        />
                    )}
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
