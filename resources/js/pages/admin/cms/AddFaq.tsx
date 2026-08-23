
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import LazyMDEditor from '@/components/admin/lazy-md-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';

interface AddFAQProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
}

const formSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddFaq({ auth }: AddFAQProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: '',
            answer: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);

        router.post('/admin/cms/faq', data, {
            onSuccess: () => {
                toast.success('FAQ created successfully!');
                // Redirect is handled by the controller
            },
            onError: (errors) => {
                toast.error('Failed to create FAQ');
                console.error('Validation errors:', errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Add FAQ" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Add FAQ
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Create a new frequently asked question
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/cms/faq')}
                    >
                        Cancel
                    </Button>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Card className="dark:border-zinc-800 dark:bg-black">
                            <CardHeader>
                                <CardTitle className="dark:text-white">
                                    General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Question *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Question"
                                                    {...field}
                                                    className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="answer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Answer *
                                            </FormLabel>
                                            <FormControl>
                                                <div data-color-mode="auto">
                                                    <LazyMDEditor
                                                        value={field.value}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val || '',
                                                            )
                                                        }
                                                        height={300}
                                                        preview="edit"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create FAQ'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
