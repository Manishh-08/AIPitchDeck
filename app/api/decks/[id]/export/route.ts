import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildPresentation } from "@/lib/export-pptx";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    const pres = await buildPresentation(deck as unknown as import("@/types/deck").DeckDetail);
    const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;

    const safeTitle =
      (deck.title || "Pitch_Deck")
        .replace(/[^a-zA-Z0-9_\- ]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "Pitch_Deck";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${safeTitle}.pptx"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to generate PPTX presentation:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate PPTX presentation", details: message },
      { status: 500 }
    );
  }
}
