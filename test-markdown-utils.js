// Teste rápido do utilitario markdown
try {
  console.log('Testing markdown utils...');
  const { renderMarkdown, isDOMPurifyAvailable, isMarkdownitAvailable } = await import('./utils/markdown.ts');
  console.log('isDOMPurifyAvailable:', isDOMPurifyAvailable());
  console.log('isMarkdownitAvailable:', isMarkdownitAvailable());
  console.log('Success!');
} catch (error) {
  console.error('Error:', error);
}
