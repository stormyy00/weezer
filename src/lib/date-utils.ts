export function formatEventDate(dateString?: string | null) {
  if (!dateString) {
    return {
      day: undefined,
      monthDay: undefined,
      time: undefined,
      isTBD: true
    }
  }

  const date = new Date(dateString)

  // Format: "Wed"
  const day = date.toLocaleDateString('en-US', { weekday: 'short' })

  // Format: "Jan 14"
  const monthDay = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  // Format: "3:00 PM"
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return { day, monthDay, time, isTBD: false }
}
