import { Suspense } from "react";
import type { Metadata } from "next";
import { DeckPresentationPage } from "@/components/deck/deck-presentation-page";
import { Spinner } from "@/components/ui/spinner";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const deck = await prisma.deck.findUnique({
      where: { id },
      select: { title: true, idea: true },
    });
    if (deck?.title) {
      return {
        title: deck.title,
        description: deck.idea,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: "Presentation",
  };
}

async function DeckContent({ params }: RouteParams) {
  const { id } = await params;
  return <DeckPresentationPage id={id} />;
}

export default function DeckPage({ params }: RouteParams) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <DeckContent params={params} />
    </Suspense>
  );
}
