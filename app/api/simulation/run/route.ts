import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { batchCallAI } from '@/utils/ai-service';

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

interface PersonaResponse {
  personaId: string;
  personaName: string;
  response: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  interestLevel: 'low' | 'moderate' | 'high';
  keyPoints: string[];
  reasoning: string;
}

interface SimulationInsights {
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  interestDistribution: {
    high: number;
    moderate: number;
    low: number;
  };
  keyThemes: string[];
  majorConcerns: string[];
  strongSupport: string[];
  recommendations: string[];
  consensusLevel: number;
}

export async function POST(request: NextRequest) {
  try {
    const { personas, question, userId } = await request.json();

    console.log('Simulation request:', { personaCount: personas?.length, question, userId });

    if (!personas || !Array.isArray(personas) || !question || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: personas (array), question, userId' },
        { status: 400 }
      );
    }

    // Create batch prompt for all personas
    console.log('Processing personas with smart AI service...');

    const personasList = personas.map((persona, i) => {
      return `${i + 1}. ${persona.name} - ${persona.age}-year-old ${persona.occupation} from ${persona.location}
   - Bio: ${persona.bio}
   - Personality: ${persona.personality.traits.join(', ')}
   - Values: ${persona.personality.values.join(', ')}
   - Communication: ${persona.personality.communication_style}
   - Background: ${persona.background.education}, ${persona.background.experience}
   - Interests: ${persona.background.interests.join(', ')}`;
    }).join('\n');

    const batchPrompt = `CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

You are simulating ${personas.length} different personas responding to: "${question}"

Personas:
${personasList}

REQUIRED OUTPUT FORMAT - RESPOND WITH ONLY THIS JSON STRUCTURE:
{
  "responses": [
    {
      "personaId": "persona_id_1",
      "personaName": "Persona Name",
      "response": "2-3 sentence response based on their background and personality",
      "sentiment": "positive",
      "interestLevel": "moderate",
      "keyPoints": ["point1", "point2"],
      "reasoning": "Why they responded this way"
    }
  ]
}

STRICT RULES:
1. ONLY return the JSON object above
2. Generate exactly ${personas.length} responses in the responses array
3. Use the exact personaId and personaName from the personas provided
4. sentiment must be: "positive", "neutral", or "negative"
5. interestLevel must be: "low", "moderate", or "high"
6. No markdown code blocks
7. No explanatory text before or after
8. Ensure all strings are properly quoted
9. START YOUR RESPONSE WITH { and END WITH }

Make responses realistic based on each persona's background, personality, and values.`;

    // Use batch AI processing for better quota management
    const prompts = [batchPrompt];
    const batchResults = await batchCallAI(prompts, 1);
    const batchResponse = batchResults[0].text;
    const serviceUsed = batchResults[0].service;

    console.log(`Batch processing completed using: ${serviceUsed}`);

    let personaResponses: PersonaResponse[] = [];

    try {
      let cleanResponse = batchResponse.trim();
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

      // Clean up common formatting issues
      cleanResponse = cleanResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log('Cleaned batch response JSON:', cleanResponse.substring(0, 200) + '...');

      const parsedBatch = JSON.parse(cleanResponse);
      personaResponses = parsedBatch.responses || [];

    } catch (parseError) {
      console.error('Error parsing batch response, using fallback:', parseError);

      // Fallback: create basic responses for each persona
      personaResponses = personas.map((persona: any) => ({
        personaId: persona.id,
        personaName: persona.name,
        response: `As a ${persona.occupation}, I think this is an interesting topic that deserves consideration.`,
        sentiment: 'neutral' as const,
        interestLevel: 'moderate' as const,
        keyPoints: ['Requires consideration', 'Relevant to my field'],
        reasoning: 'Fallback response due to API limitations'
      }));
    }

    // Ensure we have responses for all personas
    if (personaResponses.length < personas.length) {
      const missingPersonas = personas.slice(personaResponses.length);
      const fallbackResponses = missingPersonas.map((persona: any) => ({
        personaId: persona.id,
        personaName: persona.name,
        response: `This is an interesting question that relates to my experience as a ${persona.occupation}.`,
        sentiment: 'neutral' as const,
        interestLevel: 'moderate' as const,
        keyPoints: ['Interesting topic', 'Relevant experience'],
        reasoning: 'Generated due to batch size limitations'
      }));

      personaResponses = [...personaResponses, ...fallbackResponses];
    }

    // Generate insights using smart AI service
    console.log('Generating insights with smart AI service...');
    let insights: SimulationInsights;

    try {
      const responsesList = personaResponses.map((pr, i) => {
        return `${i + 1}. ${pr.personaName}: "${pr.response}" (${pr.sentiment}, ${pr.interestLevel} interest)`;
      }).join('\n');

      const insightsPrompt = `CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Analyze these ${personaResponses.length} responses to: "${question}"

Responses:
${responsesList}

REQUIRED OUTPUT FORMAT - RESPOND WITH ONLY THIS JSON STRUCTURE:
{
  "overallSentiment": {"positive": 40, "neutral": 35, "negative": 25},
  "interestDistribution": {"high": 30, "moderate": 50, "low": 20},
  "keyThemes": ["theme1", "theme2", "theme3"],
  "majorConcerns": ["concern1", "concern2"],
  "strongSupport": ["support1", "support2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "consensusLevel": 65
}

STRICT RULES:
1. ONLY return the JSON object above
2. Replace percentages with actual numbers (0-100)
3. Replace arrays with actual strings from the responses
4. No markdown code blocks
5. No explanatory text before or after
6. Ensure all strings are properly quoted
7. Ensure all numbers are integers without quotes

START YOUR RESPONSE WITH { and END WITH }`;

      const insightsPrompts = [insightsPrompt];
      const insightsResults = await batchCallAI(insightsPrompts, 1);
      const insightsResponse = insightsResults[0].text;
      const insightsService = insightsResults[0].service;

      console.log(`Insights generated using: ${insightsService}`);

      let cleanInsights = insightsResponse.trim();

      // Remove markdown code blocks
      if (cleanInsights.startsWith('```json')) {
        cleanInsights = cleanInsights.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanInsights.startsWith('```')) {
        cleanInsights = cleanInsights.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // Extract JSON from conversational response
      const jsonMatch = cleanInsights.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanInsights = jsonMatch[0];
      }

      // Clean up common formatting issues
      cleanInsights = cleanInsights
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      console.log('Cleaned insights JSON:', cleanInsights.substring(0, 200) + '...');

      insights = JSON.parse(cleanInsights);

    } catch (insightsError) {
      console.error('Error generating insights, using calculated fallback:', insightsError);

      // Calculate insights from the responses we have
      const sentimentCounts = personaResponses.reduce((acc, pr) => {
        acc[pr.sentiment]++;
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });

      const interestCounts = personaResponses.reduce((acc, pr) => {
        acc[pr.interestLevel]++;
        return acc;
      }, { high: 0, moderate: 0, low: 0 });

      const total = personaResponses.length;

      insights = {
        overallSentiment: {
          positive: Math.round((sentimentCounts.positive / total) * 100),
          neutral: Math.round((sentimentCounts.neutral / total) * 100),
          negative: Math.round((sentimentCounts.negative / total) * 100)
        },
        interestDistribution: {
          high: Math.round((interestCounts.high / total) * 100),
          moderate: Math.round((interestCounts.moderate / total) * 100),
          low: Math.round((interestCounts.low / total) * 100)
        },
        keyThemes: ['Mixed perspectives', 'Varied opinions'],
        majorConcerns: sentimentCounts.negative > 0 ? ['Some reservations expressed'] : [],
        strongSupport: sentimentCounts.positive > 0 ? ['Positive reception noted'] : [],
        recommendations: [
          'Review individual responses for detailed insights',
          'Consider addressing any concerns raised'
        ],
        consensusLevel: Math.round((Math.max(sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative) / total) * 100)
      };
    }

    // Save to database
    await client.connect();
    const db = client.db('persona_app');
    const simulationsCollection = db.collection('simulations');

    const simulationResult = {
      userId,
      question,
      personas: personas.map((p: any) => ({ id: p.id, name: p.name, occupation: p.occupation })),
      personaResponses,
      insights,
      createdAt: new Date(),
      responseCount: personaResponses.length
    };

    const result = await simulationsCollection.insertOne(simulationResult);
    await client.close();

    console.log('Simulation completed successfully');

    // Return formatted results
    return NextResponse.json({
      simulationId: result.insertedId,
      question,

      analytics: {
        impactScore: {
          score: Math.round((insights.overallSentiment.positive * 0.6 + insights.interestDistribution.high * 0.4)),
          maxScore: 100,
          level: insights.consensusLevel > 70 ? 'High' : insights.consensusLevel > 40 ? 'Moderate' : 'Low',
          color: insights.consensusLevel > 70 ? 'green' : insights.consensusLevel > 40 ? 'yellow' : 'red'
        },
        engagement: {
          highInterest: insights.interestDistribution.high,
          moderateInterest: insights.interestDistribution.moderate,
          lowInterest: insights.interestDistribution.low
        },
        sentiment: {
          positive: insights.overallSentiment.positive,
          neutral: insights.overallSentiment.neutral,
          negative: insights.overallSentiment.negative
        }
      },

      insights: {
        primaryInsight: insights.keyThemes.length > 0 ?
          `The main themes that emerged were: ${insights.keyThemes.slice(0, 2).join(' and ')}.` :
          'Mixed responses with varying perspectives on the topic.',
        secondaryInsights: [
          `${insights.overallSentiment.positive}% of personas responded positively to your question.`,
          insights.majorConcerns.length > 0 ?
            `Key concerns raised include: ${insights.majorConcerns.slice(0, 2).join(' and ')}.` :
            'No major concerns were consistently raised.',
          insights.strongSupport.length > 0 ?
            `Strong support was shown for: ${insights.strongSupport.slice(0, 2).join(' and ')}.` :
            'Support levels varied across different aspects.',
          `Consensus level among personas was ${insights.consensusLevel}%.`
        ],
        recommendation: {
          title: 'Recommendation',
          description: insights.recommendations.length > 0 ?
            insights.recommendations[0] :
            'Consider the diverse perspectives and address the main concerns raised.'
        }
      },

      conversations: [
        {
          title: 'Positive Responses',
          description: `${insights.overallSentiment.positive}% of personas responded positively, highlighting benefits and opportunities.`,
          percentage: insights.overallSentiment.positive,
          quotes: personaResponses
            .filter(pr => pr.sentiment === 'positive')
            .slice(0, 3)
            .map(pr => `"${pr.response.split('.')[0]}." - ${pr.personaName}`)
        },
        {
          title: 'Concerns Raised',
          description: `${insights.overallSentiment.negative}% expressed concerns or reservations about the topic.`,
          percentage: insights.overallSentiment.negative,
          quotes: personaResponses
            .filter(pr => pr.sentiment === 'negative')
            .slice(0, 3)
            .map(pr => `"${pr.response.split('.')[0]}." - ${pr.personaName}`)
        },
        {
          title: 'High Interest',
          description: `${insights.interestDistribution.high}% showed high interest and engagement with the topic.`,
          percentage: insights.interestDistribution.high,
          quotes: personaResponses
            .filter(pr => pr.interestLevel === 'high')
            .slice(0, 3)
            .map(pr => `"${pr.response.split('.')[0]}." - ${pr.personaName}`)
        }
      ],

      personaOpinions: personaResponses.map(pr => ({
        personaId: pr.personaId,
        personaName: pr.personaName,
        opinion: pr.response,
        sentiment: pr.sentiment,
        engagementLevel: pr.interestLevel,
        keyPoints: pr.keyPoints
      }))
    });

  } catch (error: any) {
    console.error('Error running simulation:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation: ' + error.message },
      { status: 500 }
    );
  }
}