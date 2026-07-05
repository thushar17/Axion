import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function editMessage(messageId: string, messageContent: string) {
  return axios.post(`${API_URL}/room/edit-message`, { messageId, messageContent }, { withCredentials: true });
}

export async function deleteMessage(messageId: string) {
  return axios.post(`${API_URL}/room/delete-message`, { messageId }, { withCredentials: true });
}

export async function pinMessage(messageId: string) {
  return axios.post(`${API_URL}/room/pin-message`, { messageId }, { withCredentials: true });
}

export async function toggleReaction(messageId: string, emoji: string) {
  return axios.post(`${API_URL}/room/messages/toggle-reaction`, { messageId, emoji }, { withCredentials: true });
}

export async function searchMessages(roomId: string, query: string) {
  return axios.get(`${API_URL}/room/messages/search`, { params: { roomId, query }, withCredentials: true });
}

export async function getPaginatedMessages(roomId: string, cursor?: string | null) {
  const params: any = { roomId };
  if (cursor) {
    params.cursor = cursor;
  }
  return axios.get(`${API_URL}/room/messages/paginated`, { params, withCredentials: true });
}

export async function uploadAttachment(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_URL}/room/message/upload`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
