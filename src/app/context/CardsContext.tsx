"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface Card {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

interface CardsByPack {
  [packName: string]: Card[];
}

interface CardsContextType {
  cardsByPack: CardsByPack;
  setCardsByPack: (cards: CardsByPack) => void;
  isInitialized: boolean;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: ReactNode }) {
  const [cardsByPack, setCardsByPackState] = useState<CardsByPack>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCards = localStorage.getItem("cardsByPack");
      if (storedCards) {
        setCardsByPackState(JSON.parse(storedCards));
      }
    } catch (error) {
      console.error("Error loading cards from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setCardsByPack = (cards: CardsByPack) => {
    setCardsByPackState(cards);
    try {
      localStorage.setItem("cardsByPack", JSON.stringify(cards));
    } catch (error) {
      console.error("Error saving cards to localStorage:", error);
    }
  };

  return (
    <CardsContext.Provider
      value={{ cardsByPack, setCardsByPack, isInitialized }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (context === undefined) {
    throw new Error("useCards must be used within a CardsProvider");
  }
  return context;
}
