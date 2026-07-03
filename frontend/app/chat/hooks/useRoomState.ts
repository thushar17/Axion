import { useState } from "react";

export function useRoomState(){
          const [allRooms, setAllRooms] = useState<any[]>([]);
        const [selectedRoom, setSelectedRoom] = useState<any>(null);
          const [showCreateRoom, setShowCreateRoom] = useState(false);

  const [mutedRoomIds, setMutedRoomIds] = useState<string[]>([]);
  const [archivedRoomIds, setArchivedRoomIds] = useState<string[]>([]);



  

  const [showRoomSettings, setShowRoomSettings] = useState(false);


        return{
            allRooms,setAllRooms,
            selectedRoom, setSelectedRoom,
            showCreateRoom,
            setShowCreateRoom,
            mutedRoomIds,
            setMutedRoomIds,
            archivedRoomIds,
            setArchivedRoomIds,
            showRoomSettings, setShowRoomSettings
        }
}