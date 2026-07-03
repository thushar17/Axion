import { useState } from "react";
import { toast } from "sonner";
import { getMembers, addMember, removeMember, generateInvite } from "../services/room.service";

type Props = {
    selectedRoom: any;
    user: any;
};

export function useMembers({ selectedRoom, user }: Props) {
    const [members, setMembers] = useState<any[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [email, setEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");

    // ── Fetch members ─────────────────────────────────────────────────────────
    const fetchMembers = async () => {
        if (!selectedRoom) return;
        try {
            const response = await getMembers(selectedRoom._id);
            setMembers(response.data.members);
        } catch (error) {
            console.error(error);
        }
    };

    // ── Add member ────────────────────────────────────────────────────────────
    const handleAddMember = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedRoom) return;
        try {
            const response = await addMember(email, selectedRoom._id);
            if (response.data.success) {
                toast.success(response.data.message);
                setEmail("");
                setShowAddMember(false);
            }
            await fetchMembers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add member");
        }
    };

    // ── Remove member ─────────────────────────────────────────────────────────
    const handelRemoveMember = async (memberId: string) => {
        if (!selectedRoom) return;
        try {
            const response = await removeMember(memberId, selectedRoom._id);
            if (response.data.success) {
                toast.success("Member removed");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to remove member");
        }
    };

    // ── Generate invite link ──────────────────────────────────────────────────
    const handelLinkGeneration = async () => {
        if (!selectedRoom) return;
        try {
            const response = await generateInvite(selectedRoom._id);
            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }
            setInviteLink(response.data.inviteLink);
            toast.success("Invite link generated");
        } catch (error) {
            console.log(error);
            toast.error("Failed to generate invite link");
        }
    };

    // ── isAdmin check ─────────────────────────────────────────────────────────
    const isAdmin = members.some(
        (member) => member.user._id === user?.id && member.role === "admin"
    );

    return {
        members,
        setMembers,
        showAddMember,
        setShowAddMember,
        email,
        setEmail,
        inviteLink,
        setInviteLink,
        fetchMembers,
        handleAddMember,
        handelRemoveMember,
        handelLinkGeneration,
        isAdmin
    };
}
