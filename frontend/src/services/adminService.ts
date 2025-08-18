import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface OrderSummary {
  order_id:    number;
  card_id:     string | null;
  created_at:  string;
  product_ids: number[];
  quantities:  number[];
}

export async function fetchOrderSummaries(): Promise<OrderSummary[]> {
  const res = await axios.get<OrderSummary[]>(`${API_URL}/admin/orders`);
  return res.data;
}
