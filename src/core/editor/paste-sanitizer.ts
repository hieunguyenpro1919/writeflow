import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

const DANGEROUS =
  'script,style,iframe,object,embed,video,audio,svg,form,input,textarea,select,option,button,link,meta,base,canvas,portal,frame,frameset'.split(
    ',',
  );
const RAW =
  'data-raw-block,data-raw-format,data-raw-inline,data-raw-content,data-raw-source,data-raw-comment,data-raw-html-tag'.split(
    ',',
  );
const STRIP =
  'style,color,face,size,class,dir,align,valign,bgcolor,background,border,cellpadding,cellspacing'.split(
    ',',
  );

export function sanitizePastedHtml(html: string): string {
  if (typeof DOMParser === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  // 1. Remove dangerous DOM elements completely
  for (const tag of DANGEROUS) {
    body.querySelectorAll(tag).forEach((el) => el.remove());
  }

  // 2. Clean attributes on all remaining elements
  body.querySelectorAll('*').forEach((el) => {
    for (const attr of RAW) el.removeAttribute(attr);
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || STRIP.includes(name)) {
        el.removeAttribute(attr.name);
      } else if (name === 'href' || name === 'src') {
        const val = attr.value.trim().toLowerCase();
        if (
          val.startsWith('javascript:') ||
          val.startsWith('data:') ||
          val.startsWith('vbscript:')
        ) {
          el.removeAttribute(attr.name);
        }
      }
    }
  });

  return body.innerHTML;
}

export const PasteSanitizerExtension = Extension.create({
  name: 'pasteSanitizer',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedHTML(html: string) {
            return sanitizePastedHtml(html);
          },
          handleTextInput(view) {
            return view.composing;
          },
        },
      }),
    ];
  },
});
