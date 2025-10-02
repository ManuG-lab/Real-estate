"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface Message {
  sender: "you" | "REA";
  message: string;
}

const ChatDialog = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "you", message: "Hello, how are you?" },
    { sender: "REA", message: "Hello! How can I assist you today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const makeAiInference = async (prompt: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const aiResponse: Message = { sender: "REA", message: text };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Gemini error:", error);
      const aiError: Message = {
        sender: "REA",
        message: "Sorry, I couldn’t process that.",
      };
      setMessages((prev) => [...prev, aiError]);
    } finally {
      setLoading(false);
    }
  };

  const sendPrompt = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMessage: Message = { sender: "you", message: trimmed };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setLoading(true);

    makeAiInference(trimmed);
  };

  return (
    <div className="  w-full  flex">
      <Dialog>
        <DialogTrigger className="fixed bottom-16 right-10">
          <Image
            src="/ai.png"
            alt="chat-icon"
            width={200}
            height={200}
            className="w-20 h-20 animate-pulse  hover:cursor-pointer rounded-full "
          />
          <p className="text-sm text-center max-w-[80px] font-bold">
            Chat with our AI
          </p>
        </DialogTrigger>

        <DialogContent className="max-w-lg w-full h-[80vh] flex flex-col p-0">
          <DialogHeader className="bg-blue-600 rounded-t-lg text-white p-4">
            <DialogTitle className="text-lg">Real Estate Agent</DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                  msg.sender === "you"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-orange-200 text-black"
                }`}
              >
                <p className="font-semibold text-xs opacity-80 mb-1">
                  {msg.sender}
                </p>
                <p>{msg.message}</p>
              </div>
            ))}
            {loading && (
              <p className="text-center text-gray-500 text-xs">
                Please wait ...
              </p>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-200 p-3">
            <Input
              placeholder="Type a message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendPrompt}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatDialog;
