import { getJobStatus } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.sessionId as string
  console.log('[API] get-results: Request received', { sessionId })

  if (!sessionId) {
    console.error('[API] get-results: Missing sessionId')
    throw createError({
      statusCode: 400,
      message: 'Missing sessionId parameter',
    })
  }

  const status = await getJobStatus(sessionId)
  console.log('[API] get-results: Status retrieved', { sessionId, status: status?.status })

  if (!status) {
    console.error('[API] get-results: Job not found', { sessionId })
    throw createError({
      statusCode: 404,
      message: 'Job not found',
    })
  }

  return status
})
