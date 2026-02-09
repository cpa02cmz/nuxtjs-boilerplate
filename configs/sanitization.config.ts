// Sanitization Configuration - XSS Protection Rules
// Flexy hates hardcoded values! All sanitization rules are now configurable.

/**
 * HTML tags that are forbidden during XSS sanitization
 * These tags are completely removed from content
 */
export const SANITIZE_FORBID_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'img',
  'link',
  'meta',
  'base',
  'basefont',
  'frame',
  'frameset',
  'ilayer',
  'layer',
  'bgsound',
  'title',
  'style',
  'svg',
  'audio',
  'video',
  'canvas',
  'applet',
  'area',
  'map',
  'param',
  'source',
  'track',
  'keygen',
  'output',
  'progress',
  'meter',
  'details',
  'summary',
  'menu',
  'menuitem',
  'dialog',
  'a',
  'strong',
  'b',
  'i',
  'em',
  'u',
  'span',
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'br',
  'hr',
] as const

/**
 * HTML attributes that are forbidden during XSS sanitization
 * These attributes are removed from all tags
 */
export const SANITIZE_FORBID_ATTR = [
  'src',
  'href',
  'style',
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onfocus',
  'onblur',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseup',
  'onwheel',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onseeked',
  'onseeking',
  'onstalled',
  'onsuspend',
  'ontimeupdate',
  'onvolumechange',
  'onwaiting',
  'onafterprint',
  'onbeforeprint',
  'onbeforeunload',
  'onerror',
  'onhashchange',
  'onload',
  'onmessage',
  'onoffline',
  'ononline',
  'onpagehide',
  'onpageshow',
  'onpopstate',
  'onresize',
  'onscroll',
  'onstorage',
  'onunload',
  'data',
  'formaction',
  'xmlns',
  'xlink:href',
  'usemap',
  'ismap',
  'action',
  'code',
  'codebase',
  'classid',
  'pluginspage',
  'pluginurl',
  'declare',
  'standby',
  'id',
  'name',
] as const

/**
 * HTML tag contents that are forbidden during XSS sanitization
 * Content within these tags is removed
 */
export const SANITIZE_FORBID_CONTENTS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'img',
  'link',
  'meta',
  'base',
  'basefont',
  'frame',
  'frameset',
  'ilayer',
  'layer',
  'bgsound',
  'title',
  'style',
  'svg',
] as const

/**
 * HTML tags that are explicitly allowed during sanitization
 * These tags are preserved in the output
 */
export const SANITIZE_ALLOWED_TAGS = ['mark'] as const

/**
 * HTML attributes that are explicitly allowed during sanitization
 * These attributes are preserved in the output
 */
export const SANITIZE_ALLOWED_ATTR = ['class'] as const

/**
 * Dangerous URL protocols that are stripped during sanitization
 */
export const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
] as const

/**
 * Dangerous patterns that are removed during sanitization
 */
export const DANGEROUS_PATTERNS = {
  // Script tags with content
  scriptWithContent: /(\s*)<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>(\s*)/gi,
  // Self-closing script tags
  scriptSelfClosing: /<\s*script[^>]*\/?\s*>/gi,
  // Dangerous tags (iframe, object, embed, etc.)
  dangerousTagsPaired:
    /(\s*)<\s*(iframe|object|embed|form|input|button|img|link|meta|base|basefont|frame|frameset|ilayer|layer|bgsound|title|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>(\s*)/gi,
  // Self-closing dangerous tags
  dangerousTagsSelfClosing:
    /(\s*)<\s*(iframe|object|embed|form|input|button|img|link|meta|base|basefont|frame|frameset|ilayer|layer|bgsound|title|style)[^>]*\/?\s*>(\s*)/gi,
  // SVG tags with content
  svgWithContent: /<\s*svg[^>]*>[\s\S]*?<\s*\/\s*svg\s*>/gi,
  // Self-closing SVG tags
  svgSelfClosing: /<\s*svg[^>]*\/?\s*>/gi,
  // HTML comments
  htmlComments: /<!--[\s\S]*?-->/g,
  // HTML declarations
  htmlDeclarations: /<![\s\S]*?>/g,
  // Anchor tags (remove but preserve content)
  anchorTags: /<\s*a[^>]*>([\s\S]*?)<\s*\/\s*a\s*>/gi,
  // Self-closing anchor tags
  anchorSelfClosing: /<\s*a[^>]*\/?\s*>/gi,
  // Event handlers
  eventHandlers: /on\w+\s*=/gi,
  // Decimal HTML entities
  htmlEntitiesDecimal: /&#(\d+);?/g,
  // Hex HTML entities
  htmlEntitiesHex: /&#[xX]([0-9a-fA-F]+);?/g,
  // Multiple whitespace
  multipleWhitespace: /\s+/g,
} as const

// Type exports
export type SanitizeForbidTags = typeof SANITIZE_FORBID_TAGS
export type SanitizeForbidAttr = typeof SANITIZE_FORBID_ATTR
export type SanitizeForbidContents = typeof SANITIZE_FORBID_CONTENTS
export type SanitizeAllowedTags = typeof SANITIZE_ALLOWED_TAGS
export type SanitizeAllowedAttr = typeof SANITIZE_ALLOWED_ATTR
export type DangerousProtocols = typeof DANGEROUS_PROTOCOLS
export type DangerousPatterns = typeof DANGEROUS_PATTERNS
