import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { callAI } from '@/utils/ai-service';
import { generatePersonaAvatar } from '@/utils/gravatar';

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export async function POST(request: NextRequest) {
  try {
    const { societyType, personaCount, userId } = await request.json();

    console.log('Received request:', { societyType, personaCount, userId });

    if (!societyType || !personaCount || !userId) {
      console.log('Missing fields:', { societyType: !!societyType, personaCount: !!personaCount, userId: !!userId });
      return NextResponse.json(
        { error: 'Missing required fields: societyType, personaCount, userId' },
        { status: 400 }
      );
    }

    // Generate personas using smart AI service
    const prompt = [
      "CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.",
      "",
      "Generate " + personaCount + " diverse personas who are ALL \"" + societyType + "\".",
      "",
      "REQUIRED OUTPUT FORMAT - RESPOND WITH ONLY THIS JSON STRUCTURE:",
      "{",
      "  \"personas\": [",
      "    {",
      "      \"id\": \"unique_id_1\",",
      "      \"name\": \"Full Name\",",
      "      \"age\": 18,",
      "      \"gender\": \"male\" | \"female\" | \"non-binary\",",
      "      \"occupation\": \"" + societyType + "\",",
      "      \"location\": \"City, Country\",",
      "      \"bio\": \"2-3 sentence biography about this specific " + societyType + "\",",
      "      \"personality\": {",
      "        \"traits\": [\"trait1\", \"trait2\", \"trait3\", \"trait4\"],",
      "        \"values\": [\"value1\", \"value2\", \"value3\"],",
      "        \"communication_style\": \"Description of how they communicate\"",
      "      },",
      "      \"background\": {",
      "        \"education\": \"Educational background relevant to " + societyType + "\",",
      "        \"experience\": \"Experience relevant to being " + societyType + "\",",
      "        \"interests\": [\"interest1\", \"interest2\", \"interest3\"]",
      "      },",
      "      \"social\": {",
      "        \"network_size\": \"Description of network size\",",
      "        \"influence_level\": \"Low/Medium/High influence description\",",
      "        \"preferred_platforms\": [\"platform1\", \"platform2\", \"platform3\"]",
      "      }",
      "    }",
      "  ]",
      "}",
      "",
      "STRICT RULES:",
      "1. ONLY return the JSON object above",
      "2. ALL " + personaCount + " personas must be \"" + societyType + "\" - no exceptions",
      "3. Make them diverse in personality, background, approaches, etc.",
      "4. Use realistic names from different cultures",
      "5. Include diverse gender representation (male, female, non-binary)",
      "6. Match names appropriately to gender (e.g., Sarah for female, Michael for male)",
      "7. No markdown code blocks",
      "8. No explanatory text before or after",
      "9. Ensure all strings are properly quoted",
      "10. START YOUR RESPONSE WITH { and END WITH }",
      "",
      "Generate exactly " + personaCount + " personas in the personas array."
    ].join("\n");

    const { text: aiResponse, service } = await callAI(prompt);
    console.log('Personas generated using:', service);
    
    // Parse the response with better error handling
    let cleanResponse = aiResponse.trim();
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Extract JSON from conversational response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    // Log the response for debugging
    console.log(service + ' response length:', cleanResponse.length);
    console.log('First 500 chars:', cleanResponse.substring(0, 500));
    console.log('Last 500 chars:', cleanResponse.substring(Math.max(0, cleanResponse.length - 500)));

    let parsedData;
    try {
      parsedData = JSON.parse(cleanResponse);
    } catch (jsonError: any) {
      console.error('JSON Parse Error:', jsonError.message);
      console.error('Problematic JSON around position:', cleanResponse.substring(0, 100));
      
      // Try to fix common JSON issues
      let fixedResponse = cleanResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      try {
        parsedData = JSON.parse(fixedResponse);
        console.log('Fixed JSON successfully');
      } catch (secondError: any) {
        console.error('Still failed after fixing:', secondError.message);
        
        // Last resort: try to extract just the personas array
        const personasMatch = cleanResponse.match(/"personas"\s*:\s*\[([\s\S]*)\]/);
        if (personasMatch) {
          try {
            const personasOnly = '{"personas":[' + personasMatch[1] + ']}';
            parsedData = JSON.parse(personasOnly);
            console.log('Extracted personas array successfully');
          } catch (extractError) {
            throw new Error('Failed to parse AI response as JSON. Original error: ' + jsonError.message);
          }
        } else {
          throw new Error('Failed to parse AI response as JSON. Original error: ' + jsonError.message);
        }
      }
    }

    const personas = parsedData.personas;

    if (!personas || !Array.isArray(personas)) {
      throw new Error('Invalid response format: personas array not found');
    }

    // Add realistic human face avatars to each persona using gender information
    const personasWithAvatars = personas.map((persona: any) => ({
      ...persona,
      image: generatePersonaAvatar(persona.name, persona.age, persona.occupation, persona.gender)
    }));

    // Connect to MongoDB and save the network
    await client.connect();
    const db = client.db('persona_app');
    const networksCollection = db.collection('networks');

    const network = {
      userId,
      societyType,
      personas: personasWithAvatars,
      createdAt: new Date(),
      personaCount: personasWithAvatars.length
    };

    const result = await networksCollection.insertOne(network);
    
    await client.close();

    return NextResponse.json({
      networkId: result.insertedId,
      personas: personasWithAvatars,
      message: 'Personas generated and saved successfully'
    });

  } catch (error: any) {
    console.error('Error generating personas:', error);
    return NextResponse.json(
      { error: 'Failed to generate personas: ' + error.message },
      { status: 500 }
    );
  }
}