import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Zara, the professional AI Voice Assistant for SAYANJALI NEXUS PRIVATE LIMITED.

Your role is to answer incoming calls, assist customers, qualify leads, schedule appointments, provide customer support, take orders, and collect accurate information for follow-up.

PERSONALITY
- Professional, polite, confident, and friendly.
- Speak naturally like a human assistant.
- Keep responses concise and conversational (2-4 sentences max per reply).
- Be patient and helpful.
- Never sound robotic.
- Always maintain a positive and solution-oriented attitude.

COMPANY INFORMATION
Company Name: SAYANJALI NEXUS PRIVATE LIMITED

Services:
- Custom Software Development, Mobile App Development, Website Development
- AI Automation Solutions, AI Chatbots, WhatsApp Automation
- CRM & ERP Solutions, Hospital Management Software, SaaS Platform Development
- Blockchain & Web3 Solutions, Cybersecurity Services
- Digital Transformation Consulting, Business Automation Solutions
- Startup Technology Consulting

PRIMARY RESPONSIBILITIES
1. Incoming Call Handling
2. Appointment Booking
3. Lead Qualification
4. Customer Support
5. Order Taking
6. Message Taking
7. Follow-up Scheduling
8. Escalation to Human Team

INTENT DETECTION - Determine the caller's purpose:
A. Appointment Booking, B. New Business Inquiry, C. Customer Support, D. Product Information
E. Order Placement, F. Billing Question, G. Complaint, H. Technical Support
I. Partnership Inquiry, J. General Information

APPOINTMENT BOOKING WORKFLOW - Collect: Full Name, Company Name, Phone Number, Email Address, Service Interested In, Preferred Date, Preferred Time, Brief Requirement. Confirm and say appointment is recorded.

LEAD QUALIFICATION WORKFLOW - Ask:
1. What service are you interested in?
2. Are you an individual, startup, or company?
3. What problem are you looking to solve?
4. Budget range?
5. Expected project timeline?
Classify as Hot Lead (ready to buy, budget approved, <30 days), Warm Lead (interested, evaluating), or Cold Lead (research stage).

CUSTOMER SUPPORT - Listen, identify issue type, provide information, escalate if needed.

OBJECTION HANDLING:
- "It's expensive" → Offer tailored solutions, ask about budget.
- "I need time to think" → Offer follow-up call scheduling.

TRANSFER RULES - Transfer immediately for: human agent requests, legal matters, financial disputes, serious complaints, VIP/enterprise clients.

VOICE RULES
- Ask ONE question at a time.
- Confirm important information.
- Use simple language.
- Keep conversations efficient.
- Never argue.

Always open with: "Hello, thank you for calling SAYANJALI NEXUS PRIVATE LIMITED. This is Zara, your virtual assistant. How may I assist you today?"

End with: "Thank you for contacting SAYANJALI NEXUS PRIVATE LIMITED. We appreciate your time. Have a wonderful day."

