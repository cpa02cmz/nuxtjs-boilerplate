import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard, type ClipboardResult } from '~/utils/clipboard'

describe('clipboard', () => {
  let mockClipboard: {
    writeText: ReturnType<typeof vi.fn>
  }
  let mockExecCommand: ReturnType<typeof vi.fn>
  let mockCreateElement: ReturnType<typeof vi.fn>
  let mockBody: {
    appendChild: ReturnType<typeof vi.fn>
    removeChild: ReturnType<typeof vi.fn>
  }
  let mockTextArea: {
    value: string
    setAttribute: ReturnType<typeof vi.fn>
    style: CSSStyleDeclaration
    select: ReturnType<typeof vi.fn>
    setSelectionRange: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn(),
    }
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    })

    // Mock execCommand
    mockExecCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      value: mockExecCommand,
      writable: true,
      configurable: true,
    })

    // Mock createElement and textarea
    mockTextArea = {
      value: '',
      setAttribute: vi.fn(),
      style: {} as CSSStyleDeclaration,
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    }

    mockCreateElement = vi.fn().mockReturnValue(mockTextArea)
    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true,
      configurable: true,
    })

    // Mock body
    mockBody = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    }
    Object.defineProperty(document, 'body', {
      value: mockBody,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('copyToClipboard', () => {
    it('should copy text using Clipboard API', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      const result: ClipboardResult = await copyToClipboard('test text')

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text')
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fallback to execCommand when Clipboard API fails', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )

      const result: ClipboardResult = await copyToClipboard('test text')

      expect(mockClipboard.writeText).toHaveBeenCalled()
      expect(mockCreateElement).toHaveBeenCalledWith('textarea')
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(result.success).toBe(true)
    })

    it('should fallback to execCommand when Clipboard API fails with unknown error', async () => {
      mockClipboard.writeText.mockRejectedValue('unknown error')

      const result: ClipboardResult = await copyToClipboard('test text')

      // Falls back to execCommand which succeeds in our mock
      expect(mockClipboard.writeText).toHaveBeenCalled()
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
      expect(result.success).toBe(true)
    })

    it('should return success false when execCommand fails', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )
      mockExecCommand.mockReturnValue(false)

      const result: ClipboardResult = await copyToClipboard('test text')

      expect(result.success).toBe(false)
      expect(result.error).toBe('execCommand copy failed')
    })

    it('should handle execCommand throwing an error', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )
      mockExecCommand.mockImplementation(() => {
        throw new Error('execCommand not supported')
      })

      const result: ClipboardResult = await copyToClipboard('test text')

      expect(result.success).toBe(false)
      expect(result.error).toBe('execCommand not supported')
    })

    it('should create textarea element with correct attributes', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )

      await copyToClipboard('test text')

      expect(mockCreateElement).toHaveBeenCalledWith('textarea')
      expect(mockTextArea.value).toBe('test text')
      expect(mockTextArea.setAttribute).toHaveBeenCalledWith('readonly', '')
    })

    it('should select text in textarea', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )

      await copyToClipboard('test text')

      expect(mockTextArea.select).toHaveBeenCalled()
      expect(mockTextArea.setSelectionRange).toHaveBeenCalledWith(0, 99999)
    })

    it('should append and remove textarea from body', async () => {
      mockClipboard.writeText.mockRejectedValue(
        new Error('Clipboard API not available')
      )

      await copyToClipboard('test text')

      expect(mockBody.appendChild).toHaveBeenCalledWith(mockTextArea)
      expect(mockBody.removeChild).toHaveBeenCalledWith(mockTextArea)
    })

    it('should handle empty string', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      const result: ClipboardResult = await copyToClipboard('')

      expect(mockClipboard.writeText).toHaveBeenCalledWith('')
      expect(result.success).toBe(true)
    })

    it('should handle special characters in text', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      const specialText = '<script>alert("xss")</script>'
      const result: ClipboardResult = await copyToClipboard(specialText)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(specialText)
      expect(result.success).toBe(true)
    })

    it('should handle multiline text', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined)

      const multilineText = 'Line 1\nLine 2\nLine 3'
      const result: ClipboardResult = await copyToClipboard(multilineText)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(multilineText)
      expect(result.success).toBe(true)
    })
  })
})
