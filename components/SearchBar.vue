}

  const savedSearchRemovedHandler = (event: CustomEvent) => {
    const { name, query } = event.detail
    showToast(`Removed saved search "${name}".`, 'info')
  }

  // Add event listeners
  window.addEventListener('saved-search-added', savedSearchAddedHandler as (event: CustomEvent) => void)
  window.addEventListener('saved-search-updated', savedSearchUpdatedHandler as (event: CustomEvent) => void)
  window.addEventListener('saved-search-removed', savedSearchRemovedHandler as (event: CustomEvent) => void)

  // Clean up event listeners on component unmount
  onUnmounted(() => {
    window.removeEventListener('saved-search-added', savedSearchAddedHandler as (event: CustomEvent) => void)
    window.removeEventListener(
      'saved-search-updated',
      savedSearchUpdatedHandler as (event: CustomEvent) => void
    )
    window.removeEventListener(
      'saved-search-removed',
      savedSearchRemovedHandler as (event: CustomEvent) => void
    )
  })
}