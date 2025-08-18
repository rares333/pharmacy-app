// src/services/symptomService.ts
import axios from 'axios';

// Base URL for our backend API (defined in .env)
const API_URL      = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const RECOMMEND_URL = `${API_URL}/recommendations`;
const SUGGEST_URL   = `${API_URL}/symptom_suggestions`;

// Shape of a product recommendation coming back from the server
export interface ProductRecommendation {
  id:           number;
  name:         string;
  brand:        string;
  price_eur:    number | null;
  in_stock:     boolean;
  image_url:    string | null;
  is_otc:       boolean;
  indications:  string;
  dosage_form:       string | null;
  dosage: string,
  category: string;  // pulled from your “Forma farmaceutica + Concentratie” combo
}

/**
 * Fetch product recommendations for a given symptom.
 * @param symptom The user‐entered symptom text
 * @param cardId   (optional) loyalty card to personalize history
 */
export async function fetchRecommendations(
  symptom: string,
  cardId?: string
): Promise<ProductRecommendation[]> {
  const params: Record<string,string> = { symptom };
  if (cardId) params.card = cardId;

  const res = await axios.get<ProductRecommendation[]>(RECOMMEND_URL, { params });
  recordHistory(symptom, cardId);
  return res.data;
}

const HISTORY_KEY = 'pharmacy_tablet_history';
interface HistoryEntry {
  symptom: string;
  cardId?: string;
  at:      string;
}

/** store each successful query into localStorage */
function recordHistory(symptom: string, cardId?: string) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    arr.unshift({ symptom, cardId, at: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 100)));
  } catch {
    // fail silently
  }
}

/**
 * Fetch a list of symptom‐autocomplete suggestions.
 * @param q Partial symptom text
 */
export async function fetchSymptomSuggestions(q: string): Promise<string[]> {
  const { data } = await axios.get<string[]>(SUGGEST_URL, { params: { q } });
  return data;
}

export async function fetchProductsByCategory(
  category: string
): Promise<ProductRecommendation[]> {
  const res = await fetch(
    `${API_URL}/group/${encodeURIComponent(category)}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch category ${category}: ${res.status}`);
  }
  return (await res.json()) as ProductRecommendation[];
}
