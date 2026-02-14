/**
 * Utilities for Markdown Rendering and HTML Sanitization
 *
 * This module centralizes the use of markdown-it and DOMPurify
 * to avoid dependency on global window objects in multiple components.
 */

import DOMPurify from 'isomorphic-dompurify';
import MarkdownIt from 'markdown-it';

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

// Create a singleton instance of markdown-it
const markdownitInstance = new MarkdownIt(MARKDOWN_CONFIG);

/**
 * Creates a configured markdown-it instance
 * @returns Configured markdown-it instance
 */
export const createMarkdownIt = () => {
  return markdownitInstance;
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
