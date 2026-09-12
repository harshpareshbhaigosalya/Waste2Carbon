import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Check,
  ArrowUpDown,
  Camera,
  Maximize2,
  ShieldCheck,
  AlertCircle,
  Truck,
  User,
  Factory,
  CheckCircle2,
  Scale,
  Sparkles,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PickupRequest, NegotiationMessage } from '../types';

interface NegotiationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PickupRequest;
}

export const NegotiationChatModal: React.FC<NegotiationChatModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { currentUser, sendNegotiationMessage, respondToNegotiation, acceptPickupRequest } = useApp();

  const [messageText, setMessageText] = useState('');
  const [counterPrice, setCounterPrice] = useState<number>(
    request.counter_price_per_ton || request.proposed_price_per_ton || 2500
  );
  const [includePriceUpdate, setIncludePriceUpdate] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showPhotoZoom, setShowPhotoZoom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request.negotiation_messages]);

  if (!isOpen) return null;

  const isProducer = currentUser?.id === request.producer_id;
  const isProcessor = currentUser?.id === request.processor_id;

  // Determine if there is a pending proposal awaiting the current user's decision
  const isAwaitingMyResponse =
    (isProducer && request.negotiation_status === 'countered_by_processor') ||
    (isProcessor && request.negotiation_status === 'countered_by_producer');

  const pendingOfferPrice = request.counter_price_per_ton || request.proposed_price_per_ton;

  const messages: NegotiationMessage[] = Array.isArray(request.negotiation_messages) &&
    request.negotiation_messages.length > 0
    ? request.negotiation_messages
    : [
        {
          id: 'init-1',
          sender_id: request.producer_id,
          sender_name: request.producer_name,
          sender_role: 'producer',
          message: `Created waste batch: ${request.listing_title} (${request.quantity_tons} tons). Ready for pickup.`,
          offered_price: request.original_price_per_ton || request.proposed_price_per_ton,
          created_at: request.created_at,
        },
      ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !includePriceUpdate) return;

    setIsSending(true);
    setFeedback('');

    const priceToSend = includePriceUpdate && counterPrice > 0 ? Number(counterPrice) : undefined;
    const textToSend =
      messageText.trim() ||
      `Proposed revised rate: ₹${counterPrice.toLocaleString('en-IN')}/ton.`;

    const res = await sendNegotiationMessage(request.id, textToSend, priceToSend);
    setIsSending(false);

    if (res.success) {
      setMessageText('');
      setFeedback('Message and proposal sent!');
      setTimeout(() => setFeedback(''), 2500);
    } else {
      setFeedback(res.message);
    }
  };

  const handleAccept = async () => {
    setIsSending(true);
    const res = await respondToNegotiation(request.id, true);
    setIsSending(false);
    if (res.success) {
      setFeedback('Offer accepted! Price is locked.');
    }
  };

  const handleDecline = async () => {
    setIsSending(true);
    const res = await respondToNegotiation(request.id, false);
    setIsSending(false);
    if (res.success) {
      setFeedback('Offer declined.');
    }
  };

  // Preset quick adjustments
  const applyPriceDelta = (delta: number) => {
    setCounterPrice((prev) => Math.max(500, prev + delta));
    setIncludePriceUpdate(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-100 bg-gradient-to-r from-emerald-50 via-amber-50 to-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Quality & Price Negotiation
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  request.negotiation_status === 'agreed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : request.negotiation_status === 'rejected'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {request.negotiation_status === 'agreed'
                  ? 'Price Agreed'
                  : request.negotiation_status === 'rejected'
                  ? 'Offer Declined'
                  : 'In Negotiation'}
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-900">{request.listing_title}</h3>
            <p className="text-xs text-slate-500">
              Quantity: <strong>{request.quantity_tons} Tons</strong> · Farmer:{' '}
              <strong>{request.producer_name}</strong> · Buyer: <strong>{request.processor_name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Inspection Photo Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          {request.listing_photo_url ? (
            <div className="relative group shrink-0">
              <img
                src={request.listing_photo_url}
                alt="Waste Quality Inspection"
                className="w-28 h-24 sm:w-32 sm:h-24 object-cover rounded-2xl border-2 border-amber-300 shadow-sm cursor-pointer group-hover:opacity-90 transition"
                onClick={() => setShowPhotoZoom(true)}
              />
              <button
                type="button"
                onClick={() => setShowPhotoZoom(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold gap-1 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom</span>
              </button>
            </div>
          ) : (
            <div className="w-28 h-24 sm:w-32 sm:h-24 rounded-2xl bg-amber-100/60 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-amber-800 shrink-0 text-center p-2">
              <Camera className="w-6 h-6 opacity-40 mb-1" />
              <span className="text-[10px] font-bold">No Photo Attached</span>
            </div>
          )}

          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Quality Grade:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  request.quality_grade?.includes('Grade A')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : request.quality_grade?.includes('Grade C')
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-sky-100 text-sky-800 border border-sky-300'
                }`}
              >
                {request.quality_grade || 'Grade B (Standard)'}
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isProcessor ? (
                <span>
                  Inspect the photo above to verify moisture and impurities. If quality is substandard,
                  propose a lower buying rate below with your explanation.
                </span>
              ) : (
                <span>
                  Your waste photo is displayed to the buyer plant. You can defend your pricing or negotiate
                  a mutually profitable rate here.
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-700">
              <span>
                Current Agreed Rate:{' '}
                <strong className="text-emerald-700 font-black text-sm">
                  ₹{request.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                </strong>
              </span>
              <span>·</span>
              <span>
                Total Batch Value:{' '}
                <strong className="text-amber-800 font-bold">
                  ₹{Math.round(request.proposed_price_per_ton * request.quantity_tons).toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Banner if a Counter-Offer is awaiting current user decision */}
        {isAwaitingMyResponse && request.status === 'pending' && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-3 border-b border-amber-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-5 h-5 text-slate-950 shrink-0" />
              <div>
                <p className="font-black text-sm">
                  {isProducer ? 'Buyer Plant Proposed:' : 'Farmer Asked For:'} ₹
                  {pendingOfferPrice.toLocaleString('en-IN')}/ton
                </p>
                <p className="text-[11px] font-semibold text-slate-900">
                  Total for {request.quantity_tons} tons: ₹
                  {Math.round(pendingOfferPrice * request.quantity_tons).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isSending}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Accept Offer (₹{pendingOfferPrice.toLocaleString('en-IN')}/t)</span>
              </button>

              <button
                type="button"
                onClick={handleDecline}
                disabled={isSending}
                className="bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Message Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#fcfbf7]/60">
          {messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUser?.id;
            const isMsgProducer = msg.sender_role === 'producer';

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Sender tag */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1 px-1">
                  {isMsgProducer ? (
                    <User className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <Factory className="w-3 h-3 text-amber-700" />
                  )}
                  <span className="font-bold text-slate-700">{msg.sender_name}</span>
                  <span className="opacity-70">
                    ({isMsgProducer ? 'Farmer / Producer' : 'Processing Plant'})
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-3.5 space-y-1.5 shadow-xs text-xs sm:text-sm ${
                    isMe
                      ? 'bg-gradient-to-tr from-emerald-800 to-emerald-700 text-white rounded-br-xs'
                      : isMsgProducer
                      ? 'bg-white border border-emerald-200 text-slate-800 rounded-bl-xs'
                      : 'bg-white border border-amber-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Price Tag if offer made */}
                  {msg.offered_price && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black mb-1 ${
                        isMe
                          ? 'bg-emerald-950/40 text-amber-300 border border-emerald-600'
                          : 'bg-amber-100 text-amber-950 border border-amber-300'
                      }`}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Offer: ₹{msg.offered_price.toLocaleString('en-IN')} / Ton</span>
                      <span className="text-[10px] font-normal opacity-80">
                        (₹{Math.round(msg.offered_price * request.quantity_tons).toLocaleString('en-IN')} total)
                      </span>
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                  <div className={`text-[9px] pt-1 ${isMe ? 'text-emerald-200' : 'text-slate-400'} text-right`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Feedback / notification toast */}
        {feedback && (
          <div className="bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs px-4 py-2 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Counter-Offer & Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white space-y-3">
          {/* Quick Price Adjustments & Input */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={includePriceUpdate}
                  onChange={(e) => setIncludePriceUpdate(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Attach Counter Offer:</span>
              </label>

              {includePriceUpdate && (
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 font-bold text-amber-700 text-xs">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="20000"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-28 pl-6 pr-2 py-1 bg-slate-50 border border-amber-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500 ml-1">/ton</span>
                </div>
              )}
            </div>

            {/* Quick adjust chips */}
            {includePriceUpdate && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyPriceDelta(-200)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  -₹200 (Moisture)
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(-100)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  -₹100
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(100)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  +₹100
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(200)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition"
                >
                  +₹200 (Pure)
                </button>
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                isProcessor
                  ? 'e.g., Photo shows high moisture, we offer ₹1,900/t to cover drying costs...'
                  : 'e.g., The straw has been baled and dried under shed, lowest acceptable is ₹2,700/t...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />

            <button
              type="submit"
              disabled={isSending || (!messageText.trim() && !includePriceUpdate)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition disabled:opacity-40 flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Full Photo Zoom Lightbox Modal */}
      {showPhotoZoom && request.listing_photo_url && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPhotoZoom(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={request.listing_photo_url}
              alt="Full Quality Inspection"
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border-2 border-white/20"
            />
            <p className="text-white text-xs mt-3 bg-black/50 px-4 py-1.5 rounded-full">
              Quality Inspection Photo · Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
