 "use client"

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";



 export default function InvitePage({
  params,
}: {
  params: { inviteCode: string };
}){
    const router = useRouter()
    
 
    useEffect(()=>{
        const joinRoom = async()=>{
            console.log(params.inviteCode)
               
            try {
               const response =  await axios.post("http://localhost:8000/room/join-invite",{
                    inviteCode: params.inviteCode
                },{
                    withCredentials: true
                })
                if (!response.data.success) {
                  alert(response.data.message)
}
router.push('/chat')
            } catch (error) {
                console.error(error)
            }

        }
         joinRoom()
    },[])

    return <div>Joining ... </div>
  
}