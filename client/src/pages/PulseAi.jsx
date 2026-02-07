import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/api";

// 🖼️ PulseAI mascot images (PNG)
import pulseAiNormal from "../assets/pulseai-normal.png";
import pulseAiSad from "../assets/pulseai-sad.png";
import pulseAiShock from "../assets/pulseai-shock.png";
import pulseAiTip from "../assets/pulseai-tip.png";

// ✅ PulseAI page background
import pulseAiBg from "../assets/pulseai-bg.jpg";

function pickMascot(type) {
  if (type === "sad") return pulseAiSad;
  if (type === "shock") return pulseAiShock;
  if (type === "tip") return pulseAiTip;
  return pulseAiNormal;
}

export default function PulseAi() {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I’m PulseAI 🤍\nTell me what you ate today in simple words (example: “2 rotis and paneer”).\nI’ll log it for you.",
      mood: "tip",
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    try {
      setSending(true);

      const res = await api.post("/api/ai/chat", {
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.reply || "Okay 👍",
          mood: res.data.mood || "normal",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn’t process that right now 😅 Try again.",
          mood: "sad",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentMood = messages[messages.length - 1]?.mood || "normal";

  return (
    <Layout>
      <div className="relative w-full min-h-[calc(100vh-80px)]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${pulseAiBg})`,
            backgroundRepeat: "repeat",
            backgroundSize: "700px",
            backgroundPosition: "top left",
          }}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit flex-col gap-1 rounded-2xl border border-white/15 bg-black/35 px-5 py-3 backdrop-blur-md shadow-lg">
              <h2 className="text-2xl font-bold text-white">PulseAI</h2>
              <p className="text-sm text-white/80">
                Log food & update profile using chat
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
              {/* CHAT BOX */}
              <div className="rounded-2xl border border-white/10 bg-black shadow-sm overflow-hidden">
                <div className="border-b border-white/10 bg-black px-4 py-3">
                  <div className="font-semibold text-white">Chat</div>
                  <div className="text-xs text-white/60">
                    Examples: “I ate 2 eggs”, “log 1 banana”, “my weight is 72kg”
                  </div>
                </div>

                <div className="h-[60vh] overflow-auto px-4 py-4 space-y-3">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap " +
                        (m.role === "user"
                          ? "ml-auto bg-pulse-navy text-white"
                          : "mr-auto bg-white/10 border border-white/10 text-white")
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-white/10 bg-black px-4 py-3">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Type here..."
                      className="flex-1 resize-none rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-pulse-blue/40"
                      rows={2}
                    />
                    <button
                      disabled={sending}
                      onClick={sendMessage}
                      className="rounded-xl bg-pulse-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>

              {/* MASCOT */}
              <div className="relative flex flex-col items-center justify-center">
                {/* ✨ Glow / focus halo */}
                <div className="absolute w-44 h-44 rounded-full bg-pulse-blue/20 blur-2xl" />

                <img
                  src={pickMascot(currentMood)}
                  alt="PulseAI"
                  className="w-52 h-52 object-contain relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
