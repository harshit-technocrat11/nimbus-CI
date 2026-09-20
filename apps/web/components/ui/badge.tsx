import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary border-primary/30",
        secondary:
          "border-border bg-secondary/80 text-foreground",
        outline: "border-border text-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-mono",
        running:
          "border-amber-500/30 bg-amber-500/15 text-amber-400 font-mono",
        failed:
          "border-rose-500/30 bg-rose-500/15 text-rose-400 font-mono",
        queued:
          "border-slate-600/30 bg-slate-800/40 text-slate-400 font-mono",
        cancelled:
          "border-purple-500/30 bg-purple-500/15 text-purple-400 font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
