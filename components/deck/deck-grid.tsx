"use client";

import * as React from "react";
import { SearchIcon, SparklesIcon, FilterIcon } from "lucide-react";
import { DeckCard } from "./deck-card";
import { DeckListItem } from "@/types/deck";
import { Input } from "@/components/ui/input";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface DeckGridProps {
  decks: DeckListItem[];
  onSelectDeck?: (deckId: string) => void;
  onDeckDeleted?: (deckId: string) => void;
  onCreateNewClick?: () => void;
  isLoading?: boolean;
}

type FilterStatus = "ALL" | "COMPLETE" | "GENERATING" | "FAILED";

export function DeckGrid({
  decks,
  onSelectDeck,
  onDeckDeleted,
  onCreateNewClick,
  isLoading = false,
}: DeckGridProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>("ALL");

  const filteredDecks = React.useMemo(() => {
    return decks.filter((d) => {
      // Status filter
      if (statusFilter === "COMPLETE" && d.status !== "COMPLETE") return false;
      if (
        statusFilter === "GENERATING" &&
        d.status !== "GENERATING" &&
        d.status !== "PENDING"
      ) {
        return false;
      }
      if (statusFilter === "FAILED" && d.status !== "FAILED") return false;

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = d.title?.toLowerCase().includes(query) ?? false;
        const matchesIdea = d.idea.toLowerCase().includes(query);
        return matchesTitle || matchesIdea;
      }

      return true;
    });
  }, [decks, search, statusFilter]);

  const countByStatus = React.useMemo(() => {
    return {
      all: decks.length,
      complete: decks.filter((d) => d.status === "COMPLETE").length,
      generating: decks.filter(
        (d) => d.status === "GENERATING" || d.status === "PENDING"
      ).length,
      failed: decks.filter((d) => d.status === "FAILED").length,
    };
  }, [decks]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground">
            Pitch Decks Library
          </h2>
          <p className="text-xs text-muted-foreground">
            Browse, present, and manage your AI-generated decks
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Status filters */}
          <div className="inline-flex max-w-full overflow-x-auto scrollbar-none items-center rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === "ALL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({countByStatus.all})
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETE")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === "COMPLETE"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ready ({countByStatus.complete})
            </button>
            {countByStatus.generating > 0 && (
              <button
                onClick={() => setStatusFilter("GENERATING")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === "GENERATING"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Generating ({countByStatus.generating})
              </button>
            )}
            {countByStatus.failed > 0 && (
              <button
                onClick={() => setStatusFilter("FAILED")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === "FAILED"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Failed ({countByStatus.failed})
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decks..."
              className="h-8 pl-8 text-xs bg-background/80 rounded-lg w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid or Empty state */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 sm:h-44 rounded-xl border border-border/40 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredDecks.length === 0 ? (
        <Empty className="border border-dashed border-border/80 bg-card/40 py-8 sm:py-12">
          <EmptyMedia variant="icon">
            {decks.length === 0 ? (
              <SparklesIcon className="size-4 text-primary" />
            ) : (
              <FilterIcon className="size-4 text-muted-foreground" />
            )}
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-sm sm:text-base font-semibold">
              {decks.length === 0
                ? "No Pitch Decks Created Yet"
                : "No matching decks found"}
            </EmptyTitle>
            <EmptyDescription className="text-xs text-muted-foreground">
              {decks.length === 0
                ? "Describe your startup idea above to automatically generate a complete 6-8 slide investor deck."
                : "Try adjusting your search query or switching the status filter tab."}
            </EmptyDescription>
          </EmptyHeader>
          {decks.length === 0 && onCreateNewClick && (
            <Button
              size="sm"
              onClick={onCreateNewClick}
              className="mt-2 text-xs h-8 gap-1.5"
            >
              <SparklesIcon className="size-3.5" />
              <span>Create Your First Deck</span>
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onSelectDeck={onSelectDeck}
              onDeckDeleted={onDeckDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
