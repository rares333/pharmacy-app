// // src/services/orderService.ts
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// const ORDERS_URL = `${API_URL}/orders`;

// export interface OrderItem {
//   id: number;
//   quantity: number;
// }

// export interface OrderResponse {
//   orderId: number;
// }

// /**
//  * Send a new order to the backend.
//  * @param items  List of items (id + quantity)
//  * @param cardId Optional loyalty card ID
//  */
// export async function sendOrder(
//   items: OrderItem[],
//   cardId?: string
// ): Promise<OrderResponse> {
//   const payload: { items: OrderItem[]; cardId?: string } = { items };
//   if (cardId) payload.cardId = cardId;
//   const res = await axios.post<OrderResponse>(ORDERS_URL, payload);
//   return res.data;
// }


// src/services/orderService.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ORDERS_URL = `${API_URL}/orders`;

export interface OrderItem {
  id: number;
  quantity: number;
}

export interface OrderResponse {
  orderId: number;
}

/**
 * Send a new order to the backend.
 * @param items  List of items (id + quantity)
 * @param cardId Optional loyalty card ID
 */
export async function sendOrder(
  items: OrderItem[],
  cardId?: string
): Promise<OrderResponse> {
  const payload: { items: OrderItem[]; cardId?: string } = { items };
  if (cardId) payload.cardId = cardId;
  const res = await axios.post<OrderResponse>(ORDERS_URL, payload);
  return res.data;
}
