import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

export interface Product {
  id: number;
  name: string;
  brand: string;
  active_ingredient: string;
  dosage_form: string;
  pack_size: string;
  price_eur: number | null;
  image_url: string | null;
  // …any other fields you need
}

export async function getRecommendations(symptom: string): Promise<Product[]> {
  const res = await API.get<{ [key: string]: any }[]>(
    `/recommendations`,
    { params: { symptom } }
  );
  return res.data as Product[];
}
