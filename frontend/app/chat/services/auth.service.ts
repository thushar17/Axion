import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkAuth() {
  return axios.get(`${API_URL}/auth/me`, { withCredentials: true });
}

export async function starMessage(messageId: string) {
  return axios.post(`${API_URL}/auth/star-message`, { messageId }, { withCredentials: true });
}

export async function getStarredMessages() {
  return axios.get(`${API_URL}/auth/starred-messages`, { withCredentials: true });
}

export async function muteRoom(roomId: string) {
  return axios.post(`${API_URL}/auth/mute-room`, { roomId }, { withCredentials: true });
}

export async function archiveRoom(roomId: string) {
  return axios.post(`${API_URL}/auth/archive-room`, { roomId }, { withCredentials: true });
}

export async function clearChat(roomId: string) {
  return axios.post(`${API_URL}/auth/clear-chat`, { roomId }, { withCredentials: true });
}
