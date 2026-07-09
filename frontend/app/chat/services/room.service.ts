import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getRooms() {
  return axios.get(`${API_URL}/room/getRooms`, { withCredentials: true });
}

export async function createRoom(name: string, type: string) {
  return axios.post(`${API_URL}/room/create`, { name, type }, { withCredentials: true });
}

export async function deleteRoom(roomId: string) {
  return axios.delete(`${API_URL}/room/delete`, { data: { roomId }, withCredentials: true });
}

export async function renameRoom(roomId: string, newName: string) {
  return axios.post(`${API_URL}/room/rename`, { roomId, newName }, { withCredentials: true });
}

export async function leaveRoom(roomId: string) {
  return axios.post(`${API_URL}/room/leave`, { roomId }, { withCredentials: true });
}

export async function getMembers(roomId: string) {
  return axios.get(`${API_URL}/room/${roomId}/members`, { withCredentials: true });
}

export async function addMember(email: string, roomId: string) {
  return axios.post(`${API_URL}/room/add-member`, { email, roomId }, { withCredentials: true });
}

export async function removeMember(memberId: string, roomId: string) {
  return axios.delete(`${API_URL}/room/remove-member`, { data: { memberId, roomId }, withCredentials: true });
}

export async function generateInvite(roomId: string) {
  return axios.post(`${API_URL}/room/generate-invite`, { roomId }, { withCredentials: true });
}

export async function createOrGetDm(memberId:string) {
   return axios.post(`${API_URL}/room/dm`,{
      memberId
   },
  {withCredentials: true})
}