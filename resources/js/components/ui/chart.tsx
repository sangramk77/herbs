import * as React from 'react';
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    type TooltipProps,
} from 'recharts';

import { cn } from '@/lib/utils';

type ChartColor = string;

export type ChartConfig = Record<
    string,
    {
        label?: string;
        color?: ChartColor;
    }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
};

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
    ({ className, config, children, ...props }, ref) => {
        const chartId = React.useId();
        const styleVars = Object.entries(config).reduce((acc, [key, value], index) => {
                const color =
                    value.color ?? `hsl(var(--chart-${index + 1}))`;
                acc[`--color-${key}`] = color;
                return acc;
            }, {} as Record<string, string>);
        const style = styleVars as React.CSSProperties;

        return (
            <div
                ref={ref}
                data-chart={chartId}
                className={cn('w-full', className)}
                style={style}
                {...props}
            >
                <ResponsiveContainer>{children as React.ReactElement}</ResponsiveContainer>
            </div>
        );
    },
);
ChartContainer.displayName = 'ChartContainer';

function ChartTooltipContent({
    active,
    payload,
    label,
    formatter,
}: TooltipProps<number, string>) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
            <div className="mb-1 text-xs text-muted-foreground">{label}</div>
            <div className="space-y-1">
                {payload.map((item) => (
                    <div
                        key={item.dataKey as string}
                        className="flex items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                    background:
                                        item.color ?? 'hsl(var(--foreground))',
                                }}
                            />
                            <span className="text-muted-foreground">
                                {item.name ?? item.dataKey}
                            </span>
                        </div>
                        <span className="font-medium text-foreground">
                            {formatter
                                ? formatter(
                                      item.value as number,
                                      item.name ?? '',
                                      item,
                                      0,
                                      payload,
                                  )
                                : item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ChartTooltip = Tooltip;
const ChartLegend = Legend;
const ChartGrid = CartesianGrid;

export { ChartContainer, ChartGrid, ChartLegend, ChartTooltip, ChartTooltipContent };
