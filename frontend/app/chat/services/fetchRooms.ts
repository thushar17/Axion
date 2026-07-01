import axios from "axios";

export const fetchRooms = async ()=>{

     const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/room/getRooms`, {
        withCredentials: true,
      })
    };
