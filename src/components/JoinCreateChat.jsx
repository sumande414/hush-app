import React, { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("joined..");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created Successfully !!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 400) {
          toast.error("Room already exists !!");
        } else {
          toast("Error in creating room");
        }
      }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 animate-gradient-xy"></div>
        <div className="absolute w-96 h-96 bg-violet-200 rounded-full -top-48 -left-48 opacity-30 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-purple-200 rounded-full -bottom-48 -right-48 opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute w-72 h-72 bg-violet-300 rounded-full top-48 left-48 opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center w-full max-w-6xl mx-auto">
        {/* Left Section - Title and Tagline */}
        <div className="flex-1 pr-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Hush
          </h1>
          <p className="text-violet-500 mt-2 text-xl">Connect & Chat Securely</p>
        </div>

        {/* Right Section - Form Container */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="userName" className="block text-violet-700 font-medium">
                Your Name
              </label>
              <input
                onChange={handleFormInputChange}
                value={detail.userName}
                type="text"
                id="userName"
                name="userName"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Room ID Input */}
            <div className="space-y-2">
              <label htmlFor="roomId" className="block text-violet-700 font-medium">
                Room ID
              </label>
              <input
                name="roomId"
                onChange={handleFormInputChange}
                value={detail.roomId}
                type="text"
                id="roomId"
                placeholder="Enter room ID"
                className="w-full px-4 py-3 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={joinChat}
                className="flex-1 py-3 px-4 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Join Room
              </button>
              <button
                onClick={createRoom}
                className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;