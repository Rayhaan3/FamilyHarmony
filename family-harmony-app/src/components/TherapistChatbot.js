import React, { useState, useRef, useEffect } from 'react';

const palette = {
  bg: '#FFFAF5',
  yellow: '#FFF0A0',
  yellowLight: '#FFFBE0',
  yellowDark: '#F0C800',
  pink: '#FFD6E0',
  pinkLight: '#FFE8EF',
  pinkDark: '#D4688A',
  rose: '#FFB3C6',
  card: '#FFFFFF',
  text: '#2D1B26',
  textMuted: '#B08090',
  border: '#FAE0E8',
  accent: '#FF9AB5',
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: palette.bg,
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'fixed',
    top: '-100px',
    right: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #FFFBE0 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  blob2: {
    position: 'fixed',
    bottom: '-120px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #FFE8EF 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '760px',
    margin: '0 auto',
    padding: '40px 24px 60px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#FFE8EF',
    color: '#D4688A',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '4px 14px',
    borderRadius: '100px',
    marginBottom: '12px',
  },
  title: {
    fontSize: 'clamp(32px, 6vw, 48px)',
    fontWeight: '700',
    color: palette.text,
    margin: '0 0 8px',
    lineHeight: 1.1,
    fontFamily: "Georgia, serif",
  },
  subtitle: {
    fontSize: '15px',
    color: palette.textMuted,
    margin: '0 0 32px',
  },
  chatContainer: {
    backgroundColor: palette.card,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: `1px solid ${palette.border}`,
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
    paddingRight: '8px',
    minHeight: '400px',
  },
  message: {
    marginBottom: '14px',
    display: 'flex',
    gap: '10px',
    animation: 'slideIn 0.3s ease',
  },
  therapistMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1.5px solid ${palette.border}`,
    borderRadius: '12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    outline: 'none',
  },
  controlButton: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    height: '44px',
  },
  sendButton: {
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#FFB3C6',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#FFFBE080',
    borderRadius: '12px',
    border: `1px solid ${palette.border}`,
  },
  toolbarButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1.5px solid ${palette.border}`,
    backgroundColor: palette.card,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  iconButton: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  videoContainer: {
    backgroundColor: palette.card,
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: `1px solid ${palette.border}`,
    textAlign: 'center',
  },
};

export default function TherapistChatbot({ goBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 💙 I'm here to listen and support you. You can type, use voice input (🎙️), enable video (📷), or enable audio responses (🔊). What's on your mind today?",
      sender: 'therapist',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setVideoActive(true);
      }
    } catch (err) {
      console.error('Video access denied:', err);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setVideoActive(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/therapist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const therapistMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: 'therapist',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, therapistMessage]);
      if (audioEnabled) {
        speakResponse(data.response);
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm having trouble connecting. Please try again in a moment. 💙",
        sender: 'therapist',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.inner}>
        <div style={styles.badge}>Therapy Support</div>
        <h1 style={styles.title}>Talk to Your Therapist 💚</h1>
        <p style={styles.subtitle}>A safe space to share your feelings and get support</p>

        {/* Video Container */}
        {videoActive && (
          <div style={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: '16px',
                backgroundColor: '#000',
              }}
            />
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={stopVideo}
                style={{
                  ...styles.toolbarButton,
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  border: 'none',
                }}
              >
                ✕ Stop Video
              </button>
            </div>
          </div>
        )}

        {/* Control Toolbar */}
        <div style={styles.toolbarContainer}>
          <button
            onClick={videoActive ? stopVideo : startVideo}
            style={{
              ...styles.toolbarButton,
              backgroundColor: videoActive ? '#FFE8EF' : palette.card,
              borderColor: videoActive ? '#FFB3C6' : palette.border,
            }}
            title={videoActive ? 'Stop video' : 'Start video'}
          >
            {videoActive ? '📹 Video On' : '📷 Enable Video'}
          </button>

          <button
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            style={{
              ...styles.toolbarButton,
              backgroundColor: isRecording ? '#FFE8EF' : palette.card,
              borderColor: isRecording ? '#FFB3C6' : palette.border,
            }}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
            disabled={loading}
          >
            {isRecording ? '🎤 Recording...' : '🎙️ Voice'}
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              ...styles.toolbarButton,
              backgroundColor: audioEnabled ? '#FFE8EF' : palette.card,
              borderColor: audioEnabled ? '#FFB3C6' : palette.border,
            }}
            title={audioEnabled ? 'Disable audio responses' : 'Enable audio responses'}
          >
            {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isRecording && <div style={{ ...styles.statusBadge, backgroundColor: '#FFE8EF', color: '#D4688A' }}>🎙️ Listening...</div>}
            {videoActive && <div style={{ ...styles.statusBadge, backgroundColor: '#E0FAF8', color: '#4ECDC4' }}>📹 Recording</div>}
          </div>
        </div>

        <div style={styles.chatContainer}>
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            ${styles.messagesArea.messageAreaScroll || ''} ::-webkit-scrollbar {
              width: 6px;
            }
            ${styles.messagesArea.messageAreaScroll || ''} ::-webkit-scrollbar-track {
              background: #f1f1f1;
              borderRadius: 10px;
            }
            ${styles.messagesArea.messageAreaScroll || ''} ::-webkit-scrollbar-thumb {
              background: #D4688A;
              borderRadius: 10px;
            }
          `}</style>
          <div style={styles.messagesArea}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  ...styles.message,
                  ...(message.sender === 'therapist' ? styles.therapistMessage : styles.userMessage),
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: message.sender === 'therapist' ? palette.pinkLight : palette.yellowLight,
                    color: palette.text,
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{...styles.message, ...styles.therapistMessage}}>
                <div style={{...styles.messageBubble, backgroundColor: palette.pinkLight}}>
                  <span style={{display: 'inline-block', animation: 'pulse 1.5s infinite'}}>
                    💭 Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSendMessage();
                }
              }}
              placeholder={isRecording ? "Listening to you..." : "Share what's on your mind..."}
              style={{
                ...styles.input,
                opacity: loading ? 0.6 : 1,
                borderColor: isRecording ? palette.accent : palette.border,
              }}
              disabled={loading}
            />
            
            <button
              onClick={isRecording ? stopVoiceInput : startVoiceInput}
              disabled={loading}
              style={{
                ...styles.controlButton,
                backgroundColor: isRecording ? palette.rose : palette.pinkLight,
                color: isRecording ? '#fff' : palette.text,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              title={isRecording ? 'Stop voice input' : 'Start voice input'}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              style={{
                ...styles.sendButton,
                opacity: loading || !input.trim() ? 0.6 : 1,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? '✨' : '📤'} Send
            </button>
          </div>
        </div>

        <div style={{backgroundColor: '#FFF0F0', borderRadius: '16px', padding: '16px', marginBottom: '22px', border: `1px solid ${palette.border}`}}>
          <p style={{fontSize: '13px', color: palette.textMuted, margin: 0, lineHeight: 1.5}}>
            💙 <strong>Note:</strong> This AI therapist is here for support and discussion. For serious mental health concerns, please consult a licensed professional.
          </p>
        </div>

        <button
          onClick={goBack}
          style={{
            padding: '12px 26px',
            backgroundColor: palette.yellowLight,
            color: palette.text,
            border: `1.5px solid ${palette.border}`,
            borderRadius: '13px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.yellow)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.yellowLight)}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
