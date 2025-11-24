import { getJobStatus } from '../utils/redis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.sessionId as string

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Missing sessionId parameter',
    })
  }

  const status = await getJobStatus(sessionId)

  if (!status) {
    throw createError({
      statusCode: 404,
      message: 'Job not found',
    })
  }

  return status
})
