import * as React from 'react';

import { cn } from '@/lib/utils';

export type FieldProps = React.HTMLAttributes<HTMLDivElement>;

export function Field({ className, ...props }: FieldProps) {
    return <div className={cn('space-y-2', className)} {...props} />;
}

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                'flex items-center gap-2 text-sm font-medium text-foreground',
                className,
            )}
            {...props}
        />
    ),
);

FieldLabel.displayName = 'FieldLabel';

