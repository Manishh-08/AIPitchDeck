"use client";

import * as React from "react";
import { SparklesIcon, LightbulbIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface CreateDeckFormProps {
  onDeckCreated?: (deckId: string) => void;
  className?: string;
}

const STARTER_PROMPTS = [
  {
    tag: "AI LegalTech",
    prompt:
      "An AI-powered legal contract risk analyzer that automatically flags non-standard clauses, unlimited liability traps, and hidden autorenewal costs for SaaS founders before signing.",
  },
  {
    tag: "Clean Energy",
    prompt:
      "A decentralized microgrid trading platform enabling commercial buildings with solar and battery storage to dynamically sell excess power to neighboring EV fleet charging hubs.",
  },
  {
    tag: "MedTech",
    prompt:
      "A non-invasive continuous glucose and metabolic monitoring sensor for pre-diabetic patients with real-time biometric feedback and personalized dietary intervention coaching.",
  },
  {
    tag: "Developer Tools",
    prompt:
      "An automated cloud architecture security agent that continuously scans terraform code and production AWS environments to prevent zero-day misconfigurations before deployment.",
  },
];

export function CreateDeckForm({
  onDeckCreated,
  className,
}: CreateDeckFormProps) {
  const [idea, setIdea] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const trimmedLength = idea.trim().length;
  const isLengthValid = trimmedLength >= 20;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isLengthValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      let data: { id?: string; error?: string } | null = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || `Server error (${response.status})`);
        }
      }

      if (!response.ok || !data?.id) {
        throw new Error(data?.error || `Failed to initiate deck generation (${response.status})`);
      }

      toast.add({
        title: "Deck Generation Started",
        description: "The AI agent is drafting your pitch deck slides and generating visuals.",
      });

      setIdea("");
      onDeckCreated?.(data.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.add({
        title: "Could not create deck",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setIdea(prompt);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-8 shadow-sm ring-1 ring-foreground/[0.04] transition-all",
        className
      )}
    >
      {/* Subtle background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative">
        <div className="mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] sm:text-xs font-medium text-primary mb-2">
            <SparklesIcon className="size-3 sm:size-3.5" />
            <span>Autonomous Pitch Generation</span>
          </div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            What is your startup or project idea?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Provide a clear description of your problem, solution, or market.
            Our AI agent will synthesize market research, structure executive-ready slides, and generate custom visuals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., A collaborative workflow platform for hardware engineering teams that synchronizes CAD models, bills of materials, and compliance tests in real-time..."
              className="min-h-28 sm:min-h-32 resize-none rounded-xl bg-background/80 p-3 sm:p-4 text-xs sm:text-sm leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-primary/40 focus-visible:border-primary/50"
              disabled={isSubmitting}
            />

            {/* Character counter & length helper */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono font-medium transition-colors text-[11px] sm:text-xs",
                    isLengthValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : trimmedLength > 0
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  )}
                >
                  {trimmedLength} / 20 min chars
                </span>
                {isLengthValid && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                    ✓ Ready to generate
                  </span>
                )}
              </div>

              {trimmedLength > 0 && !isLengthValid && (
                <span className="text-muted-foreground text-[11px]">
                  Add {20 - trimmedLength} more characters
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 sm:p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Starter prompts */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <LightbulbIcon className="size-3.5 text-amber-500 shrink-0" />
              <span>Or try an inspiration prompt:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {STARTER_PROMPTS.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleSelectPrompt(item.prompt)}
                  disabled={isSubmitting}
                  className="group inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 sm:py-1 text-xs text-foreground/80 transition hover:border-primary/40 hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="font-medium text-primary text-[11px]">
                    {item.tag}
                  </span>
                  <span className="text-muted-foreground group-hover:text-foreground">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-1 sm:pt-2">
            <Button
              type="submit"
              disabled={!isLengthValid || isSubmitting}
              size="lg"
              className="w-full sm:w-auto h-10 sm:h-10 px-5 rounded-xl font-medium shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  <span>Launching Agent...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-1.5 size-4" />
                  <span>Generate Pitch Deck</span>
                  <ArrowRightIcon className="ml-1 size-4 opacity-70" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
