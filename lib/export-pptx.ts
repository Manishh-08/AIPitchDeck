import PptxGenJS from "pptxgenjs";
import { DeckDetail, SlideItem } from "@/types/deck";

/**
 * Intelligent helper to extract a clean slide kicker category tag
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
    return `${num} // THE SOLUTION & VALUE PROPOSITION`;
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
    return `${num} // THE ASK & GROWTH ROADMAP`;
  }

  return `${num} // STRATEGIC BRIEF`;
}

/**
 * Parse bullet lines into structured items
 */
function parseBulletPoints(content: string) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  return lines.map((line) => {
    const clean = line.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");

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

/**
 * Fetch image as Base64 data URI (server-safe)
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("Failed to fetch image for PPTX:", url, err);
    return null;
  }
}

/**
 * Generate a complete, polished Microsoft PowerPoint (.pptx) presentation
 */
export async function buildPresentation(deck: DeckDetail): Promise<PptxGenJS> {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  pres.title = deck.title || "Pitch Deck";
  pres.subject = deck.idea || "Startup Pitch Deck";
  pres.author = "PitchCraft AI";
  pres.company = "PitchCraft Studio";

  const slides: SlideItem[] = deck.slides || [];
  const totalSlides = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const isCover = s.order === 1;
    const slide = pres.addSlide();

    // 1. Slide Background
    slide.background = { color: "FFFFFF" };

    // 2. Decorative Top Accent Bar
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.08,
      fill: { color: "0284C7" },
    });

    if (isCover) {
      // ------------------------------------
      // SLIDE 1: EXECUTIVE HERO COVER SLIDE
      // ------------------------------------
      
      // Top Tag
      slide.addText("CONFIDENTIAL // INVESTOR PRESENTATION", {
        x: 0.8,
        y: 0.7,
        w: 6.5,
        h: 0.35,
        fontSize: 10,
        fontFace: "Arial",
        bold: true,
        color: "0284C7",
      });

      // Main Title
      slide.addText(s.title || deck.title || "Startup Pitch Deck", {
        x: 0.8,
        y: 1.1,
        w: 6.8,
        h: 1.4,
        fontSize: 28,
        fontFace: "Arial",
        bold: true,
        color: "0F172A",
        valign: "top",
      });

      // Executive Thesis Card
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: 2.65,
        w: 6.8,
        h: 1.1,
        fill: { color: "F1F5F9" },
        line: { color: "E2E8F0", width: 1 },
        rectRadius: 0.08,
      });

      slide.addText("EXECUTIVE THESIS", {
        x: 1.0,
        y: 2.75,
        w: 6.4,
        h: 0.25,
        fontSize: 9,
        fontFace: "Arial",
        bold: true,
        color: "64748B",
      });

      slide.addText(deck.idea, {
        x: 1.0,
        y: 3.0,
        w: 6.4,
        h: 0.65,
        fontSize: 12,
        fontFace: "Arial",
        color: "1E293B",
        valign: "top",
      });

      // Bullets Summary on Cover
      const bulletItems = parseBulletPoints(s.content);
      let bulletY = 3.9;
      for (const item of bulletItems.slice(0, 3)) {
        const textParts = item.lead
          ? [
              { text: `• ${item.lead}: `, options: { bold: true, color: "0F172A" } },
              { text: item.text, options: { bold: false, color: "334155" } },
            ]
          : [{ text: `• ${item.text}`, options: { bold: false, color: "334155" } }];

        slide.addText(textParts, {
          x: 0.8,
          y: bulletY,
          w: 6.8,
          h: 0.5,
          fontSize: 11,
          fontFace: "Arial",
          valign: "top",
        });
        bulletY += 0.45;
      }

      // Cover Hero Image (Right Side)
      if (s.imageUrl) {
        const base64Img = await fetchImageAsBase64(s.imageUrl);
        if (base64Img) {
          slide.addImage({
            data: base64Img,
            x: 8.0,
            y: 0.9,
            w: 4.6,
            h: 5.5,
            sizing: { type: "cover", w: 4.6, h: 5.5 },
          });
        }
      }
    } else {
      // ------------------------------------
      // SLIDES 2..N: CONTENT & EXECUTIVE STORY
      // ------------------------------------

      const kicker = getSlideKicker(s.order, s.title);

      // Kicker Category Tag
      slide.addText(kicker, {
        x: 0.8,
        y: 0.6,
        w: 7.0,
        h: 0.3,
        fontSize: 10,
        fontFace: "Arial",
        bold: true,
        color: "0284C7",
      });

      // Slide Title
      slide.addText(s.title, {
        x: 0.8,
        y: 0.95,
        w: 7.0,
        h: 0.9,
        fontSize: 22,
        fontFace: "Arial",
        bold: true,
        color: "0F172A",
        valign: "top",
      });

      // Structured Bullet Takeaways Cards
      const bulletItems = parseBulletPoints(s.content);
      let cardY = 2.0;

      for (let bIdx = 0; bIdx < bulletItems.length; bIdx++) {
        const item = bulletItems[bIdx];
        const cardH = 0.95;

        // Card Container
        slide.addShape(pres.ShapeType.roundRect, {
          x: 0.8,
          y: cardY,
          w: 6.8,
          h: cardH,
          fill: { color: "F8FAFC" },
          line: { color: "E2E8F0", width: 1 },
          rectRadius: 0.08,
        });

        // Left Accent Strip on Card
        slide.addShape(pres.ShapeType.rect, {
          x: 0.8,
          y: cardY,
          w: 0.1,
          h: cardH,
          fill: { color: "0284C7" },
        });

        // Card Text
        const textParts = item.lead
          ? [
              { text: `${item.lead}: `, options: { bold: true, color: "0F172A", fontSize: 12 } },
              { text: item.text, options: { bold: false, color: "334155", fontSize: 11.5 } },
            ]
          : [{ text: item.text, options: { bold: false, color: "334155", fontSize: 11.5 } }];

        slide.addText(textParts, {
          x: 1.1,
          y: cardY + 0.1,
          w: 6.3,
          h: cardH - 0.2,
          fontFace: "Arial",
          valign: "middle",
        });

        cardY += cardH + 0.2;
        if (cardY > 6.2) break;
      }

      // Slide Image (Right Column: 4.8 inches wide, 4.8 inches high)
      if (s.imageUrl) {
        const base64Img = await fetchImageAsBase64(s.imageUrl);
        if (base64Img) {
          slide.addImage({
            data: base64Img,
            x: 8.0,
            y: 1.1,
            w: 4.5,
            h: 4.5,
            sizing: { type: "cover", w: 4.5, h: 4.5 },
          });

          // AI Badge
          slide.addShape(pres.ShapeType.roundRect, {
            x: 8.15,
            y: 1.25,
            w: 1.3,
            h: 0.35,
            fill: { color: "0F172A", transparency: 20 },
            rectRadius: 0.08,
          });

          slide.addText("AI VISUAL", {
            x: 8.15,
            y: 1.25,
            w: 1.3,
            h: 0.35,
            fontSize: 8,
            fontFace: "Arial",
            bold: true,
            color: "FEF08A",
            align: "center",
            valign: "middle",
          });
        }
      }
    }

    // Slide Footer
    slide.addText(`PitchCraft AI  |  ${deck.title || "Pitch Deck"}`, {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: "94A3B8",
    });

    slide.addText(`${s.order} / ${totalSlides}`, {
      x: 11.5,
      y: 7.0,
      w: 1.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      bold: true,
      color: "94A3B8",
      align: "right",
    });
  }

  return pres;
}
