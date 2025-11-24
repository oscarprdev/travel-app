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
  console.log('[Redis] Enqueueing job', { sessionId: job.sessionId, origin: job.origin, destination: job.destination });
  await redis.lpush('travel_search_queue', JSON.stringify(job));
  await redis.set(`job:${job.sessionId}`, JSON.stringify({ status: 'queued' }), { ex: 3600 });
  console.log('[Redis] Job enqueued successfully', { sessionId: job.sessionId });
};

export const getJobStatus = async (sessionId: string): Promise<JobProgress | null> => {
  console.log('[Redis] Getting job status', { sessionId });
  const data = await redis.get(`job:${sessionId}`);
  const result = data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  console.log('[Redis] Job status retrieved', { sessionId, status: result?.status });
  return result;
};

export const updateJobStatus = async (sessionId: string, progress: JobProgress) => {
  console.log('[Redis] Updating job status', { sessionId, status: progress.status, step: progress.currentStep });
  await redis.set(`job:${sessionId}`, JSON.stringify(progress), { ex: 3600 });
  console.log('[Redis] Job status updated', { sessionId });
};

export const dequeueJob = async (): Promise<SearchJob | null> => {
  console.log('[Redis] Attempting to dequeue job');
  const data = await redis.rpop('travel_search_queue');
  const result = data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  console.log('[Redis] Dequeue result', { found: !!result, sessionId: result?.sessionId });
  return result;
};

export { redis };
