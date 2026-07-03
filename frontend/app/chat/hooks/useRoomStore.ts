import { useState, useMemo } from "react";

export function useRoomStore() {
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const [mutedRoomIds, setMutedRoomIds] = useState<string[]>([]);
  const [archivedRoomIds, setArchivedRoomIds] = useState<string[]>([]);





  const [showRoomSettings, setShowRoomSettings] = useState(false);


  const activeRooms = useMemo(() => 
    allRooms.filter((room: any) => !archivedRoomIds.includes(room._id)),
    [allRooms, archivedRoomIds]
  );
  
  const archivedRooms = useMemo(() => 
    allRooms.filter((room: any) => archivedRoomIds.includes(room._id)),
    [allRooms, archivedRoomIds]
  );

  return {
    allRooms, setAllRooms,
    selectedRoom, setSelectedRoom,
    showCreateRoom,
    setShowCreateRoom,
    mutedRoomIds,
    setMutedRoomIds,
    archivedRoomIds,
    setArchivedRoomIds,
    showRoomSettings, setShowRoomSettings,
    activeRooms,
    archivedRooms
  }
}