"use client";

import * as React from "react";
import {
  PlayIcon,
  PauseIcon,
  Maximize2Icon,
  Minimize2Icon,
  CopyIcon,
  CheckIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PrinterIcon,
  XIcon,
  ZoomInIcon,
  PaletteIcon,
  ShieldCheckIcon,
  FileDownIcon,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { DeckStatusBadge } from "./deck-status-badge";
import { DeckDetail, SlideItem } from "@/types/deck";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DeckCarouselViewProps {
  deck: DeckDetail;
  className?: string;
  isLiveGenerating?: boolean;
}

export type SlideTheme = "light" | "obsidian" | "navy";

/**
 * Intelligent helper to extract a professional slide kicker category tag
 * (e.g. "02 // PROBLEM STATEMENT", "04 // MARKET OPPORTUNITY")
 */
function getSlideKicker(order: number, title: string): string {
  const lower = title.toLowerCase();
  const num = String(order).padStart(2, "0");

  if (order === 1 || lower.includes("title") || lower.includes("overview")) {
    return `${num} // EXECUTIVE OVERVIEW`;
  }
  if (lower.includes("problem") || lower.includes("challenge") || lower.includes("risk") || lower.includes("pain")) {
    return `${num} // THE PROBLEM & MARKET PAIN`;
  }
  if (lower.includes("solution") || lower.includes("approach") || lower.includes("platform")) {
    return `${num} // THE SOLUTION & VALUE PROP`;
  }
  if (lower.includes("market") || lower.includes("opportunity") || lower.includes("tam") || lower.includes("audience")) {
    return `${num} // MARKET SIZE & TARGET AUDIENCE`;
  }
  if (lower.includes("product") || lower.includes("feature") || lower.includes("architecture") || lower.includes("technology")) {
    return `${num} // PRODUCT & ARCHITECTURE`;
  }
  if (lower.includes("business") || lower.includes("model") || lower.includes("monetiz") || lower.includes("saas") || lower.includes("pricing")) {
    return `${num} // BUSINESS MODEL & GO-TO-MARKET`;
  }
  if (lower.includes("ask") || lower.includes("funding") || lower.includes("capital") || lower.includes("investment") || lower.includes("milestone")) {
    return `${num} // THE ASK & ROADMAP`;
  }

  return `${num} // STRATEGIC BRIEF`;
}

/**
 * Parse slide bullet points into structured executive items
 * Splitting on colons or dashes to highlight lead-in concepts.
 */
function parseBulletPoints(content: string) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  return lines.map((line) => {
    // Strip bullet markers (•, -, *, numbers)
    const clean = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");

    // Check for a title lead-in e.g. "Automated Scanning: Detects issues..."
    const colonIndex = clean.indexOf(":");
    if (colonIndex > 2 && colonIndex < 45) {
      return {
        lead: clean.slice(0, colonIndex).trim(),
        text: clean.slice(colonIndex + 1).trim(),
      };
    }

    const dashIndex = clean.indexOf(" — ");
    if (dashIndex > 2 && dashIndex < 45) {
      return {
        lead: clean.slice(0, dashIndex).trim(),
        text: clean.slice(dashIndex + 3).trim(),
      };
    }

    return {
      lead: null,
      text: clean,
    };
  });
}

