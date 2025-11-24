export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  duration: string;
  category: string;
}

interface GetYourGuideActivity {
  id: string;
  title: string;
  abstract?: string;
  description?: string;
  price?: {
    values?: {
      amount?: string | number;
      currency?: string;
    };
  };
  rating?: {
    average?: number;
  };
  duration?: string;
  categories?: Array<{
    name?: string;
  }>;
}

export const searchActivities = async (destination: string): Promise<Activity[]> => {
  try {
    console.log('[GetYourGuide] Searching activities', { destination });
    const username = process.env.GETYOURGUIDE_USERNAME;
    const password = process.env.GETYOURGUIDE_PASSWORD;

    if (!username || !password) {
      console.warn('[GetYourGuide] Credentials not configured');
      return [];
    }

    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    console.log('[GetYourGuide] Making API request');

    const response = await fetch(`https://api.getyourguide.com/1/activities?q=${destination}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[GetYourGuide] API error', { status: response.status, statusText: response.statusText });
      throw new Error(`GetYourGuide API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[GetYourGuide] Activities found', { count: data.activities?.length || 0 });

    return (
      data.activities?.slice(0, 20).map((activity: GetYourGuideActivity) => ({
        id: activity.id,
        name: activity.title,
        description: activity.abstract || activity.description || '',
        price: parseFloat(String(activity.price?.values?.amount || 0)),
        currency: activity.price?.values?.currency || 'EUR',
        rating: activity.rating?.average || 0,
        duration: activity.duration || 'Variable',
        category: activity.categories?.[0]?.name || 'General',
      })) || []
    );
  } catch (error) {
    console.error('GetYourGuide activities search error:', error);
    return [];
  }
};
