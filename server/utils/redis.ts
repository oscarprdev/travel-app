import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface SearchJob {
  origin: string;
  destination: string;
  budget: number;
  sessionId: string;
}

export interface JobProgress {
  status:
    | 'queued'
    | 'searching_flights'
    | 'searching_hotels'
    | 'searching_activities'
    | 'generating_itinerary'
    | 'completed'
    | 'error';
  currentStep?: string;
  results?: unknown;
  error?: string;
}

export const enqueueJob = async (job: SearchJob) => {
  await redis.lpush('travel_search_queue', JSON.stringify(job));
  await redis.set(`job:${job.sessionId}`, JSON.stringify({ status: 'queued' }), { ex: 3600 });
};

export const getJobStatus = async (sessionId: string): Promise<JobProgress | null> => {
  const data = await redis.get(`job:${sessionId}`);
  return data ? (typeof data === 'string' ? JSON.parse(data) : { ...data, status: 'queued' }) : null;
};

export const updateJobStatus = async (sessionId: string, progress: JobProgress) => {
  await redis.set(`job:${sessionId}`, JSON.stringify(progress), { ex: 3600 });
};

export const dequeueJob = async (): Promise<SearchJob | null> => {
  const data = await redis.rpop('travel_search_queue');
  return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
};

export { redis };
