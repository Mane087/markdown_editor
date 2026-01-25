import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { Alert } from '../utils/types/alert';

export const alertExtension = {
  name: 'alert',
  level: 'block' as const,

  tokenizer(src: string): Alert | undefined {
    const match = src.match(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][\s\S]+?(?:\n\n|$)/);

    if (!match) return;

    const alertType = match[1].toLowerCase() as Alert['alertType'];
    const text = match[0]
      .replace(/^> \[!.*\]\n?/, '')
      .replace(/^> ?/gm, '')
      .trim();

    return {
      type: 'alert',
      raw: match[0],
      alertType,
      text,
    };
  },

  renderer(token: Alert): string {
    const inlineHtml = marked.parseInline(token.text, { async: false }) as string;
    const sanitizedText = DOMPurify.sanitize(inlineHtml, {
      USE_PROFILES: { html: true },
    });
    return `
    <div class="md-alert md-alert-${token.alertType}">
    <div class="md-alert-header">
        <strong class="md-alert-title">${token.alertType.toUpperCase()}</strong>
    </div>
    <div class="md-alert-content">
        ${sanitizedText}
    </div>
    </div>`;
  },
};
