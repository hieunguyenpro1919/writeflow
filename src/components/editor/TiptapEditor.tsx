import React from 'react';
import { EditorContent, type Editor } from '@tiptap/react';

interface TiptapEditorProps {
  editor: Editor | null;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ editor }) => {
  return (
    <div className="editor-paper" data-testid="editor-paper">
      <EditorContent editor={editor} data-testid="tiptap-editor-content" />
    </div>
  );
};
