import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { Button } from '@/components/ui/button';

type AppErrorBoundaryProps = {
    children: ReactNode;
};

type AppErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    public state: AppErrorBoundaryState = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Unhandled React render error', error, errorInfo);
    }

    private readonly handleReload = (): void => {
        window.location.reload();
    };

    public render(): ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
                <section className="w-full max-w-lg rounded-xl border bg-background p-8 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Something went wrong
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The page crashed unexpectedly. Reload to try again.
                    </p>
                    {import.meta.env.DEV && this.state.error?.message ? (
                        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                            {this.state.error.message}
                        </pre>
                    ) : null}
                    <div className="mt-6">
                        <Button onClick={this.handleReload}>Reload page</Button>
                    </div>
                </section>
            </main>
        );
    }
}
