import katex from 'katex';

export function KatexInline({ math, displayMode = false }: { math: string; displayMode?: boolean }) {
  const html = katex.renderToString(math, {
    displayMode,
    throwOnError: false,
    output: 'html',
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
