import { usePage } from '@inertiajs/react';
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AiBlogGeneratorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (data: GeneratedBlogData) => void;
}

export interface GeneratedBlogData {
    title: string;
    content: string;
    meta_description: string;
    keywords: string[];
}

export default function AiBlogGeneratorModal({
    open,
    onOpenChange,
    onGenerate,
}: AiBlogGeneratorModalProps) {
    const { props } = usePage<{ csrf_token?: string }>();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a blog topic or description');
            return;
        }

        setIsGenerating(true);
        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ||
            props.csrf_token ||
            '';

        const response = await fetch('/admin/cms/blog/ai-generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken,
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                prompt: prompt.trim(),
                _token: csrfToken,
            }),
        }).catch((error: unknown) => {
            console.error('AI generation error:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to generate blog content. Please try again.';
            toast.error(errorMessage);
            return null;
        });

        if (!response) {
            setIsGenerating(false);
            return;
        }

        const data = await response.json().catch(() => ({
            success: false,
            message: 'Failed to parse server response.',
        }));

        if (!response.ok || !data.success) {
            const message = data.message || 'Failed to generate blog content';
            toast.error(message);
            setIsGenerating(false);
            return;
        }

        // Pass generated data to parent
        onGenerate(data.data);

        // Close modal and show success
        onOpenChange(false);
        toast.success('Blog content generated successfully! ✨');

        // Reset prompt
        setPrompt('');
        setIsGenerating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Generate Blog with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe your blog topic and let AI create a complete,
                        SEO-optimized blog post for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="prompt">Blog Topic / Description</Label>
                        <Textarea
                            id="prompt"
                            placeholder="E.g., Benefits of Rudraksha beads for meditation and spiritual growth"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            disabled={isGenerating}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Be specific for better results. Include key points
                            you want covered.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Blog
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
