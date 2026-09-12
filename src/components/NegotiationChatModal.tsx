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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C1E21]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E1D7] bg-[#FAF8F5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4EDE2] text-[#9A6A15] border border-[#E7E1D7]">
                Feedstock Negotiation
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  request.negotiation_status === 'agreed'
                    ? 'bg-[#FAF8F5] text-[#2D5A43] border border-[#2D5A43]/40'
                    : request.negotiation_status === 'rejected'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-[#F4EDE2] text-[#9A6A15] border border-[#D4A34F]'
                }`}
              >
                {request.negotiation_status === 'agreed'
                  ? 'Price Agreed'
                  : request.negotiation_status === 'rejected'
                  ? 'Offer Declined'
                  : 'In Negotiation'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1C1E21]">{request.listing_title}</h3>
            <p className="text-xs text-[#828892]">
              Payload: <strong className="text-[#1C1E21] font-mono">{request.quantity_tons} Tons</strong> · Seller:{' '}
              <strong className="text-[#1C1E21]">{request.producer_name}</strong> · Facility: <strong className="text-[#1C1E21]">{request.processor_name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#828892] hover:text-[#1C1E21] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Inspection Photo Card */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E7E1D7] flex flex-col sm:flex-row items-center gap-4">
          {request.listing_photo_url ? (
            <div className="relative group shrink-0">
              <img
                src={request.listing_photo_url}
                alt="Waste Quality Inspection"
                className="w-28 h-24 sm:w-32 sm:h-24 object-cover rounded-2xl border border-[#E7E1D7] shadow-xs cursor-pointer group-hover:opacity-95 transition"
                onClick={() => setShowPhotoZoom(true)}
              />
              <button
                type="button"
                onClick={() => setShowPhotoZoom(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold gap-1 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Zoom</span>
              </button>
            </div>
          ) : (
            <div className="w-28 h-24 sm:w-32 sm:h-24 rounded-2xl bg-[#F4EDE2] border border-dashed border-[#D4A34F] flex flex-col items-center justify-center text-[#9A6A15] shrink-0 text-center p-2">
              <Camera className="w-6 h-6 opacity-60 mb-1" />
              <span className="text-[10px] font-bold">No Photo Attached</span>
            </div>
          )}

          <div className="flex-1 space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#1C1E21]">Verified Quality Grade:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  request.quality_grade?.includes('Grade A')
                    ? 'bg-[#FAF8F5] text-[#2D5A43] border border-[#2D5A43]/40'
                    : request.quality_grade?.includes('Grade C')
                    ? 'bg-[#F4EDE2] text-[#9A6A15] border border-[#D4A34F]'
                    : 'bg-[#FAF8F5] text-[#1C1E21] border border-[#E7E1D7]'
                }`}
              >
                {request.quality_grade || 'Grade B (Standard Commercial)'}
              </span>
            </div>

            <p className="text-[#828892] text-[11px] leading-relaxed">
              {isProcessor ? (
                <span>
                  Inspect the physical batch photograph above. If moisture or foreign material warrants a rate revision,
                  propose a transparent counter-offer with your rationale.
                </span>
              ) : (
                <span>
                  Your batch photo provides visual proof to the industrial buyer. You can clarify storage condition
                  or counter with your minimum feasible price.
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[#1C1E21]">
              <span>
                Baseline Offer:{' '}
                <strong className="text-[#2D5A43] font-mono font-bold text-sm">
                  ₹{request.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                </strong>
              </span>
              <span className="text-[#E7E1D7]">·</span>
              <span>
                Batch Total:{' '}
                <strong className="text-[#9A6A15] font-mono font-bold">
                  ₹{Math.round(request.proposed_price_per_ton * request.quantity_tons).toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Banner if a Counter-Offer is awaiting current user decision */}
        {isAwaitingMyResponse && request.status === 'pending' && (
          <div className="bg-[#F4EDE2] text-[#1C1E21] px-5 py-3.5 border-b border-[#D4A34F] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs">
              <ArrowUpDown className="w-5 h-5 text-[#9A6A15] shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {isProducer ? 'Processing Plant Countered:' : 'Producer Requested:'}{' '}
                  <span className="font-mono text-[#2D5A43]">₹{pendingOfferPrice.toLocaleString('en-IN')}/ton</span>
                </p>
                <p className="text-[11px] text-[#828892]">
                  Total value for {request.quantity_tons} tons: ₹
                  {Math.round(pendingOfferPrice * request.quantity_tons).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAccept}
                disabled={isSending}
                className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Accept Rate (₹{pendingOfferPrice.toLocaleString('en-IN')}/t)</span>
              </button>

              <button
                type="button"
                onClick={handleDecline}
                disabled={isSending}
                className="bg-[#FFFFFF] hover:bg-rose-50 text-rose-700 border border-[#E7E1D7] font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Message Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#FAF8F5]/60">
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
                <div className="flex items-center gap-1 text-[10px] text-[#828892] mb-1 px-1">
                  {isMsgProducer ? (
                    <User className="w-3 h-3 text-[#2D5A43]" />
                  ) : (
                    <Factory className="w-3 h-3 text-[#9A6A15]" />
                  )}
                  <span className="font-bold text-[#1C1E21]">{msg.sender_name}</span>
                  <span className="opacity-75">
                    ({isMsgProducer ? 'Waste Producer' : 'Conversion Facility'})
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-3.5 space-y-1.5 shadow-xs text-xs sm:text-sm ${
                    isMe
                      ? 'bg-[#2D5A43] text-white rounded-br-xs'
                      : 'bg-[#FFFFFF] border border-[#E7E1D7] text-[#1C1E21] rounded-bl-xs'
                  }`}
                >
                  {/* Price Tag if offer made */}
                  {msg.offered_price && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black mb-1 font-mono ${
                        isMe
                          ? 'bg-black/20 text-[#D4A34F] border border-white/20'
                          : 'bg-[#F4EDE2] text-[#9A6A15] border border-[#D4A34F]'
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

                  <div className={`text-[9px] pt-1 ${isMe ? 'text-emerald-100' : 'text-[#828892]'} text-right`}>
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
          <div className="bg-[#FAF8F5] border-t border-[#E7E1D7] text-[#2D5A43] text-xs px-4 py-2.5 flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Counter-Offer & Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E7E1D7] bg-[#FFFFFF] space-y-3">
          {/* Quick Price Adjustments & Input */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-bold text-[#1C1E21] flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePriceUpdate}
                  onChange={(e) => setIncludePriceUpdate(e.target.checked)}
                  className="rounded text-[#2D5A43] focus:ring-[#2D5A43]"
                />
                <span>Attach Counter Offer:</span>
              </label>

              {includePriceUpdate && (
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 font-bold text-[#9A6A15] text-xs">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="20000"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-28 pl-6 pr-2 py-1 bg-[#FAF8F5] border border-[#E7E1D7] rounded-lg text-xs font-mono font-bold text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                  />
                  <span className="text-[10px] text-[#828892] ml-1">/ton</span>
                </div>
              )}
            </div>

            {/* Quick adjust chips */}
            {includePriceUpdate && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyPriceDelta(-200)}
                  className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4EDE2] text-[#828892] hover:text-[#1C1E21] border border-[#E7E1D7] text-[10px] font-medium transition cursor-pointer"
                >
                  -₹200 (Moisture)
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(-100)}
                  className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4EDE2] text-[#828892] hover:text-[#1C1E21] border border-[#E7E1D7] text-[10px] font-medium transition cursor-pointer"
                >
                  -₹100
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(100)}
                  className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4EDE2] text-[#828892] hover:text-[#1C1E21] border border-[#E7E1D7] text-[10px] font-medium transition cursor-pointer"
                >
                  +₹100
                </button>
                <button
                  type="button"
                  onClick={() => applyPriceDelta(200)}
                  className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#F4EDE2] text-[#828892] hover:text-[#1C1E21] border border-[#E7E1D7] text-[10px] font-medium transition cursor-pointer"
                >
                  +₹200 (Pure / Dry)
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
                  ? 'e.g., Photo shows high moisture, proposing ₹1,900/t to factor drying costs...'
                  : 'e.g., Stubble is baled and covered under shed, lowest acceptable is ₹2,700/t...'
              }
              className="flex-1 bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={isSending || (!messageText.trim() && !includePriceUpdate)}
              className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold px-5 py-2.5 rounded-2xl shadow-xs transition disabled:opacity-40 flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
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
