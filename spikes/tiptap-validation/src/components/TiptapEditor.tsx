import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';

export interface ImeLogEntry {
  id: string;
  time: string;
  type: 'compositionstart' | 'compositionupdate' | 'compositionend' | 'keydown';
  data?: string;
  key?: string;
  isComposing: boolean;
}

interface TiptapEditorProps {
  onMarkdownChange: (markdown: string) => void;
  onImeStatusChange: (isComposing: boolean) => void;
  onImeLog: (entry: ImeLogEntry) => void;
  editorRef?: React.MutableRefObject<Editor | null>;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  onMarkdownChange,
  onImeStatusChange,
  onImeLog,
  editorRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        indentation: {
          style: 'space',
          size: 2,
        },
      }),
    ],
    content: `# Chào mừng đến với Spike Tiptap Validation

Hãy thử nghiệm:
1. **Spike S1:** Gõ tiếng Việt Telex/VNI bằng Unikey/EVKey bên dưới.
2. Kiểm tra xem gõ các ký tự tổ hợp như \`ă, â, ê, ô, ơ, ư, đ\` hoặc gõ \`# \`, \`- \`, \`* \` có bị vỡ chữ hay không.
3. **Spike S2:** Bấm nút **"Test Data Safety"** ở thanh công cụ phía trên để nạp Markdown kiểm tra.`,
    contentType: 'markdown',
    onUpdate: ({ editor }) => {
      // Compatibility with task card specification: editor.storage.markdown.getMarkdown()
      const rawMd = typeof editor.getMarkdown === 'function'
        ? editor.getMarkdown()
        : (editor.storage?.markdown as any)?.getMarkdown?.()
        || editor.storage?.markdown?.manager?.serialize(editor.getJSON())
        || '';
      onMarkdownChange(rawMd);
    },
    onCreate: ({ editor }) => {
      // Ensure storage compatibility
      if (editor.storage?.markdown && !(editor.storage.markdown as any).getMarkdown) {
        (editor.storage.markdown as any).getMarkdown = () => editor.getMarkdown();
      }
      const rawMd = editor.getMarkdown();
      onMarkdownChange(rawMd);
    },
  });

  // Keep editorRef updated
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Hook into IME composition events on editor DOM
  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    const handleCompositionStart = (e: CompositionEvent) => {
      onImeStatusChange(true);
      onImeLog({
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        type: 'compositionstart',
        data: e.data,
        isComposing: true,
      });
    };

    const handleCompositionUpdate = (e: CompositionEvent) => {
      onImeStatusChange(true);
      onImeLog({
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        type: 'compositionupdate',
        data: e.data,
        isComposing: true,
      });
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      onImeStatusChange(false);
      onImeLog({
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        type: 'compositionend',
        data: e.data,
        isComposing: false,
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Track keystrokes during or around composition
      if (e.isComposing || ['#', '-', '*', ' ', 'Enter', 'Backspace'].includes(e.key)) {
        onImeLog({
          id: Math.random().toString(36).substring(2, 9),
          time: new Date().toLocaleTimeString(),
          type: 'keydown',
          key: e.key,
          isComposing: e.isComposing || editor.view.composing,
        });
      }
    };

    dom.addEventListener('compositionstart', handleCompositionStart);
    dom.addEventListener('compositionupdate', handleCompositionUpdate);
    dom.addEventListener('compositionend', handleCompositionEnd);
    dom.addEventListener('keydown', handleKeyDown);

    return () => {
      dom.removeEventListener('compositionstart', handleCompositionStart);
      dom.removeEventListener('compositionupdate', handleCompositionUpdate);
      dom.removeEventListener('compositionend', handleCompositionEnd);
      dom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, onImeStatusChange, onImeLog]);

  return (
    <div className="tiptap-container" ref={containerRef}>
      <div className="tiptap-header">
        <span>Khung Trái: Tiptap WYSIWYG Editor (StarterKit + Markdown)</span>
        <span style={{ fontSize: '11px', color: 'var(--editor-text-muted)' }}>
          ProseMirror Engine
        </span>
      </div>
      <div className="tiptap-scroll-area">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
