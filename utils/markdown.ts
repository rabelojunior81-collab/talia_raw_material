/**
 * Utilities for Markdown Rendering and HTML Sanitization
 *
 * This module centralizes the use of markdown-it and DOMPurify
 * to avoid dependency on global window objects in multiple components.
 */

import DOMPurify from 'isomorphic-dompurify';

// Re-export DOMPurify for direct use if needed
export { DOMPurify };

/**
 * Configuration for markdown-it
 */
export const MARKDOWN_CONFIG = {
  html: true,
  linkify: true,
  typographer: true,
} as const;

/**
 * Creates a configured markdown-it instance
 * @returns Configured markdown-it instance
 */
export const createMarkdownIt = () => {
  const markdownit = (window as any).markdownit;
  if (!markdownit) {
    throw new Error('markdownit not available on window object');
  }

  return markdownit(MARKDOWN_CONFIG);
};

/**
 * Renders Markdown to HTML and sanitizes it
 * @param markdown - The markdown text to render
 * @returns Sanitized HTML string
 */
export const renderMarkdown = (markdown: string): string => {
  const md = createMarkdownIt();
  return DOMPurify.sanitize(md.render(markdown));
};

/**
 * Checks if DOMPurify is available
 * @returns True if DOMPurify is available, false otherwise
 */
export const isDOMPurifyAvailable = (): boolean => {
  return typeof (window as any).DOMPurify !== 'undefined';
};

/**
 * Checks if markdownit is available
 * @returns True if markdownit is available, false otherwise
 */
export const isMarkdownitAvailable = (): boolean => {
  return typeof (window as any).markdownit !== 'undefined';
};
