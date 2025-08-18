// src/contexts/CardContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CardContextValue {
  cardId: string | null;
  setCardId(id: string): void;
  skippedCard: boolean;
  setSkippedCard(skip: boolean): void;
}

const CardContext = createContext<CardContextValue | null>(null);

export function useCard(): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('useCard must be used inside a CardProvider');
  return ctx;
}

export function CardProvider({ children }: { children: ReactNode }) {
  const [cardId, setCardId] = useState<string | null>(null);
  const [skippedCard, setSkippedCard] = useState(false);

  return (
    <CardContext.Provider value={{ cardId, setCardId, skippedCard, setSkippedCard }}>
      {children}
    </CardContext.Provider>
  );
}
