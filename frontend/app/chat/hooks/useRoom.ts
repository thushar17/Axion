import { toast } from "sonner";
import { getRooms, createRoom, deleteRoom } from "../services/room.service";
import { useState } from "react";
import { muteRoom } from "../services/auth.service";

type Props = {
   emitJoinRooms:(selectedRoom: any) => void
   allRooms:any[]
   setAllRooms: React.Dispatch<React.SetStateAction<any[]>>
   selectedRoom:any
   setSelectedRoom:React.Dispatch<React.SetStateAction<any>>
   setShowCreateRoom: React.Dispatch<React.SetStateAction<boolean>>
}

export function useRoom({emitJoinRooms,
    allRooms,
    setAllRooms,
    selectedRoom,
    setSelectedRoom,
    setShowCreateRoom
}:Props){
      const [roomName, setRoomName] = useState("");
       
      
        const [roomType, setRoomType] = useState("public");
          const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Fetch rooms ───────────────────────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      if (response.status !== 200) {
        toast.error("Failed to fetch rooms");
        return;
      }
      setAllRooms(response.data.data);
      const roomIds = response.data.data.map((r: any) => r._id);
      emitJoinRooms(roomIds);
      if (response.data.data.length > 0) {
        setSelectedRoom(response.data.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };





    // ── Create room ───────────────────────────────────────────────────────────
    const handleRoomCreation = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await createRoom(roomName, roomType);
        if (response.status === 400) {
          toast.error("Error while creating room");
          return;
        }
        toast.success(response.data.message);
        await fetchRooms();
        setRoomName("");
        setRoomType("public");
        setShowCreateRoom(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to create room");
      }
    };

    // delete room
      const handelRoomDelete = async (roomId: string) => {
    try {
      const response = await deleteRoom(roomId);
      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }
      toast.success("Room deleted");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete room");
    }
  };





    // ── Mute room ─────────────────────────────────────────────────────────────
    const handleMuteRoom = async (roomId: string) => {
      try {
        const response = await muteRoom(roomId);
        if (response.data.success) {
          setMutedRoomIds(response.data.mutedRooms);
          toast.success(
            mutedRoomIds.includes(roomId) ? "Room unmuted" : "Room muted"
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // ── Archive room ──────────────────────────────────────────────────────────
    const handleArchiveRoom = async (roomId: string) => {
      try {
        const response = await archiveRoom(roomId);
        if (response.data.success) {
          setArchivedRoomIds(response.data.archivedRooms);
          toast.success(
            archivedRoomIds.includes(roomId) ? "Room unarchived" : "Room archived"
          );
          setShowRoomSettings(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
  

  return{
  fetchRooms,
  setSelectedRoom,
  selectedRoom,
  roomName,
  roomType,
  handleRoomCreation,
  setShowDeleteConfirm,
  showDeleteConfirm,
  handelRoomDelete,
  setRoomName,
  setRoomType
  }


}


 
