import { dequeueJob, updateJobStatus } from '../utils/redis';
import { searchFlights, searchHotels } from '../utils/amadeus';
import { searchActivities } from '../utils/activities';
import { generateItinerary } from '../utils/openai';

export default defineEventHandler(async () => {
  console.log('[Worker] Checking queue for jobs');

  const job = await dequeueJob();

  if (!job) {
    console.log('[Worker] No jobs in queue');
    return { processed: false, message: 'No jobs in queue' };
  }

  console.log('[Worker] Processing job', { sessionId: job.sessionId, origin: job.origin, destination: job.destination });

  try {
    // Step 1: Search flights
    console.log('[Worker] Step 1: Searching flights');
    await updateJobStatus(job.sessionId, {
      status: 'searching_flights',
      currentStep: 'Searching for flights...',
    });

    // Calculate dates (simple: 2 weeks from now, 1 week trip)
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 14);
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    const flights = await searchFlights(
      job.origin,
      job.destination,
      departureDate.toISOString().split('T')[0],
      returnDate.toISOString().split('T')[0]
    );

    console.log('[Worker] Flights retrieved', { count: flights.length });

    // Step 2: Search hotels
    console.log('[Worker] Step 2: Searching hotels');
    await updateJobStatus(job.sessionId, {
      status: 'searching_hotels',
      currentStep: 'Searching for hotels...',
    });

    const hotels = await searchHotels(
      job.destination,
      departureDate.toISOString().split('T')[0],
      returnDate.toISOString().split('T')[0]
    );

    console.log('[Worker] Hotels retrieved', { count: hotels.length });

    // Step 3: Search activities
    console.log('[Worker] Step 3: Searching activities');
    await updateJobStatus(job.sessionId, {
      status: 'searching_activities',
      currentStep: 'Searching for activities...',
    });

    const activities = await searchActivities(job.destination);
    console.log('[Worker] Activities retrieved', { count: activities.length });

    // Step 4: Generate itinerary
    console.log('[Worker] Step 4: Generating itinerary');
    await updateJobStatus(job.sessionId, {
      status: 'generating_itinerary',
      currentStep: 'Generating personalized itinerary...',
    });

    const itinerary = await generateItinerary({
      flights,
      hotels,
      activities,
      budget: job.budget,
      origin: job.origin,
      destination: job.destination,
    });

    console.log('[Worker] Itinerary generated');

    // Step 5: Mark as completed
    console.log('[Worker] Step 5: Marking job as completed');
    await updateJobStatus(job.sessionId, {
      status: 'completed',
      results: {
        flights,
        hotels,
        activities,
        itinerary,
        budget: job.budget,
        origin: job.origin,
        destination: job.destination,
      },
    });

    console.log('[Worker] Job completed successfully', { sessionId: job.sessionId });

    return {
      processed: true,
      sessionId: job.sessionId,
      message: 'Job processed successfully',
    };
  } catch (error) {
    console.error('[Worker] Job processing error', { sessionId: job.sessionId, error });

    await updateJobStatus(job.sessionId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      processed: true,
      sessionId: job.sessionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});
