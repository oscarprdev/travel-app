<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Planning Your Trip</h2>
        <p class="text-gray-600 text-sm mt-1">This may take a minute...</p>
      </div>

      <div class="space-y-4">
        <ProgressStep
          :status="getStepStatus('queued')"
          label="Request queued"
        />
        <ProgressStep
          :status="getStepStatus('searching_flights')"
          label="Searching flights"
        />
        <ProgressStep
          :status="getStepStatus('searching_hotels')"
          label="Finding hotels"
        />
        <ProgressStep
          :status="getStepStatus('searching_activities')"
          label="Discovering activities"
        />
        <ProgressStep
          :status="getStepStatus('generating_itinerary')"
          label="Creating itinerary"
        />
      </div>

      <div v-if="jobStatus === 'error'" class="mt-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ errorMessage }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>

      <div v-if="jobStatus === 'completed' && results" class="mt-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p class="text-green-800 font-medium">Your trip is ready!</p>
        </div>

        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div class="border-b pb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Flights ({{ results.flights?.length || 0 }} options)</h3>
            <div v-for="flight in results.flights?.slice(0, 3)" :key="flight.id" class="text-sm text-gray-600 mb-1">
              {{ flight.outbound.departure }} → {{ flight.outbound.arrival }} - €{{ flight.price }}
            </div>
          </div>

          <div class="border-b pb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Hotels ({{ results.hotels?.length || 0 }} options)</h3>
            <div v-for="hotel in results.hotels?.slice(0, 3)" :key="hotel.id" class="text-sm text-gray-600 mb-1">
              {{ hotel.name }} - €{{ hotel.price }}
            </div>
          </div>

          <div class="border-b pb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Activities ({{ results.activities?.length || 0 }} options)</h3>
            <div v-for="activity in results.activities?.slice(0, 3)" :key="activity.id" class="text-sm text-gray-600 mb-1">
              {{ activity.name }} - €{{ activity.price }}
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">AI-Generated Itinerary</h3>
            <div class="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
              {{ results.itinerary }}
            </div>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
}>()

defineEmits(['close'])

const jobStatus = ref<string>('queued')
const results = ref<any>(null)
const errorMessage = ref<string>('')

let pollInterval: NodeJS.Timeout | null = null

const statusOrder = ['queued', 'searching_flights', 'searching_hotels', 'searching_activities', 'generating_itinerary', 'completed']

const getStepStatus = (step: string): 'pending' | 'active' | 'completed' => {
  const currentIndex = statusOrder.indexOf(jobStatus.value)
  const stepIndex = statusOrder.indexOf(step)

  if (stepIndex < currentIndex) return 'completed'
  if (stepIndex === currentIndex) return 'active'
  return 'pending'
}

const pollResults = async () => {
  try {
    const data = await $fetch(`/api/get-results?sessionId=${props.sessionId}`)

    jobStatus.value = data.status

    if (data.status === 'completed') {
      results.value = data.results
      if (pollInterval) clearInterval(pollInterval)
    }

    if (data.status === 'error') {
      errorMessage.value = data.error || 'An error occurred'
      if (pollInterval) clearInterval(pollInterval)
    }
  } catch (error) {
    console.error('Polling error:', error)
  }
}

const triggerWorker = async () => {
  try {
    console.log('[Frontend] Triggering queue processor')
    await $fetch('/api/process-queue', { method: 'POST' })
  } catch (error) {
    console.error('[Frontend] Worker trigger error:', error)
  }
}

onMounted(() => {
  // Trigger worker immediately
  triggerWorker()

  // Start polling for results
  pollResults()
  pollInterval = setInterval(pollResults, 2000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
