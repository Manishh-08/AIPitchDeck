"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  PlayIcon,
  Trash2Icon,
  ExternalLinkIcon,
  LayersIcon,
  SparklesIcon,
  FileDownIcon,
} from "lucide-react";
import { DeckStatusBadge } from "./deck-status-badge";
import { DeckListItem } from "@/types/deck";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  deck: DeckListItem;
  onSelectDeck?: (deckId: string) => void;
  onDeckDeleted?: (deckId: string) => void;
}

export function DeckCard({
  deck,
  onSelectDeck,
  onDeckDeleted,
}: DeckCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true });
    } catch {
      return "recently";
    }
  }, [deck.createdAt]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/decks/${deck.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete deck");
      }

      toast.add({
        title: "Deck Deleted",
        description: "The pitch deck and its slides have been removed.",
      });

      setDialogOpen(false);
      onDeckDeleted?.(deck.id);
    } catch (err) {
      toast.add({
        title: "Could not delete deck",
        description: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isGenerating = deck.status === "GENERATING" || deck.status === "PENDING";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:p-5 text-card-foreground shadow-xs transition-all hover:border-border hover:shadow-md",
        isGenerating && "ring-1 ring-primary/30"
      )}
    >
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2">
          <DeckStatusBadge status={deck.status} />
          <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-heading text-base font-semibold leading-snug tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {deck.title || (isGenerating ? "Synthesizing deck..." : "Untitled Pitch Deck")}
        </h3>

        {/* Idea excerpt */}
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {deck.idea}
        </p>

        {deck.errorMessage && (
          <div className="mt-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive line-clamp-2">
            {deck.errorMessage}
          </div>
        )}
      </div>

      {/* Footer row */}
      <div className="mt-5 border-t border-border/50 pt-3">
        <div className="flex items-center justify-between gap-2">
          {/* Slide count or generation spinner */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isGenerating ? (
              <>
                <SparklesIcon className="size-3.5 text-primary animate-pulse" />
                <span className="text-primary font-medium text-[11px]">
                  Agent active...
                </span>
              </>
            ) : (
              <>
                <LayersIcon className="size-3.5" />
                <span>
                  {deck.slideCount} {deck.slideCount === 1 ? "slide" : "slides"}
                </span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Delete button with AlertDialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete deck"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this pitch deck?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{deck.title || "this deck"}&rdquo; and all of its generated slides and visual assets.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Download PPTX button for ready decks */}
            {deck.status === "COMPLETE" && (
              <a
                href={`/api/decks/${deck.id}/export`}
                download
                className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Download PowerPoint presentation (.pptx)"
              >
                <FileDownIcon className="size-3.5" />
              </a>
            )}

            {/* Standalone link */}
            <Link
              href={`/decks/${deck.id}`}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Open full page view"
            >
              <ExternalLinkIcon className="size-3.5" />
            </Link>

            {/* Quick Present button */}
            <Button
              size="xs"
              variant="outline"
              onClick={() => onSelectDeck?.(deck.id)}
              className="gap-1 text-xs font-medium"
            >
              <PlayIcon className="size-3" />
              <span>{isGenerating ? "Track" : "Present"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
