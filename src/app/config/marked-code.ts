import hljs from 'highlight.js';
import type { Tokens } from 'marked';

export const codeExtension = {
  renderer: {
    code(token: Tokens.Code) {
      const { text, lang } = token;

      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(text, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      }

      const auto = hljs.highlightAuto(text).value;
      return `<pre><code class="hljs">${auto}</code></pre>`;
    },
  },
};
