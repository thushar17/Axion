import { useState } from "react";

export function useChatUI() {
  const [loading, setLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState<{ [roomId: string]: number }>({});
  const [isPinnedSheetOpen, setIsPinnedSheetOpen] = useState(false);
  const [showArchivedSection, setShowArchivedSection] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  return {
    loading,
    setLoading,
    unreadMessageCount,
    setUnreadMessageCount,
    isPinnedSheetOpen,
    setIsPinnedSheetOpen,
    showArchivedSection,
    setShowArchivedSection,
    showLeaveConfirm,
    setShowLeaveConfirm,
    showClearConfirm,
    setShowClearConfirm,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    showMembersPanel,
    setShowMembersPanel,
    hoveredMsgId,
    setHoveredMsgId,
  };
}
