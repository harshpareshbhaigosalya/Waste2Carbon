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

// User-provided or stored Groq API Key
const GROQ_STORAGE_KEY = 'w2c_groq_api_key';

export const getStoredGroqKey = (): string => {
  return localStorage.getItem(GROQ_STORAGE_KEY) || (import.meta as any).env?.VITE_GROQ_API_KEY || '';
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
  const apiKey = apiKeyOverride || getStoredGroqKey();
  if (!apiKey) {
    throw new Error('Please enter your Groq API Key to activate the Agentic AI assistant.');
  }

  const systemPrompt = `You are "AgriCarbon AI", an autonomous agentic AI assistant for the W2C (Waste-to-Carbon) circular ecosystem platform in India.
Your mission is to help ANY user—especially farmers, village producers, and facility operators who may speak in Hindi, Hinglish, Punjabi, Marathi, Tamil, Telugu, Gujarati, Bengali, or English.

Current User Profile:
- Name: ${contextData.currentUser?.full_name || 'Guest'}
- Role: ${contextData.currentUser?.role || 'producer'}
- Location: ${contextData.currentUser?.formatted_address || contextData.currentUser?.city || 'India'}
- Facility Type: ${contextData.currentUser?.facility_type || 'N/A'}
- Current Balance: ${contextData.currentUser?.carbon_credits_balance || 0} Credits
- Verified: ${contextData.currentUser?.verified ? 'Yes' : 'No'}

Available Processors in System:
${JSON.stringify(
  contextData.allUsers
    .filter((u) => u.role === 'processor')
    .map((p) => ({
      id: p.id,
      name: p.full_name,
      city: p.city,
      facility_type: p.facility_type,
      price_per_ton: p.price_per_ton,
      verified: p.verified,
    })),
  null,
  2
)}

Current Active Listings:
${JSON.stringify(
  contextData.listings.slice(0, 5).map((l) => ({
    id: l.id,
    title: l.title,
    producer_name: l.producer_name,
    quantity_in_tons: l.quantity_in_tons,
    status: l.status,
    city: l.city,
  })),
  null,
  2
)}

Current Pickup & Negotiation Requests:
${JSON.stringify(
  contextData.pickupRequests.slice(0, 6).map((r) => ({
    id: r.id,
    listing_title: r.listing_title,
    producer_name: r.producer_name,
    processor_name: r.processor_name,
    quantity_tons: r.quantity_tons,
    proposed_price_per_ton: r.proposed_price_per_ton,
    counter_price_per_ton: r.counter_price_per_ton,
    status: r.status,
    negotiation_status: r.negotiation_status,
  })),
  null,
  2
)}

YOUR TASK:
Understand the user's natural query in WHATEVER LANGUAGE they speak (Hindi, English, Hinglish, etc.).
Determine if the user wants to execute an action directly, or ask a question.
The possible autonomous actions are:
1. create_listing:
   parameters: {
     subcategory: string (e.g. "Paddy Straw / Parali", "Sugarcane Bagasse", "Cow Dung / Gobar", "Mustard Stalks", "Food Waste"),
     quantity: number (in tons),
     category: "dry_organic" | "wet_organic",
     expected_days: number (default 3),
     processor_id?: string (if mentioning a specific plant or cheapest/closest)
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
     new_price: number (for processors updating their offer rate)
   }
5. query_info:
   parameters: {
     answer: string
   }

Respond ONLY in valid JSON format matching this schema:
{
  "detectedLanguage": "Hindi | English | Hinglish | etc",
  "spokenResponse": "A warm, natural, respectful response in the EXACT SAME LANGUAGE the user spoke (or Hinglish/Hindi if user spoke Hindi). Explain clearly what action was taken or answer their question simply without jargon.",
  "action": {
    "tool": "create_listing" | "counter_offer" | "accept_request" | "update_price" | "query_info",
    "parameters": { ... },
    "confirmationText": "Human-friendly summary of the action"
  }
}
Do NOT include any markdown formatting, backticks, or other text outside the JSON object.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      spokenResponse: parsed.spokenResponse || 'Action processed.',
      detectedLanguage: parsed.detectedLanguage || 'en',
      actionTaken: parsed.action,
    };
  } catch (error: any) {
    console.error('Groq agent error:', error);
    throw error;
  }
};