Keep all responses SHORT (2-4 sentences). Be natural and conversational. Collect data step by step — one question at a time.`;

const AVATAR_STATES = {
  idle: { color: "#00d4ff", pulse: false },
  listening: { color: "#7c3aed", pulse: true },
  thinking: { color: "#f59e0b", pulse: true },
  speaking: { color: "#10b981", pulse: true },
};

const formatTime = () => {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ZaraAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentState, setAgentState] = useState("idle");
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [waveform, setWaveform] = useState(Array(20).fill(4));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  useEffect(() => {
    if (agentState === "speaking" || agentState === "listening") {
      waveRef.current = setInterval(() => {
        setWaveform(Array(20).fill(0).map(() => Math.random() * 28 + 4));
      }, 80);
    } else {
      clearInterval(waveRef.current);
      setWaveform(Array(20).fill(4));
    }
    return () => clearInterval(waveRef.current);
  }, [agentState]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const startCall = async () => {
    setCallActive(true);
    setAgentState("speaking");
    setMessages([]);
    const greeting = "Hello, thank you for calling SAYANJALI NEXUS PRIVATE LIMITED. This is Zara, your virtual assistant. How may I assist you today?";
    setMessages([{ role: "assistant", content: greeting, time: formatTime() }]);
    setTimeout(() => setAgentState("idle"), 2000);
  };

  const endCall = () => {
    setCallActive(false);
    setAgentState("idle");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Thank you for contacting SAYANJALI NEXUS PRIVATE LIMITED. We appreciate your time. Have a wonderful day.",
        time: formatTime(),
        isEnd: true,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !callActive) return;
    const userMsg = { role: "user", content: input.trim(), time: formatTime() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setAgentState("thinking");

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I apologize, I encountered an issue. Please try again.";
      setAgentState("speaking");
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: reply, time: formatTime() }]);
        setAgentState("idle");
      }, 400);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again.", time: formatTime() },
      ]);
      setAgentState("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stateColor = AVATAR_STATES[agentState].color;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f1a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .msg-enter { animation: fadeSlide 0.3s ease forwards; }
        .pulse-ring {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .pulse-ring-2 {
          animation-delay: 0.5s;
        }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .dot { animation: dot-bounce 1.2s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        textarea:focus { outline: none; }
        button { cursor: pointer; }
        .glow-btn:hover { filter: brightness(1.15); transform: scale(1.03); }
        .glow-btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        {/* Scanline effect */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
          borderRadius: "24px", zIndex: 0,
        }}>
          <div style={{
            position: "absolute", width: "100%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.06), transparent)",
            animation: "scanline 4s linear infinite",
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          background: "linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }} className="float-anim">
              {(agentState === "speaking" || agentState === "thinking" || agentState === "listening") && (
                <>
                  <div className="pulse-ring" style={{ color: stateColor }} />
                  <div className="pulse-ring pulse-ring-2" style={{ color: stateColor }} />
                </>
              )}
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${stateColor}33, #1a1a2e)`,
                border: `2px solid ${stateColor}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
                boxShadow: `0 0 20px ${stateColor}33`,
                transition: "all 0.4s ease",
              }}>
                🤖
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, fontSize: "18px",
                  color: "#ffffff", letterSpacing: "-0.3px",
                }}>Zara</span>
                <span style={{
                  fontSize: "10px", fontWeight: 600,
                  background: `linear-gradient(135deg, ${stateColor}22, ${stateColor}44)`,
                  color: stateColor, border: `1px solid ${stateColor}44`,
                  padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.5px",
                  textTransform: "uppercase", transition: "all 0.3s",
                }}>
                  {agentState === "idle" ? "Ready" : agentState === "thinking" ? "Processing" : agentState === "speaking" ? "Speaking" : "Listening"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px", letterSpacing: "0.2px" }}>
                SAYANJALI NEXUS PRIVATE LIMITED
              </div>
            </div>

            {callActive && (
              <div style={{
                fontSize: "12px", color: "#10b981", fontWeight: 600,
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                padding: "4px 10px", borderRadius: "8px", letterSpacing: "0.5px",
              }}>
                ● {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Waveform */}
        {callActive && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "3px", padding: "10px 24px 0", height: "40px",
          }}>
            {waveform.map((h, i) => (
              <div key={i} style={{
                width: "3px", height: `${h}px`,
                borderRadius: "2px",
                background: agentState === "speaking"
                  ? `rgba(16,185,129,${0.4 + h / 50})`
                  : agentState === "thinking"
                  ? `rgba(245,158,11,${0.4 + h / 50})`
                  : `rgba(0,212,255,${0.2 + h / 60})`,
                transition: "height 0.08s ease, background 0.3s",
              }} />
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{
          height: "360px", overflowY: "auto",
          padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: "12px",
          position: "relative", zIndex: 1,
        }}>
          {!callActive && messages.length === 0 && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "42px" }}>📞</div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: 500 }}>
                  Connect with Zara
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "4px" }}>
                  AI-powered voice assistant for<br />SAYANJALI NEXUS PRIVATE LIMITED
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", marginTop: "4px" }}>
                {["Software Dev", "AI Solutions", "Cybersecurity", "CRM/ERP"].map((s) => (
                  <span key={s} style={{
                    fontSize: "10px", color: "rgba(0,212,255,0.7)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    padding: "3px 10px", borderRadius: "20px",
                    background: "rgba(0,212,255,0.04)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="msg-enter" style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "8px", alignItems: "flex-end",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #00d4ff22, #1a1a2e)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", flexShrink: 0,
                }}>🤖</div>
              )}
              <div style={{ maxWidth: "78%" }}>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                    : msg.isEnd
                    ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))"
                    : "rgba(255,255,255,0.06)",
                  border: msg.role === "user"
                    ? "none"
                    : msg.isEnd
                    ? "1px solid rgba(16,185,129,0.2)"
                    : "1px solid rgba(255,255,255,0.08)",
                  fontSize: "13px", lineHeight: "1.55",
                  color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.85)",
                  wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
                <div style={{
                  fontSize: "10px", color: "rgba(255,255,255,0.25)",
                  marginTop: "3px", textAlign: msg.role === "user" ? "right" : "left",
                  paddingLeft: msg.role === "assistant" ? "4px" : "0",
                  paddingRight: msg.role === "user" ? "4px" : "0",
                }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-enter" style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b22, #1a1a2e)",
                border: "1px solid rgba(245,158,11,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px",
              }}>🤖</div>
              <div style={{
                padding: "12px 16px",
                borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", gap: "4px", alignItems: "center",
              }}>
                <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
                <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
                <div className="dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          position: "relative", zIndex: 1,
        }}>
          {!callActive ? (
            <button
              onClick={startCall}
              className="glow-btn"
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #00d4ff, #0099bb)",
                border: "none", borderRadius: "14px",
                color: "#000", fontWeight: 700, fontSize: "14px",
                letterSpacing: "0.5px", fontFamily: "'Syne', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 8px 24px rgba(0,212,255,0.3)",
              }}>
              📞 Start Call
