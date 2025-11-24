<template>
  <div class="flex items-center space-x-3">
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition"
      :class="{
        'bg-gray-200': status === 'pending',
        'bg-blue-500 animate-pulse': status === 'active',
        'bg-green-500': status === 'completed'
      }"
    >
      <svg
        v-if="status === 'completed'"
        class="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        v-else-if="status === 'active'"
        class="w-5 h-5 text-white animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <div v-else class="w-3 h-3 bg-gray-400 rounded-full" />
    </div>

    <span
      class="text-sm font-medium transition"
      :class="{
        'text-gray-400': status === 'pending',
        'text-blue-600': status === 'active',
        'text-green-600': status === 'completed'
      }"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'pending' | 'active' | 'completed'
  label: string
}>()
</script>
