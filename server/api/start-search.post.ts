import { enqueueJob } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { origin, destination, budget } = body

  if (!origin || !destination || !budget) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: origin, destination, budget',
    })
  }

  const sessionId = `search_${Date.now()}_${Math.random().toString(36).substring(7)}`

  await enqueueJob({
    origin,
    destination,
    budget: parseFloat(budget),
    sessionId,
  })

  return {
    sessionId,
    status: 'queued',
  }
})
