import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getNotifications() {
  return axios.get(`${API_URL}/notification`, { withCredentials: true });
}

export async function markAllAsRead() {
  return axios.put(`${API_URL}/notification/mark-all-read`, {}, { withCredentials: true });
}

export async function markAsRead(id: string) {
  return axios.put(`${API_URL}/notification/${id}/read`, {}, { withCredentials: true });
}
