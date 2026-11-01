"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { CreateDeckForm } from "@/components/deck/create-deck-form";
import { DeckGrid } from "@/components/deck/deck-grid";
import { LiveGenerationBanner } from "@/components/deck/live-generation-banner";
import { DeckViewerDialog } from "@/components/deck/deck-viewer-dialog";
import { DeckListItem, DeckDetail } from "@/types/deck";

export function DashboardView() {
  const [decks, setDecks] = React.useState<DeckListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeDeckId, setActiveDeckId] = React.useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const formSectionRef = React.useRef<HTMLDivElement>(null);

  const fetchDecks = React.useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      }
    } catch (err) {
      console.error("Error fetching decks:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDecks(true);
  }, [fetchDecks]);

  // If any deck is GENERATING or PENDING, poll every 3 seconds
  const hasActiveGenerations = React.useMemo(() => {
    return decks.some((d) => d.status === "GENERATING" || d.status === "PENDING");
  }, [decks]);

  React.useEffect(() => {
    if (!hasActiveGenerations) return;

    const interval = setInterval(() => {
      fetchDecks(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasActiveGenerations, fetchDecks]);

  const generatingDeck = React.useMemo(() => {
    return decks.find((d) => d.status === "GENERATING" || d.status === "PENDING") || null;
  }, [decks]);

  const handleDeckCreated = (newDeckId: string) => {
    fetchDecks(false);
    setActiveDeckId(newDeckId);
    setIsViewerOpen(true);
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setIsViewerOpen(true);
  };

  const handleDeckUpdated = React.useCallback((updated: DeckDetail) => {
    setDecks((prev) => {
      const existing = prev.find((d) => d.id === updated.id);
      if (
        existing &&
        existing.status === updated.status &&
        existing.title === updated.title &&
        existing.slideCount === updated.slides.length &&
        existing.errorMessage === updated.errorMessage
      ) {
        return prev;
      }
      return prev.map((d) =>
        d.id === updated.id
          ? {
              ...d,
              title: updated.title,
              status: updated.status,
              slideCount: updated.slides.length,
              errorMessage: updated.errorMessage,
            }
          : d
      );
    });
  }, []);

  const handleDeckDeleted = (deletedId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deletedId));
    if (activeDeckId === deletedId) {
      setIsViewerOpen(false);
      setActiveDeckId(null);
    }
  };

  const scrollToCreate = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar deckCount={decks.length} onCreateClick={scrollToCreate} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8 space-y-6 sm:space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3 pt-1 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>AI Pitch Deck Studio</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight sm:leading-[1.15]">
            Transform ideas into investor-ready pitch decks.
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed px-2">
            Provide a simple business concept. Our autonomous agent formulates executive narrative structures, writes compelling slide copy, and generates bespoke visual slides.
          </p>
        </div>

        {/* Live Generation Banner */}
        {generatingDeck && (
          <LiveGenerationBanner
            generatingDeck={generatingDeck}
            onViewDeck={handleSelectDeck}
          />
        )}

        {/* Creation Form */}
        <div ref={formSectionRef} className="scroll-mt-20">
          <CreateDeckForm onDeckCreated={handleDeckCreated} />
        </div>

        {/* Decks Library Grid */}
        <div className="pt-2 sm:pt-4">
          <DeckGrid
            decks={decks}
            onSelectDeck={handleSelectDeck}
            onDeckDeleted={handleDeckDeleted}
            onCreateNewClick={scrollToCreate}
            isLoading={loading}
          />
        </div>
      </main>

      {/* Interactive Deck Viewer Dialog (Embla Carousel) */}
      <DeckViewerDialog
        deckId={activeDeckId}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onDeckUpdated={handleDeckUpdated}
      />

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 mt-12 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">PitchCraft AI</span>
            <span>·</span>
            <span className="text-muted-foreground">Pitch Deck Studio</span>
          </div>
          <p className="text-muted-foreground/70 text-[11px]">
            Turn your startup concepts into presentations in seconds.
          </p>
        </div>
      </footer>
    </div>
  );
}
