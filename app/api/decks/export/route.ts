import { NextRequest, NextResponse } from "next/server";
import { buildPresentation } from "@/lib/export-pptx";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deck = body?.deck;

    if (!deck) {
      return NextResponse.json({ error: "Missing deck payload" }, { status: 400 });
    }

    const pres = await buildPresentation(deck);
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
    console.error("Failed to generate PPTX from payload:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate PPTX presentation", details: message },
      { status: 500 }
    );
  }
}
