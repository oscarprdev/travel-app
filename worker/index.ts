import { dequeueJob, updateJobStatus } from '../server/utils/redis'
import { searchFlights, searchHotels } from '../server/utils/amadeus'
import { searchActivities } from '../server/utils/activities'
import { generateItinerary } from '../server/utils/openai'

const processJob = async () => {
  const job = await dequeueJob()

  if (!job) {
    return false
  }

  const { sessionId, origin, destination, budget } = job

  try {
    await updateJobStatus(sessionId, {
      status: 'searching_flights',
      currentStep: 'Searching for flights...',
    })

    const today = new Date()
    const departureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const returnDate = new Date(departureDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    const flights = await searchFlights(
      origin,
      destination,
      departureDate.toISOString().split('T')[0],
      returnDate.toISOString().split('T')[0]
    )

    await updateJobStatus(sessionId, {
      status: 'searching_hotels',
      currentStep: 'Searching for hotels...',
    })

    const hotels = await searchHotels(
      destination,
      departureDate.toISOString().split('T')[0],
      returnDate.toISOString().split('T')[0]
    )

    await updateJobStatus(sessionId, {
      status: 'searching_activities',
      currentStep: 'Finding activities...',
    })

    const activities = await searchActivities(destination)

    await updateJobStatus(sessionId, {
      status: 'generating_itinerary',
      currentStep: 'Generating your personalized itinerary...',
    })

    const itinerary = await generateItinerary({
      flights,
      hotels,
      activities,
      budget,
      origin,
      destination,
    })

    await updateJobStatus(sessionId, {
      status: 'completed',
      currentStep: 'Complete!',
      results: {
        flights: flights.slice(0, 10),
        hotels: hotels.slice(0, 10),
        activities: activities.slice(0, 10),
        itinerary,
        budget,
      },
    })

    console.log(`Job ${sessionId} completed successfully`)
    return true
  } catch (error) {
    console.error(`Job ${sessionId} failed:`, error)
    await updateJobStatus(sessionId, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
    return true
  }
}

const runWorker = async () => {
  console.log('Worker started, polling for jobs...')

  while (true) {
    try {
      const processed = await processJob()
      if (!processed) {
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error) {
      console.error('Worker error:', error)
      await new Promise((resolve) => setTimeout(resolve, 10000))
    }
  }
}

runWorker()
