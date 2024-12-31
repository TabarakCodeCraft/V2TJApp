import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { IoIosSend } from "react-icons/io";
import "./comments.css";

// ChatInput Component
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="chat-input-container flex items-center p-2 bg-white border-t">
      <textarea
        className="chat__box__input flex-grow resize-none px-3 py-2 border rounded"
        rows={1}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        className="ml-2 p-2 bg-primary text-white rounded"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        <IoIosSend />
      </button>
    </div>
  );
};

// ChatMessage Component
const ChatMessage = ({ message, isOwn }) => {
  const messageClass = isOwn
    ? "float-right bg-primary text-white rounded-l-md"
    : "float-left bg-slate-200 dark:bg-darkmode-400 text-slate-500 rounded-r-md";

  return (
    <div
      className={`chat__box__text-box flex items-end ${
        isOwn ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {!isOwn && (
        <div className="w-10 h-10 hidden sm:block flex-none image-fit relative mr-5">
          {/* Avatar placeholder */}
        </div>
      )}

      <div
        className={`px-4 py-3 rounded-t-md min-w-[120px] max-w-[80%] ${messageClass}`}
      >
        <div className="whitespace-pre-wrap break-words min-h-[40px]">
          {message.type === "notification" ? (
            <div className="italic text-sm">{message.body}</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: message.body }} />
          )}
        </div>
        <div
          className={`mt-1 text-xs ${
            isOwn ? "text-white text-opacity-80" : "text-slate-500"
          }`}
        >
          {new Date(message.created_at).toLocaleString()}
        </div>
      </div>

      {isOwn && (
        <div className="w-10 h-10 hidden sm:block flex-none image-fit relative ml-5">
          <img
            alt="User Avatar"
            className="rounded-full"
            src={message.user?.profile_image}
          />
        </div>
      )}
    </div>
  );
};

// Main Comment Component
const Comment = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const chatContainerRef = useRef(null);
  const currentUserId = 7;

  useEffect(() => {
    fetchMessages();
  }, [page]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current && page === 1) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://192.168.69.50:8069/jt_api/ftth_enduser/provision/submission_comments?page=${page}&submission_id=${id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      if (data.status === "success") {
        const newMessages = data.data.map((msg) => ({
          ...msg,
          uniqueKey: `${msg.id}-${msg.created_at}`,
        }));
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        setHasMore(data.current_page < data.last_page);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

// Send message function
const sendMessage = async (messageText) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("submission_id", id);
      formData.append("body", messageText);
  
      const response = await fetch(
        "http://192.168.69.50:8069/jt_api/ftth_enduser/provision/submission_comments_submit",
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        }
      );
  
      if (!response.ok) throw new Error("Failed to send message");
  
      const data = await response.json();
      if (data.status === "success") {
        const newMessage = {
          id: Date.now(),
          body: messageText,
          created_at: new Date().toISOString(),
          user: { id: currentUserId },
          uniqueKey: `temp-${Date.now()}`,
        };
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll every time messages change
  
  // Handle infinite scrolling (load more messages when scrolled to top)
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && !loading && hasMore) {
      setPage((prev) => prev + 1); // Load more messages when at the top
    }
  };
  
  return (
    <div className="class_chat">
      <div className="sticky top-0 bg-white z-10 p-4">
        <h2 className="text-lg font-medium">Comments #{id}</h2>
      </div>
      <div
        ref={chatContainerRef}
        className="chat-messages-container flex-1 overflow-y-auto bg-slate-50 rounded-md p-4"
        onScroll={handleScroll}
      >
        {loading && page === 1 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {[...messages].reverse().map((msg) => (
          <ChatMessage
            key={msg.uniqueKey}
            message={msg}
            isOwn={msg.user?.id === currentUserId}
          />
        ))}
        {loading && page > 1 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
      <ChatInput onSendMessage={sendMessage} isLoading={loading} />
    </div>
  );
};

export default Comment;
