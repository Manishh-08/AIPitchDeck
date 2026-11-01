import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/** Get one deck with its slides (ordered). */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      slides: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json(deck);
}

/** Delete a deck and all cascaded slides. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    await prisma.deck.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete deck" },
      { status: 500 },
    );
  }
}