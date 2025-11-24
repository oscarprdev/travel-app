import { enqueueJob } from '../utils/redis'

export default defineEventHandler(async (event) => {
  console.log('[API] start-search: Request received')
  const body = await readBody(event)
  console.log('[API] start-search: Body parsed', { origin: body.origin, destination: body.destination, budget: body.budget })

  const { origin, destination, budget } = body

  if (!origin || !destination || !budget) {
    console.error('[API] start-search: Missing required fields')
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: origin, destination, budget',
    })
  }

  const sessionId = `search_${Date.now()}_${Math.random().toString(36).substring(7)}`
  console.log('[API] start-search: Session created', { sessionId })

  await enqueueJob({
    origin,
    destination,
    budget: parseFloat(budget),
    sessionId,
  })

  console.log('[API] start-search: Job enqueued successfully')

  return {
    sessionId,
    status: 'queued',
  }
})
