"use client";

import * as React from "react";
import { SparklesIcon, ArrowRightIcon } from "lucide-react";
import { DeckListItem } from "@/types/deck";
import { Button } from "@/components/ui/button";

interface LiveGenerationBannerProps {
  generatingDeck: DeckListItem | null;
  onViewDeck: (deckId: string) => void;
}

export function LiveGenerationBanner({
  generatingDeck,
  onViewDeck,
}: LiveGenerationBannerProps) {
  if (!generatingDeck) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SparklesIcon className="size-3.5 sm:size-4 animate-spin" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                Agent Synthesizing Slides
              </span>
              <span className="size-1.5 rounded-full bg-primary animate-ping" />
            </div>
            <p className="font-heading text-xs sm:text-sm font-medium text-foreground line-clamp-1">
              {generatingDeck.title || generatingDeck.idea}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onViewDeck(generatingDeck.id)}
          className="w-full sm:w-auto h-8 shrink-0 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-xs"
        >
          <span>Watch Live Presentation</span>
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
