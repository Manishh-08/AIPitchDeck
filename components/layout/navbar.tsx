"use client";

import Link from "next/link";
import Image from "next/image";
import { SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  deckCount?: number;
  onCreateClick?: () => void;
}

export function Navbar({ deckCount = 0, onCreateClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex size-8 sm:size-9 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-primary/30 transition-transform group-hover:scale-105">
            <Image
              src="/logo.svg"
              alt="PitchCraft AI"
              width={36}
              height={36}
              priority
              className="size-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading text-sm sm:text-base font-semibold tracking-tight text-foreground">
                PitchCraft
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">AI</span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Intelligent Slide Generation
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-normal">
              Agent Ready
            </span>
          </Badge>

          {deckCount > 0 && (
            <Badge variant="secondary" className="text-[11px] sm:text-xs font-normal">
              {deckCount} {deckCount === 1 ? "Deck" : "Decks"}
            </Badge>
          )}

          <ThemeToggle />

          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="inline-flex h-7 sm:h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SparklesIcon className="size-3 sm:size-3.5" />
              <span>New Deck</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
