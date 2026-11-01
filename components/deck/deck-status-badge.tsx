import * as React from "react";
import { CheckCircle2Icon, Loader2Icon, ClockIcon, AlertCircleIcon } from "lucide-react";
import { DeckStatus } from "@/types/deck";
import { cn } from "@/lib/utils";

interface DeckStatusBadgeProps {
  status: DeckStatus;
  className?: string;
  showIcon?: boolean;
}

export function DeckStatusBadge({
  status,
  className,
  showIcon = true,
}: DeckStatusBadgeProps) {
  switch (status) {
    case "COMPLETE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400",
            className
          )}
        >
          {showIcon && <CheckCircle2Icon className="size-3" />}
          <span>Ready</span>
        </span>
      );

    case "GENERATING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse",
            className
          )}
        >
          {showIcon && <Loader2Icon className="size-3 animate-spin" />}
          <span>Generating</span>
        </span>
      );

    case "PENDING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400",
            className
          )}
        >
          {showIcon && <ClockIcon className="size-3" />}
          <span>Queued</span>
        </span>
      );

    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive",
            className
          )}
        >
          {showIcon && <AlertCircleIcon className="size-3" />}
          <span>Failed</span>
        </span>
      );

    default:
      return null;
  }
}
