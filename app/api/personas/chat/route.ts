import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/utils/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { persona, message, conversationHistory } = await request.json();

    if (!persona || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: persona, message' },
        { status: 400 }
      );
    }

    console.log('Solo chat request for:', persona.name);

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? conversationHistory.map((msg: any) => 
          `${msg.sender === 'user' ? 'You' : persona.name}: ${msg.text}`
        ).join('\n')
      : '';

    // Create persona-specific chat prompt - simple and natural
    const chatPrompt = [
      `You're ${persona.name}, a ${persona.age}-year-old ${persona.occupation} from ${persona.location}.`,
      "",
      `Your background: ${persona.bio}`,
      `Your personality: ${persona.personality.traits.slice(0, 3).join(', ')}`,
      `Your interests: ${persona.background.interests.slice(0, 3).join(', ')}`,
      "",
      "IMPORTANT - Talk like a normal person:",
      "- Use simple, everyday words (no fancy vocabulary)",
      "- Talk like you're texting a friend",
      "- Avoid words like 'profound', 'painstaking', 'insights', 'endeavor', 'captivating'",
      "- Use contractions (I'm, don't, can't, it's)",
      "- Match the length to the question - short questions get short answers, detailed questions can get longer answers",
      "- Be casual and relatable",
      "",
      conversationContext ? `Previous messages:\n${conversationContext}\n` : "",
      `They just asked: "${message}"`,
      "",
      `Respond as ${persona.name} using simple, normal language:`
    ].join("\n");

    const { text: response, service } = await callAI(chatPrompt);
    console.log(`Chat response generated using: ${service}`);

    return NextResponse.json({
      response: response.trim(),
      persona: {
        name: persona.name,
        occupation: persona.occupation,
        image: persona.image
      },
      service: service,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in persona chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat response: ' + error.message },
      { status: 500 }
    );
  }
}