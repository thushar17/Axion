import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clearChat } from "../services/auth.service";
import { searchMessages } from "../services/message.service";

type Props = {
    selectedRoom: any;
    allRooms: any[];
    setSelectedRoom: React.Dispatch<React.SetStateAction<any>>;
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    setShowClearConfirm: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useMessages({
    selectedRoom,
    allRooms,
    setSelectedRoom,
    setMessages,
    setShowClearConfirm
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // ── Clear chat ────────────────────────────────────────────────────────────
    const handleClearChat = async (roomId: string) => {
        try {
            const response = await clearChat(roomId);
            if (response.data.success) {
                setMessages([]);
                toast.success("Chat cleared");
                setShowClearConfirm(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear chat");
        }
    };

    // ── Scroll to message ─────────────────────────────────────────────────────
    const scrollToMessage = (messageId: string, roomId?: string) => {
        if (roomId && selectedRoom?._id !== roomId) {
            const targetRoom = allRooms.find((r) => r._id === roomId);
            if (targetRoom) {
                setSelectedRoom(targetRoom);
                setTimeout(() => {
                    const element = document.getElementById(`msg-${messageId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                        element.classList.add("highlight-message");
                        setTimeout(
                            () => element.classList.remove("highlight-message"),
                            2000
                        );
                    }
                }, 800);
                return;
            }
        }
        const element = document.getElementById(`msg-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight-message");
            setTimeout(
                () => element.classList.remove("highlight-message"),
                2000
            );
        }
    };

    // messages search
    useEffect(() => {
        if (!selectedRoom) return;

        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await searchMessages(selectedRoom._id, searchQuery);
                setSearchResults(response.data.messages);
            } catch (error) {
                console.log(error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedRoom]);

    return {
        handleClearChat,
        scrollToMessage,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        isSearching,
        setIsSearching
    };
}
