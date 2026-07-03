import { useEffect } from "react";

type Props = {
  setContextMenu: (val: any) => void;
  setShowRoomSettings: (val: boolean) => void;
};

export function useGlobalClickClose({ setContextMenu, setShowRoomSettings }: Props) {
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setShowRoomSettings(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [setContextMenu, setShowRoomSettings]);
}
