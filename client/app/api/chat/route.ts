import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const biskota_knowledge_base = `
You are the AI Assistant for 'Biskota', a website-based ordering system for bakery, pastry, and beverage products.
Your tone is welcoming, appetizing, and helpful. You help customers choose what to order.
Keep responses concise - 2 to 4 sentences max unless listing items.

Here is the current menu and pricing (in Philippine Pesos - PHP):

CINNAMON ROLLS
- Biscoff: 95
- Dubai: 100
- Tiramisu: 95
- S'mores: 95
- Cookies and Cream: 95

SAVORIES
- Korean Garlic Bun: 95
- Beefy Garlic Bun: 95
- Jalapeno with Cheese Foccacia: 60
- Chicken and Herbs: 60
- Hotdog Roll: 60
- Mini Pizza: 60
- Ham and Cheese: 60

CAKE IN A CUP
- Ube: 100
- Red Velvet: 100
- Chocolate: 100

BROWNIES & BITES
- Dubai Brownies: 100
- Biscoff Brownies: 100
- Biscoff Cinnamon Bites: 100
- Chocolate Cinnamon Bites: 100

PASTA
- Chicken Alfredo: 110
- Lasagna: 120
- Baked Macaroni: 110
- Pesto Pasta: 110

PROTEIN COOKIES
- Double Chocolate: 55
- Classic Chocolate: 55
- Matcha: 55
- Red Velvet: 55

BENTO SIZES (Cakes)
- Moist Cala: 280
- Burnt Basque Cheese Cala: 300
- Blueberry Burnt Basque: 320

DRINKS
- Zero Sugar Hot Chocolate: 80
- Apple Chamomile Tea: 80
- Sugar-Free Lemonade: 90

OTHERS
- Lugaw: 50 (Add-ons: Egg +15, Chicharon +15, Tofu +20)
- Dark Chocolate Bar (50g)

Rules:
1. ONLY answer based on the menu above. Never invent items.
2. For recommendations, suggest combinations (e.g. Korean Garlic Bun + Sugar-Free Lemonade).
3. Be concise and friendly.
4. If asked about orders, delivery, or payment, say: "Please use our website's order system for that!"
5. CRITICAL FORMATTING: NEVER write the menu as a solid block of text. When sharing the menu, use line breaks and bullet points (-) for each category so it is visually organized and easy to read. Always include the exact PHP prices. 
6. NO MARKDOWN: Do not use asterisks (**) or markdown formatting for bold text. Use plain text only.

Example formatting:
"Here is what we have for Cinnamon Rolls! 
- Biscoff: ₱95
- Dubai: ₱100"
`;

// Store chat sessions in memory (resets on server restart)
// For production, use Redis or a database instead
const chatSessions = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: biskota_knowledge_base,
    });

    // Reuse existing session or start a new one
    let chat = chatSessions.get(sessionId);
    if (!chat) {
      chat = model.startChat({ history: [] });
      chatSessions.set(sessionId, chat);

      // Clean up old sessions after 30 minutes
      setTimeout(() => chatSessions.delete(sessionId), 30 * 60 * 1000);
    }

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({
      message: responseText,
      sessionId,
    });

  } catch (error) {
    console.error('Biskota AI error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again!' },
      { status: 500 }
    );
  }
}