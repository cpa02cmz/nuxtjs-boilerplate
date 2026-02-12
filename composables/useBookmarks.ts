import { ref, computed, readonly, onMounted, getCurrentInstance } from 'vue'
import { createStorageWithDateSerialization } from '~/utils/storage'
import { emitEvent } from '~/utils/event-emitter'
import { STORAGE_KEYS } from '~/server/utils/constants'
import { patternsConfig } from '~/configs/patterns.config'
import { bookmarksConfig } from '~/configs/bookmarks.config'
import { dateConfig } from '~/configs/date.config'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  addedAt: Date
  notes?: string
  category?: string
}

const BOOKMARKS_STORAGE_KEY = STORAGE_KEYS.BOOKMARKS
const storage = createStorageWithDateSerialization<Bookmark[]>(
  BOOKMARKS_STORAGE_KEY,
  []
)

let bookmarksRef: Ref<Bookmark[]> | null = null

export const resetBookmarksState = () => {
  if (bookmarksRef) {
    bookmarksRef.value = []
    bookmarksRef = null
  }
  storage.remove()
}

export const resetBookmarks = () => {
  if (bookmarksRef) {
    bookmarksRef.value.length = 0
    bookmarksRef = null
  }
  if (typeof window !== 'undefined') {
    storage.remove()
  }
}

export const useBookmarks = () => {
  const bookmarks = bookmarksRef || ref<Bookmark[]>([])
  bookmarksRef = bookmarks

  const initBookmarks = () => {
    if (typeof window !== 'undefined') {
      bookmarks.value = storage.get()
    }
  }

  // Initialize on client-side immediately if not already initialized
  // This handles both SSR (onMounted) and test environments
  if (typeof window !== 'undefined' && bookmarks.value.length === 0) {
    initBookmarks()
  }

  // Also initialize on mount for SSR hydration safety
  // Only call onMounted if there's an active Vue instance (not in test environment)
  const instance = getCurrentInstance()
  if (instance && instance.type && typeof instance.type === 'object') {
    onMounted(() => {
      initBookmarks()
    })
  }

  const saveBookmarks = () => {
    storage.set(bookmarks.value)
    emitEvent('bookmarksUpdated')
  }

  const isBookmarked = (resourceId: string) => {
    return bookmarks.value.some(bookmark => bookmark.id === resourceId)
  }

  const addBookmark = (resource: {
    id: string
    title: string
    description: string
    url: string
  }) => {
    if (isBookmarked(resource.id)) return

    const newBookmark: Bookmark = {
      ...resource,
      addedAt: new Date(),
    }

    bookmarks.value.push(newBookmark)
    saveBookmarks()
  }

  const removeBookmark = (resourceId: string) => {
    const index = bookmarks.value.findIndex(
      bookmark => bookmark.id === resourceId
    )
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

  const toggleBookmark = (resource: {
    id: string
    title: string
    description: string
    url: string
  }) => {
    if (isBookmarked(resource.id)) {
      removeBookmark(resource.id)
    } else {
      addBookmark(resource)
    }
  }

  const updateBookmarkNotes = (resourceId: string, notes: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.notes = notes
      saveBookmarks()
    }
  }

  const updateBookmarkCategory = (resourceId: string, category: string) => {
    const bookmark = bookmarks.value.find(
      bookmark => bookmark.id === resourceId
    )
    if (bookmark) {
      bookmark.category = category
      saveBookmarks()
    }
  }

  const getAllBookmarks = computed(() => {
    return [...bookmarks.value].sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime()
    )
  })

  const getBookmarksByCategory = (category: string) => {
    return bookmarks.value.filter(bookmark => bookmark.category === category)
  }

  const bookmarkCount = computed(() => bookmarks.value.length)

  const exportBookmarks = () => {
    if (typeof document === 'undefined') return

    const bookmarksToExport = bookmarks.value.map(bookmark => ({
      ...bookmark,
      addedAt: bookmark.addedAt.toISOString(),
    }))

    // Flexy hates hardcoded values! Use configurable JSON indent
    const dataStr = JSON.stringify(
      bookmarksToExport,
      null,
      bookmarksConfig.export.jsonIndentSpaces
    )
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    // Format date for filename - Flexy hates hardcoded date slicing!
    const now = new Date()
    let dateStr: string
    if (dateConfig.exportFilename.format === 'YYYY-MM-DD') {
      dateStr = now.toISOString().split('T')[0]
    } else if (dateConfig.exportFilename.format === 'YYYYMMDD') {
      dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
    } else {
      dateStr = now.toISOString().split('T')[0]
    }

    const exportFileDefaultName =
      patternsConfig.export.bookmarksFilenameTemplate.replace('{date}', dateStr)

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importBookmarks = (importedBookmarks: Bookmark[]) => {
    try {
      const validBookmarks = importedBookmarks.filter(
        bookmark => bookmark.id && bookmark.title && bookmark.url
      )

      const processedBookmarks = validBookmarks.map(bookmark => ({
        ...bookmark,
        addedAt: new Date(bookmark.addedAt),
      }))

      const uniqueBookmarks = [...bookmarks.value]
      for (const newBookmark of processedBookmarks) {
        if (!uniqueBookmarks.some(b => b.id === newBookmark.id)) {
          uniqueBookmarks.push(newBookmark)
        }
      }

      bookmarks.value = uniqueBookmarks
      saveBookmarks()
      return true
    } catch {
      return false
    }
  }

  const clearBookmarks = () => {
    bookmarks.value = []
    saveBookmarks()
  }

  return {
    bookmarks: readonly(bookmarks),
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    updateBookmarkNotes,
    updateBookmarkCategory,
    getAllBookmarks,
    getBookmarksByCategory,
    bookmarkCount,
    exportBookmarks,
    importBookmarks,
    clearBookmarks,
    initBookmarks,
  }
}
