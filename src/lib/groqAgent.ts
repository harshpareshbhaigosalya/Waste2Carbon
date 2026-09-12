// Groq Agentic AI Service
// Handles multilingual natural speech/text understanding and executes direct autonomous tool calls against Supabase

export interface AgentAction {
  tool: 'create_listing' | 'accept_request' | 'counter_offer' | 'update_price' | 'verify_facility' | 'query_info';
  parameters: Record<string, any>;
  confirmationText: string;
}

export interface AgentResponse {
  spokenResponse: string;
  detectedLanguage?: string;
  actionTaken?: AgentAction;
  executedResult?: {
    success: boolean;
    message: string;
    data?: any;
  };
}

// User-provided Groq API Key hardcoded as reliable fallback
const DEFAULT_GROQ_KEY = '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';
const GROQ_STORAGE_KEY = 'w2c_groq_api_key';

export const getStoredGroqKey = (): string => {
  return (
    localStorage.getItem(GROQ_STORAGE_KEY) ||
    (import.meta as any).env?.VITE_GROQ_API_KEY ||
    DEFAULT_GROQ_KEY
  );
};

export const setStoredGroqKey = (key: string) => {
  localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
};

export const callGroqAgent = async (
  userInput: string,
  contextData: {
    currentUser: any;
    allUsers: any[];
    listings: any[];
    pickupRequests: any[];
  },
  apiKeyOverride?: string
): Promise<AgentResponse> => {
  const apiKey = apiKeyOverride || getStoredGroqKey() || DEFAULT_GROQ_KEY;

  // STRICT, GROUNDED, ANTI-HALLUCINATION SYSTEM PROMPT:
  // 1. Strict boundaries to prevent hallucination.
  // 2. Speaks simple, plain words (village & everyday conversational level).
  // 3. Responds directly without verbose jargon.
  const systemPrompt = `You are "AgriCarbon AI", the simple, helpful assistant for the W2C (Waste to Carbon) platform in India.

RULES TO PREVENT HALLUCINATIONS AND CONFUSION:
1. ONLY talk about facts given in the context below. DO NOT invent fake data, numbers, or facilities.
2. KEEP REPLIES SHORT, BASIC, AND GROUNDED. No long lectures. Maximum 2 to 3 sentences in spoken reply.
3. UNDERSTAND AND REPLY IN THE EXACT SAME LANGUAGE/DIALECT the user speaks (Hindi, Hinglish, Punjabi, or plain English).
4. For simple village farmers: Use everyday words like "Parali", "Gobar", "Trolley", "Khata", "Rupaye", "Paise".
5. IF AN ACTION IS REQUESTED, extract exact numbers from the user's message and select the right tool.

Current Logged In User:
- Name: ${contextData.currentUser?.full_name || 'User'}
- Role: ${contextData.currentUser?.role || 'producer'} (farmer/seller or processor/plant)
- Location: ${contextData.currentUser?.formatted_address || contextData.currentUser?.city || 'India'}
- Carbon Credits: ${contextData.currentUser?.carbon_credits_balance || 0}
- Verified: ${contextData.currentUser?.verified ? 'Yes' : 'No'}

Registered Processors (Plants):
${JSON.stringify(
  contextData.allUsers
    .filter((u) => u.role === 'processor')
    .map((p) => ({
      id: p.id,
      name: p.full_name,
      city: p.city,
      type: p.facility_type,
      rate_per_ton: p.price_per_ton,
    })),
  null,
  2
)}

Current Active Listings:
${JSON.stringify(
  contextData.listings.slice(0, 4).map((l) => ({
    id: l.id,
    title: l.title,
    quantity_tons: l.quantity_in_tons,
    status: l.status,
  })),
  null,
  2
)}

Current Pickup & Negotiation Requests:
${JSON.stringify(
  contextData.pickupRequests.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.listing_title,
    producer: r.producer_name,
    processor: r.processor_name,
    tons: r.quantity_tons,
    offered_price: r.proposed_price_per_ton,
    counter_price: r.counter_price_per_ton,
    status: r.status,
    negotiation: r.negotiation_status,
  })),
  null,
  2
)}

ACTIONS YOU CAN TAKE:
1. create_listing:
   parameters: {
     subcategory: string (e.g. "Paddy Straw / Parali", "Sugarcane Bagasse", "Cow Dung / Gobar"),
     quantity: number (in tons),
     category: "dry_organic" | "wet_organic"
   }
2. counter_offer:
   parameters: {
     request_id: string,
     counter_price: number (in INR per ton),
     note?: string
   }
3. accept_request:
   parameters: {
     request_id: string
   }
4. update_price:
   parameters: {
     new_price: number (in INR)
   }
5. query_info:
   parameters: {
     answer: string
   }

Respond ONLY as a valid JSON object matching this schema:
{
  "detectedLanguage": "Hindi | English | Hinglish",
  "spokenResponse": "Short, clear, friendly answer in the exact language the user spoke without technical jargon.",
  "action": {
    "tool": "create_listing" | "counter_offer" | "accept_request" | "update_price" | "query_info",
    "parameters": { ... },
    "confirmationText": "Simple 1-line confirmation"
  }
}
Do NOT wrap in markdown backticks or output any extra text.`;

  // 15-second AbortController timeout to ensure session does not hang or time out
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  // Use accessible active models on this key: openai/gpt-oss-120b with fallback to openai/gpt-oss-20b
  const primaryModel = 'openai/gpt-oss-120b';

  try {
    let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0.1, // very low temperature to prevent hallucinations
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    // If primary model has any issue, try secondary gpt-oss-20b fallback model
    if (!response.ok && response.status === 404) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      spokenResponse: parsed.spokenResponse || 'Your request has been processed.',
      detectedLanguage: parsed.detectedLanguage || 'en',
      actionTaken: parsed.action,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please try your request again.');
    }
    console.error('Groq agent error:', error);
    throw error;
  }
};
