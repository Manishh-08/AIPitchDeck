export type DeckStatus = "PENDING" | "GENERATING" | "COMPLETE" | "FAILED";

export interface SlideItem {
  id: string;
  deckId: string;
  order: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
  createdAt: string | Date;
}

export interface DeckListItem {
  id: string;
  idea: string;
  title: string | null;
  status: DeckStatus;
  errorMessage: string | null;
  slideCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DeckDetail {
  id: string;
  idea: string;
  title: string | null;
  status: DeckStatus;
  errorMessage: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  slides: SlideItem[];
}
