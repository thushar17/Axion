"use client"

import { useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";




export default function InvitePage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect")
    const hasJoined = useRef(false);


    useEffect(() => {
        if (hasJoined.current) return;
        hasJoined.current = true;
        const joinRoom = async () => {
            console.log(params.inviteCode)

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await axios.post(`${API_URL}/room/join-invite`, {
                    inviteCode: params.inviteCode
                }, {
                    withCredentials: true
                })
                if (!response.data.success) {
                    alert(response.data.message)
                }
                router.push(redirect || "/chat")
            } catch (error: any) {
                if(error.response?.status === 401){
                    router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
                    return;
                }
                console.log(error)
            
            }

        }
        joinRoom()
    }, [])

    return <div>Joining ... </div>

}