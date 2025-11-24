import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ItineraryData {
  flights: unknown[];
  hotels: unknown[];
  activities: unknown[];
  budget: number;
  origin: string;
  destination: string;
}

export const generateItinerary = async (data: ItineraryData): Promise<string> => {
  try {
    console.log('[OpenAI] Generating itinerary', {
      origin: data.origin,
      destination: data.destination,
      budget: data.budget,
      flights: data.flights.length,
      hotels: data.hotels.length,
      activities: data.activities.length
    });

    const prompt = `Create a detailed travel itinerary for a trip from ${data.origin} to ${data.destination} with a total budget of ${data.budget} EUR.

Available options:
- Flights: ${JSON.stringify(data.flights.slice(0, 5))}
- Hotels: ${JSON.stringify(data.hotels.slice(0, 5))}
- Activities: ${JSON.stringify(data.activities.slice(0, 10))}

Please provide:
1. Recommended flight and hotel combination that maximizes value
2. Day-by-day itinerary with activities
3. Budget breakdown (flights, accommodation, activities, meals, transport)
4. Practical travel tips

Format the response in markdown with clear sections.`;

    console.log('[OpenAI] Sending request to GPT-4o-mini');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional travel planner. Create detailed, practical itineraries that maximize value within the given budget.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    console.log('[OpenAI] Itinerary generated successfully', { tokens: completion.usage?.total_tokens });
    return completion.choices[0].message.content || 'Unable to generate itinerary';
  } catch (error) {
    console.error('[OpenAI] Itinerary generation error:', error);
    throw new Error('Failed to generate itinerary');
  }
};

export { openai };