export function DeckCarouselView({
  deck,
  className,
  isLiveGenerating = false,
}: DeckCarouselViewProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const [userThemeOverride, setUserThemeOverride] = React.useState<SlideTheme | null>(null);
  const slideTheme: SlideTheme =
    userThemeOverride ?? (resolvedTheme === "dark" ? "obsidian" : "light");
  const [showPromptForSlide, setShowPromptForSlide] = React.useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = React.useState<{ url: string; title: string } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const slides: SlideItem[] = deck.slides || [];
  const totalSlides = slides.length;

  // Track active slide index
  React.useEffect(() => {
    if (!api) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, totalSlides]);

  const toggleFullscreen = React.useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {
          setIsFullscreen(true);
        });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  // Autoplay slideshow
  React.useEffect(() => {
    if (!isPlaying || !api || totalSlides <= 1) return;

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, api, totalSlides]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        api?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        api?.scrollNext();
      } else if (e.key === " " && !e.repeat) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && zoomedImage) {
        setZoomedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api, toggleFullscreen, zoomedImage]);

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const copyDeckText = async () => {
    const markdown = `# ${deck.title || "Pitch Deck"}\n\n` +
      `*Idea: ${deck.idea}*\n\n---\n\n` +
      slides
        .map(
          (s) =>
            `## Slide ${s.order}: ${s.title}\n\n${s.content}\n\n*Visual Direction: ${s.imagePrompt}*\n`
        )
        .join("\n---\n\n");

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.add({
        title: "Pitch deck copied",
        description: "All slide content formatted as Markdown is ready in your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({
        title: "Failed to copy",
        description: "Please check your browser permissions.",
      });
    }
  };

  const handleExportPptx = async () => {
    if (totalSlides === 0) {
      toast.add({
        title: "No slides to export",
        description: "Wait for the deck to finish generating before exporting.",
      });
      return;
    }

    setIsExporting(true);
    toast.add({
      title: "Preparing PowerPoint (.pptx)",
      description: "Compiling executive slides and embedding visual assets...",
    });

    try {
      let res: Response;
      if (deck.id) {
        res = await fetch(`/api/decks/${deck.id}/export`);
      } else {
        res = await fetch("/api/decks/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deck }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const safeTitle =
        (deck.title || "Pitch_Deck")
          .replace(/[^a-zA-Z0-9_\- ]/g, "")
          .trim()
          .replace(/\s+/g, "_") || "Pitch_Deck";

      link.download = `${safeTitle}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.add({
        title: "PowerPoint downloaded",
        description: `Saved as ${safeTitle}.pptx`,
      });
    } catch (err: unknown) {
      console.error("Export PPTX failed:", err);
      const message = err instanceof Error ? err.message : "Failed to generate PowerPoint file.";
      toast.add({
        title: "Export failed",
        description: message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cycleTheme = () => {
    setUserThemeOverride((prev) => {
      const currentTheme = prev ?? (resolvedTheme === "dark" ? "obsidian" : "light");
      if (currentTheme === "light") return "obsidian";
      if (currentTheme === "obsidian") return "navy";
      return "light";
    });
  };

  const progressPercent = count > 0 ? (current / count) * 100 : 0;

  // Visual style definitions per theme
  const themeStyles = {
    light: {
      canvas: "bg-white text-neutral-900 border-neutral-200/90 shadow-2xl",
      kickerBg: "bg-sky-50 text-sky-800 border-sky-200/80",
      heading: "text-neutral-950 font-black",
      card: "bg-neutral-50/80 border-neutral-200/80 text-neutral-800 hover:bg-neutral-100/80 hover:border-neutral-300",
      leadText: "text-neutral-950 font-bold",
      bodyText: "text-neutral-700",
      dot: "bg-sky-600 ring-sky-200",
      accentBorder: "border-l-sky-600",
      footerBorder: "border-neutral-200/70",
      footerText: "text-neutral-500",
      promptBox: "bg-neutral-100/90 text-neutral-700 border-neutral-200",
      imageFrame: "border-neutral-200/90 bg-neutral-100",
      glowAura: "from-sky-500/10 via-indigo-500/10 to-transparent",
    },
    obsidian: {
      canvas: "bg-[#090D16] text-neutral-100 border-neutral-800/90 shadow-2xl shadow-cyan-950/20",
      kickerBg: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
      heading: "text-white font-black",
      card: "bg-neutral-900/60 border-neutral-800/80 text-neutral-200 hover:bg-neutral-900/90 hover:border-cyan-500/40",
      leadText: "text-white font-bold",
      bodyText: "text-neutral-300",
      dot: "bg-cyan-400 ring-cyan-950",
      accentBorder: "border-l-cyan-400",
      footerBorder: "border-neutral-800/70",
      footerText: "text-neutral-400",
      promptBox: "bg-neutral-900/90 text-neutral-300 border-neutral-800",
      imageFrame: "border-neutral-800 bg-neutral-950",
      glowAura: "from-cyan-500/15 via-teal-500/15 to-transparent",
    },
    navy: {
      canvas: "bg-[#0A1226] text-slate-100 border-blue-900/70 shadow-2xl shadow-blue-950/30",
      kickerBg: "bg-amber-950/40 text-amber-300 border-amber-800/50",
      heading: "text-slate-50 font-black",
      card: "bg-blue-950/40 border-blue-900/50 text-slate-200 hover:bg-blue-950/70 hover:border-amber-400/40",
      leadText: "text-amber-200 font-bold",
      bodyText: "text-slate-300",
      dot: "bg-amber-400 ring-amber-950",
      accentBorder: "border-l-amber-400",
      footerBorder: "border-blue-900/60",
      footerText: "text-slate-400",
      promptBox: "bg-blue-950/70 text-slate-300 border-blue-900",
      imageFrame: "border-blue-900 bg-blue-950",
      glowAura: "from-blue-600/15 via-indigo-600/15 to-transparent",
    },
  }[slideTheme];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col rounded-xl sm:rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xl transition-all",
        isFullscreen
          ? "h-screen w-screen rounded-none border-none p-4 sm:p-8 overflow-y-auto bg-neutral-950 text-neutral-100"
          : "p-3 sm:p-6",
        className
      )}
    >
      {/* Top Deck Control Header */}
      <div className="mb-3 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-base sm:text-xl font-bold tracking-tight text-foreground line-clamp-1">
                {deck.title || "Generating Pitch Deck..."}
              </h2>
              <DeckStatusBadge status={deck.status} />
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground line-clamp-1 max-w-xl">
              {deck.idea}
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
          {/* Slide Theme Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium shadow-2xs"
            title={`Current theme: ${slideTheme}. Click to switch theme.`}
          >
            <PaletteIcon className="size-3.5 text-primary" />
            <span className="hidden sm:inline capitalize">{slideTheme} Style</span>
          </Button>

          {totalSlides > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium shadow-2xs"
              title={isPlaying ? "Pause auto-presentation" : "Auto-play presentation (6s per slide)"}
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="size-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon className="size-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Auto-play</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={copyDeckText}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium shadow-2xs"
            title="Copy all slide texts to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="size-3.5" />
                <span className="hidden sm:inline">Copy Text</span>
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportPptx}
            disabled={isExporting || totalSlides === 0}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-semibold shadow-xs"
            title="Download Microsoft PowerPoint presentation (.pptx)"
          >
            {isExporting ? (
              <>
                <Spinner className="size-3.5" />
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <FileDownIcon className="size-3.5" />
                <span>Export PPTX</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium shadow-2xs hidden lg:inline-flex"
            title="Print presentation slides or save as browser PDF"
          >
            <PrinterIcon className="size-3.5" />
            <span className="hidden xl:inline">Print / PDF</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs font-medium shadow-2xs"
            title="Toggle fullscreen presentation (F)"
          >
            {isFullscreen ? (
              <>
                <Minimize2Icon className="size-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2Icon className="size-3.5" />
                <span className="hidden sm:inline">Present</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar & Slide Index Counter */}
      <div className="mb-3 sm:mb-5 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[11px] sm:text-xs font-semibold px-2.5 py-0.5">
            Slide {current || (totalSlides > 0 ? 1 : 0)} of {totalSlides}
          </Badge>
          {isPlaying && (
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Slideshow Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block font-mono text-[10px] text-muted-foreground/80">
            Use ← / → or Swipe
          </span>
          <div className="h-1.5 w-24 sm:w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Embla Carousel Presentation Stage */}
      {totalSlides === 0 ? (
        <div className="flex min-h-64 sm:min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-muted/10">
          <SparklesIcon className="size-8 text-primary animate-spin" />
          <h3 className="mt-3 text-base font-semibold">Generating Your Presentation</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
            The AI agent is currently crafting executive slide narratives and painting bespoke visual artwork.
          </p>
        </div>
      ) : (
        <div className="relative flex-1">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              duration: 25,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 sm:-ml-4">
              {slides.map((slide, index) => {
                const isPromptOpen = showPromptForSlide === slide.id;
                const kicker = getSlideKicker(slide.order, slide.title);
                const bulletItems = parseBulletPoints(slide.content);
                const isCoverSlide = slide.order === 1;

                return (
                  <CarouselItem
                    key={slide.id || index}
                    className="pl-2 sm:pl-4 basis-full"
                  >
                    {/* Slide Presentation Canvas Card */}
                    <div
                      className={cn(
                        "relative flex flex-col md:grid md:grid-cols-12 min-h-auto md:min-h-[500px] lg:min-h-[560px] gap-6 lg:gap-10 rounded-2xl border p-5 sm:p-7 md:p-10 transition-colors duration-300 overflow-hidden",
                        themeStyles.canvas
                      )}
                    >
                      {/* Ambient Theme Backdrop Glow */}
                      <div
                        className={cn(
                          "pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br blur-3xl opacity-60 -z-0",
                          themeStyles.glowAura
                        )}
                      />

                      {/* Left Side: Slide Typography & Executive Content (7 cols) */}
                      <div className="relative z-10 flex flex-col justify-between md:col-span-7 lg:col-span-7 order-2 md:order-1">
                        <div className="space-y-4 sm:space-y-5">
                          {/* Slide Kicker / Category Tag */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase border shadow-2xs",
                                themeStyles.kickerBg
                              )}
                            >
                              <span className="size-1.5 rounded-full bg-current" />
                              {kicker}
                            </span>

                            {isCoverSlide && (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono tracking-wider font-semibold text-muted-foreground uppercase">
                                <ShieldCheckIcon className="size-3 text-emerald-500" />
                                Investor Briefing
                              </span>
                            )}
                          </div>

                          {/* Slide Main Heading */}
                          <h3
                            className={cn(
                              "font-heading tracking-tight leading-[1.14]",
                              isCoverSlide
                                ? "text-2xl sm:text-3xl md:text-4xl lg:text-[42px]"
                                : "text-xl sm:text-2xl md:text-3xl lg:text-[34px]",
                              themeStyles.heading
                            )}
                          >
                            {slide.title}
                          </h3>

                          {/* Slide Cover Idea Accent (Slide 1 only) */}
                          {isCoverSlide && (
                            <div className="rounded-xl border border-border/40 bg-muted/20 p-3 sm:p-3.5">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-0.5">
                                Executive Thesis
                              </span>
                              <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                                {deck.idea}
                              </p>
                            </div>
                          )}

                          {/* Structured Bullet Items */}
                          <div className="pt-1 space-y-2.5 sm:space-y-3">
                            {bulletItems.map((item, bIdx) => (
                              <div
                                key={bIdx}
                                className={cn(
                                  "group/item flex items-start gap-3 rounded-xl p-3 sm:p-3.5 transition-all duration-200 border border-l-[3.5px]",
                                  themeStyles.card,
                                  themeStyles.accentBorder
                                )}
                              >
                                <div
                                  className={cn(
                                    "mt-1.5 flex size-2 shrink-0 rounded-full shadow-xs ring-4",
                                    themeStyles.dot
                                  )}
                                />
                                <div className="text-xs sm:text-sm md:text-[15px] leading-relaxed">
                                  {item.lead && (
                                    <span className={cn("mr-1.5", themeStyles.leadText)}>
                                      {item.lead}:
                                    </span>
                                  )}
                                  <span className={themeStyles.bodyText}>
                                    {item.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Slide Footer / AI Prompt Inspector Tray */}
                        <div
                          className={cn(
                            "mt-6 pt-3 sm:pt-4 border-t flex flex-col gap-2",
                            themeStyles.footerBorder
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setShowPromptForSlide(isPromptOpen ? null : slide.id)
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 text-[11px] sm:text-xs transition hover:opacity-100 touch-manipulation font-medium opacity-80",
                                themeStyles.footerText
                              )}
                            >
                              <SparklesIcon className="size-3.5 text-primary shrink-0" />
                              <span>
                                {isPromptOpen ? "Hide visual synthesis prompt" : "Inspect AI visual prompt"}
                              </span>
                            </button>

                            <span
                              className={cn(
                                "font-mono text-[10px] tracking-wider hidden sm:inline opacity-70",
                                themeStyles.footerText
                              )}
                            >
                              Slide {slide.order} of {totalSlides}
                            </span>
                          </div>

                          {isPromptOpen && (
                            <div
                              className={cn(
                                "rounded-xl border p-3 text-xs leading-relaxed animate-in fade-in-50 duration-200",
                                themeStyles.promptBox
                              )}
                            >
                              <span className="font-semibold block mb-0.5">
                                Visual Art Direction:
                              </span>
                              {slide.imagePrompt}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: High-Impact Gallery Visual (5 cols) */}
                      <div className="relative z-10 flex items-center justify-center md:col-span-5 lg:col-span-5 order-1 md:order-2">
                        <div
                          className={cn(
                            "group/art relative aspect-video sm:aspect-square md:aspect-[4/3] w-full max-h-56 sm:max-h-72 md:max-h-none overflow-hidden rounded-2xl border shadow-xl transition-all",
                            themeStyles.imageFrame
                          )}
                        >
                          {slide.imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="size-full object-cover transition-transform duration-700 ease-out group-hover/art:scale-105"
                                loading="lazy"
                              />

                              {/* Top-Right Badge: AI Synthesized Visual */}
                              <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm ring-1 ring-white/20">
                                <SparklesIcon className="size-3 text-amber-300" />
                                <span>AI Visual</span>
                              </div>

                              {/* Hover Zoom Overlay Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  setZoomedImage({
                                    url: slide.imageUrl!,
                                    title: slide.title,
                                  })
                                }
                                className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-0 group-hover/art:opacity-100 transition-opacity backdrop-blur-2xs cursor-zoom-in"
                                title="Click to enlarge image"
                              >
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 text-foreground px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
                                  <ZoomInIcon className="size-3.5" />
                                  <span>View Artwork</span>
                                </span>
                              </button>
                            </>
                          ) : (
                            <div className="flex size-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                              {isLiveGenerating ? (
                                <>
                                  <SparklesIcon className="size-8 text-primary animate-pulse" />
                                  <p className="mt-2 text-xs font-semibold text-foreground">
                                    Synthesizing Visual Artwork...
                                  </p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    DALL-E image generation in progress
                                  </p>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="size-8 stroke-1 text-muted-foreground/60" />
                                  <p className="mt-2 text-xs font-medium">Visual Illustration</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* In-view Carousel Navigation Buttons */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 sm:px-2">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                disabled={!api?.canScrollPrev()}
                className="pointer-events-auto flex size-8 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-20 touch-manipulation"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="size-4 sm:size-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                disabled={!api?.canScrollNext()}
                className="pointer-events-auto flex size-8 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-20 touch-manipulation"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="size-4 sm:size-5" />
              </button>
            </div>
          </Carousel>
        </div>
      )}

      {/* Bottom Thumbnail Strip for Instant Navigation */}
      {totalSlides > 1 && (
        <div className="mt-4 sm:mt-6 flex flex-col gap-1.5 sm:gap-2 border-t border-border/50 pt-3 sm:pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Slide Overview</span>
            <span className="text-[10px] sm:text-[11px]">Click or swipe to navigate</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {slides.map((s, idx) => {
              const isActive = current === idx + 1;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={cn(
                    "group/thumb flex min-w-32 sm:min-w-36 max-w-44 shrink-0 flex-col items-start rounded-xl border p-2 text-left transition-all touch-manipulation",
                    isActive
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40 shadow-xs"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-primary">
                      Slide {idx + 1}
                    </span>
                    {s.imageUrl && (
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className="mt-0.5 line-clamp-1 text-[11px] sm:text-xs font-semibold text-foreground/90 group-hover/thumb:text-foreground">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setZoomedImage(null)}
                className="rounded-full bg-background/90 backdrop-blur-sm"
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close preview</span>
              </Button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
            <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
              {zoomedImage.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
