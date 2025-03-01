import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdLogout, MdPerson, MdForum } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to toggle profile visibility

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        setMessages(messages);
      } catch (error) {}
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat", {
          style: { background: "#a78bfa", color: "#fff" },
          icon: "🚀",
        });

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  function replaceUTCOffset(dateString) {
    return dateString + "Z";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-violet-50 to-white">
      {/* Updated Header */}
      <header className="fixed w-full z-10">
        <div className="relative bg-white py-6 px-6 shadow-lg">
          {/* Violet Accent Bar */}
          <div className="absolute top-0 left-0 w-1/3 h-2 bg-violet-500 rounded-b-md"></div>

          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Room Info */}
            <div className="flex items-center gap-4">
              <div className="bg-violet-100 p-3 rounded-full shadow-sm">
                <MdForum className="text-violet-500 text-2xl" />
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">Room</span>
                <h1 className="text-lg font-bold text-gray-800">{roomId}</h1>
              </div>
            </div>

            {/* User Info with Click Toggle */}
            <div className="relative flex items-center gap-4">
              <div
                className="bg-violet-100 p-3 rounded-full shadow-sm cursor-pointer"
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                <MdPerson className="text-violet-500 text-2xl" />
              </div>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white p-4 rounded-lg shadow-xl border border-violet-200 flex flex-col gap-2">
                  <div>
                    <span className="text-sm text-gray-500 font-medium">User</span>
                    <h1 className="text-lg font-bold text-gray-800">{currentUser}</h1>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <MdLogout /> Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main
        ref={chatBoxRef}
        className="pt-24 pb-24 px-4 md:px-8 max-w-6xl mx-auto h-screen overflow-auto scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-violet-50"
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === currentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`my-2 max-w-md rounded-xl shadow-md ${
                  message.sender === currentUser
                    ? "bg-violet-200 text-gray-800"
                    : "bg-white text-gray-800"
                } p-4`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-violet-400 flex items-center justify-center text-white font-bold text-lg">
                      {message.sender.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-violet-600">{message.sender}</p>
                    <p className="text-gray-800">{message.content}</p>
                    <p className="text-xs text-gray-500">{timeAgo(replaceUTCOffset(message.timeStamp))}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Message Input */}
      <div className="fixed bottom-4 w-full px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-2 rounded-lg shadow-lg border border-violet-200">
            <div className="flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                type="text"
                placeholder="Type your message here..."
                className="flex-1 bg-violet-50 text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <div className="flex gap-2 px-2">
                <button className="bg-violet-400 hover:bg-violet-500 h-10 w-10 flex justify-center items-center rounded-lg transition-all duration-300 text-white">
                  <MdAttachFile size={20} />
                </button>
                <button
                  onClick={sendMessage}
                  className="bg-violet-500 hover:bg-violet-600 h-10 w-10 flex justify-center items-center rounded-lg transition-all duration-300 text-white"
                >
                  <MdSend size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;