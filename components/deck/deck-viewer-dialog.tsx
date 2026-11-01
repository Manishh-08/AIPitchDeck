"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { DeckCarouselView } from "./deck-carousel-view";
import { DeckDetail } from "@/types/deck";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface DeckViewerDialogProps {
  deckId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeckUpdated?: (deck: DeckDetail) => void;
}

export function DeckViewerDialog({
  deckId,
  isOpen,
  onClose,
  onDeckUpdated,
}: DeckViewerDialogProps) {
  const [deck, setDeck] = React.useState<DeckDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Keep a stable ref to onDeckUpdated so fetchDeck never needs to re-create
  const onDeckUpdatedRef = React.useRef(onDeckUpdated);
  React.useEffect(() => {
    onDeckUpdatedRef.current = onDeckUpdated;
  }, [onDeckUpdated]);

  const fetchDeck = React.useCallback(async (id: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/decks/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load deck (${res.status})`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response received from server");
      }
      const data: DeckDetail = await res.json();
      setDeck(data);
      onDeckUpdatedRef.current?.(data);
    } catch (err) {
      if (isInitial) {
        setError(err instanceof Error ? err.message : "Error loading deck");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Fetch when opened with a deckId
  React.useEffect(() => {
    if (isOpen && deckId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      fetchDeck(deckId, true);
    }
  }, [isOpen, deckId, fetchDeck]);

  // Polling for live status ONLY when deck is generating
  const deckStatus = deck?.status;
  React.useEffect(() => {
    if (!isOpen || !deckId) return;

    if (deckStatus === "GENERATING" || deckStatus === "PENDING") {
      const interval = setInterval(() => {
        fetchDeck(deckId, false);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [isOpen, deckId, deckStatus, fetchDeck]);

  // Handle escape key to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with click-to-close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-6xl max-h-[96vh] sm:max-h-[95vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95 focus:outline-none">
        {/* Close button in top-right */}
        <div className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-50">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={onClose}
            className="size-7 sm:size-8 rounded-full bg-background/90 backdrop-blur-sm hover:bg-muted touch-manipulation"
            title="Close presentation"
          >
            <XIcon className="size-3.5 sm:size-4" />
            <span className="sr-only">Close presentation</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading presentation deck...
            </p>
          </div>
        ) : error ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => deckId && fetchDeck(deckId, true)}>
              Try again
            </Button>
          </div>
        ) : deck ? (
          <DeckCarouselView
            deck={deck}
            isLiveGenerating={deck.status === "GENERATING" || deck.status === "PENDING"}
          />
        ) : null}
      </div>
    </div>
  );
}
