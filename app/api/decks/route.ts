import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { DeckStatus } from "@/lib/generated/prisma/client";
import { inngest } from "@/lib/inngest/client";
import { executeDeckGeneration } from "@/lib/inngest/functions/generate-deck";

const createDeckSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(20, "Project idea must be at least 20 characters."),
});

/** List all decks, newest first. */
export async function GET() {
  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { slides: true } },
    },
  });

  return NextResponse.json(
    decks.map((deck) => ({
      id: deck.id,
      idea: deck.idea,
      title: deck.title,
      status: deck.status,
      errorMessage: deck.errorMessage,
      slideCount: deck._count.slides,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    })),
  );
}

/** Create a deck and start background generation. */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createDeckSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const deck = await prisma.deck.create({
      data: {
        idea: parsed.data.idea,
        status: DeckStatus.PENDING,
      },
    });

    try {
      await inngest.send({
        name: "deck/generate",
        data: { deckId: deck.id },
      });
    } catch (inngestError) {
      console.warn(
        "Inngest dev server not reachable (make sure `npx inngest-cli@latest dev` is running). Falling back to direct background execution.",
        inngestError,
      );
      // Run in background without awaiting so API returns 201 immediately
      void executeDeckGeneration(deck.id);
    }

    return NextResponse.json(
      { id: deck.id, status: deck.status },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create deck:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create deck" },
      { status: 500 },
    );
  }
}