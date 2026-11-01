"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import { DeckCarouselView } from "@/components/deck/deck-carousel-view";
import { DeckDetail } from "@/types/deck";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme-toggle";

interface DeckPresentationPageProps {
  id: string;
}

export function DeckPresentationPage({ id }: DeckPresentationPageProps) {
  const [deck, setDeck] = React.useState<DeckDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDeck = React.useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const res = await fetch(`/api/decks/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Deck not found");
          }
          throw new Error(`Failed to load deck (${res.status})`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response received from server");
        }
        const data: DeckDetail = await res.json();
        setDeck(data);
      } catch (err) {
        if (isInitial) {
          setError(err instanceof Error ? err.message : "Error loading deck");
        }
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [id]
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeck(true);
  }, [fetchDeck]);

  // Live polling if generating
  const deckStatus = deck?.status;
  React.useEffect(() => {
    if (deckStatus === "GENERATING" || deckStatus === "PENDING") {
      const interval = setInterval(() => {
        fetchDeck(false);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [deckStatus, fetchDeck]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Presentation Top bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-13 sm:h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="hidden sm:inline">Back to Studio</span>
            <span className="sm:hidden">Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative flex size-6 items-center justify-center overflow-hidden rounded-lg shadow-xs ring-1 ring-primary/30">
              <Image
                src="/logo.svg"
                alt="PitchCraft AI"
                width={24}
                height={24}
                className="size-full object-cover"
              />
            </div>
            <span className="font-heading text-xs font-semibold tracking-tight">
              Presentation Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button size="xs" variant="outline" className="text-xs h-7 px-2 sm:px-2.5 gap-1">
                <SparklesIcon className="size-3" />
                <span className="hidden sm:inline">New Deck</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main presentation canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-2 sm:p-6 lg:p-8 flex flex-col">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading slide deck presentation...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32 text-center">
            <h2 className="text-lg font-semibold text-destructive">{error}</h2>
            <p className="text-xs text-muted-foreground">
              The requested deck could not be loaded or may have been deleted.
            </p>
            <Link href="/" className="mt-2">
              <Button size="sm" variant="outline">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        ) : deck ? (
          <DeckCarouselView
            deck={deck}
            isLiveGenerating={deck.status === "GENERATING" || deck.status === "PENDING"}
            className="flex-1"
          />
        ) : null}
      </main>
    </div>
  );
}
