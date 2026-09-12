import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  X,
  Bot,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { callGroqAgent, getStoredGroqKey, setStoredGroqKey } from '../lib/groqAgent';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    allUsers,
    listings,
    pickupRequests,
    addListing,
    negotiatePrice,
    respondToNegotiation,
    updateProcessorPrice,
    refreshData,
  } = useApp();

  const [apiKey, setApiKey] = useState(getStoredGroqKey());
  const [showKeyInput, setShowKeyInput] = useState(!getStoredGroqKey());
  const [queryText, setQueryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenVoiceEnabled, setSpokenVoiceEnabled] = useState(true);

  // Chat message history inside the assistant session
  const [chatLog, setChatLog] = useState<
    Array<{
      sender: 'user' | 'agent';
      text: string;
      language?: string;
      actionSummary?: string;
      time: string;
    }>
  >([
    {
      sender: 'agent',
      text: `Namaste ${currentUser?.full_name || ''}! I am your W2C AgriCarbon AI Voice Assistant. You can speak to me in Hindi, Hinglish, Punjabi, or English. For example: "Mere paas 10 ton parali hai, biochar plant ko becho" or "Offer ko ₹2800 counter karo".`,
      time: 'Just now',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isProcessing]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // recognizes both Hindi & Indian English seamlessly

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setQueryText(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert('Voice input is not supported in this browser. Please type your query in the box.');
        return;
      }
      setQueryText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-speech feedback (Web Speech API)
  const speakOutLoud = (text: string) => {
    if (!spokenVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setStoredGroqKey(apiKey.trim());
    setShowKeyInput(false);
  };

  // Execute autonomous action against Supabase
  const executeAutonomousAction = async (action: any): Promise<string> => {
    if (!action || !action.tool) return '';

    const { tool, parameters } = action;

    if (tool === 'create_listing') {
      const title = `${parameters.quantity || 5} Tons of ${parameters.subcategory || 'Organic Waste'}`;
      const defaultAddr = {
        street_address: currentUser?.street_address || 'Village Farm Center',
        city: currentUser?.city || 'Karnal',
        state: currentUser?.state || 'Haryana',
        pincode: currentUser?.pincode || '132001',
        formatted_address: currentUser?.formatted_address || `${currentUser?.city || 'Karnal'}, India`,
        latitude: currentUser?.latitude || 29.6857,
        longitude: currentUser?.longitude || 76.9905,
      };

      const res = await addListing({
        title,
        waste_category: parameters.category || 'dry_organic',
        waste_subcategory: parameters.subcategory || 'Stubble / Crop Residue',
        quantity: parameters.quantity || 5,
        unit: 'ton',
        expected_ready_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        addressData: defaultAddr,
        processor_id: parameters.processor_id,
      });

      return res.success ? `Created Listing: "${title}" in Supabase!` : `Error: ${res.message}`;
    }

    if (tool === 'counter_offer') {
      const reqId = parameters.request_id || pickupRequests[0]?.id;
      if (!reqId) return 'No active request found to negotiate.';
      const res = await negotiatePrice(
        reqId,
        parameters.counter_price || 2800,
        parameters.note || 'Countered via Voice Assistant'
      );
      return res.message;
    }

    if (tool === 'accept_request') {
      const reqId = parameters.request_id || pickupRequests[0]?.id;
      if (!reqId) return 'No request found to accept.';
      const res = await respondToNegotiation(reqId, true);
      return res.message;
    }

    if (tool === 'update_price') {
      await updateProcessorPrice(parameters.new_price || 2600);
      return `Updated facility buying rate to ₹${parameters.new_price || 2600}/ton!`;
    }

    return '';
  };

  const handleProcessQuery = async (inputStr?: string) => {
    const textToSubmit = (inputStr || queryText).trim();
    if (!textToSubmit) return;

    // Check Groq Key
    if (!getStoredGroqKey() && !apiKey) {
      setShowKeyInput(true);
      return;
    }

    setIsProcessing(true);
    setQueryText('');

    // Append user message
    setChatLog((prev) => [
      ...prev,
      {
        sender: 'user',
        text: textToSubmit,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const response = await callGroqAgent(
        textToSubmit,
        {
          currentUser,
          allUsers,
          listings,
          pickupRequests,
        },
        apiKey
      );

      let actionResultNotice = '';
      if (response.actionTaken && response.actionTaken.tool !== 'query_info') {
        actionResultNotice = await executeAutonomousAction(response.actionTaken);
      }

      // Append agent reply
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: response.spokenResponse,
          language: response.detectedLanguage,
          actionSummary: actionResultNotice || response.actionTaken?.confirmationText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Speak response out loud in audio
      speakOutLoud(response.spokenResponse);
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Error: ${err.message || 'Could not connect to Groq AI. Please check your API key.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      await refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-200/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[700px]">
        {/* Header with White - Golden - Emerald Theme */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg font-black">
              <Sparkles className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">AgriCarbon AI Voice Agent</h3>
                <span className="bg-amber-400/30 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Groq Autonomous
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Speak in Hindi, Hinglish, Punjabi, or English · Instant Supabase Actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpokenVoiceEnabled(!spokenVoiceEnabled)}
              title={spokenVoiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/40 transition"
            >
              {spokenVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Groq API Key Settings"
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-amber-300 border border-amber-400/40 transition"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-rose-600 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Banner / Config */}
        {showKeyInput && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Configure Groq Cloud API Key (LLaMA 3.3 70B Engine)
              </span>
              <button onClick={() => setShowKeyInput(false)} className="text-amber-800 hover:underline">
                Hide
              </button>
            </div>
            <form onSubmit={handleSaveApiKey} className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow transition"
              >
                Save Key
              </button>
            </form>
            <p className="text-[11px] text-amber-800/80">
              Your key is saved locally in browser localStorage and used directly for sub-second responses.
            </p>
          </div>
        )}

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#fcfbf7] to-[#f8f6f0]">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-white border border-amber-200/80 text-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                  <span className="font-bold uppercase tracking-wider">
                    {msg.sender === 'user' ? currentUser?.full_name || 'You' : 'AgriCarbon AI Agent'}
                  </span>
                  <span>{msg.time}</span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.actionSummary && (
                  <div className="mt-2 bg-amber-50 border border-amber-300/80 rounded-xl p-2 text-xs text-amber-950 font-semibold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Action Executed: {msg.actionSummary}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-amber-200 rounded-2xl p-3.5 shadow-sm rounded-tl-none flex items-center gap-2.5 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Processing natural language & executing database action...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Voice Suggestions Pill Bar */}
        <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-amber-800 font-bold shrink-0 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5" /> Try asking:
          </span>
          <button
            onClick={() => handleProcessQuery('Mere paas 8 ton parali hai biochar plant ko bechni hai')}
            className="shrink-0 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full transition"
          >
            "Mere paas 8 ton parali hai" (Hindi)
          </button>
          <button
            onClick={() => handleProcessQuery('Offer ko ₹2800 per ton counter karo')}
            className="shrink-0 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full transition"
          >
            "Offer ko ₹2800 counter karo"
          </button>
          <button
            onClick={() => handleProcessQuery('Mera carbon credit balance aur total waste kitna hai?')}
            className="shrink-0 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full transition"
          >
            "Mera carbon credit balance kitna hai?"
          </button>
        </div>

        {/* Input Controls: Voice Microphone + Text Box */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
          {/* Big Voice Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-md shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-200'
                : 'bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold shadow-amber-200'
            }`}
            title={isListening ? 'Stop Listening' : 'Click to Speak in Any Language'}
          >
            {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-slate-950" />}
          </button>

          {/* Text Input for typing alternative */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessQuery();
            }}
            className="flex-1 flex gap-2"
          >
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice... Speak now'
                  : 'Speak or type query in Hindi / English / Any language...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isProcessing || !queryText.trim()}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
