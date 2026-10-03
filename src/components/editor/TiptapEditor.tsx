import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
  initialContent?: string;
  onUpdate?: (text: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ initialContent = '', onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getText());
    },
  });

  return (
    <div className="editor-paper" data-testid="editor-paper">
      <EditorContent editor={editor} data-testid="tiptap-editor-content" />
    </div>
  );
};
