import { useState } from "react";

export function useRoomState(){
          const [allRooms, setAllRooms] = useState<any[]>([]);
        const [selectedRoom, setSelectedRoom] = useState<any>(null);
          const [showCreateRoom, setShowCreateRoom] = useState(false);


        return{
            allRooms,setAllRooms,
            selectedRoom, setSelectedRoom,
            showCreateRoom,
            setShowCreateRoom
        }
}