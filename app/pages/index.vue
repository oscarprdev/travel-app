<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Travel Planner</h1>
        <p class="text-gray-600">Find the perfect trip within your budget</p>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="startSearch" class="space-y-6">
          <div>
            <label for="origin" class="block text-sm font-medium text-gray-700 mb-2">
              Origin (Airport Code)
            </label>
            <input
              id="origin"
              v-model="form.origin"
              type="text"
              placeholder="e.g., MAD"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
              Destination (Airport Code)
            </label>
            <input
              id="destination"
              v-model="form.destination"
              type="text"
              placeholder="e.g., TYO"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
              Total Budget (EUR)
            </label>
            <input
              id="budget"
              v-model="form.budget"
              type="number"
              min="100"
              step="50"
              placeholder="e.g., 1400"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            :disabled="isSearching"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSearching ? 'Searching...' : 'Find My Perfect Trip' }}
          </button>
        </form>
      </div>
    </div>

    <ProgressModal
      v-if="showModal"
      :session-id="sessionId"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
const form = ref({
  origin: '',
  destination: '',
  budget: '',
})

const isSearching = ref(false)
const showModal = ref(false)
const sessionId = ref('')

const startSearch = async () => {
  isSearching.value = true

  try {
    const response = await $fetch('/api/start-search', {
      method: 'POST',
      body: form.value,
    })

    sessionId.value = response.sessionId
    showModal.value = true
  } catch (error) {
    console.error('Search error:', error)
    alert('Failed to start search. Please try again.')
  } finally {
    isSearching.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  sessionId.value = ''
}
</script>
