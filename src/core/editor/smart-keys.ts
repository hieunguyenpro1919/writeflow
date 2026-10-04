import { Extension } from '@tiptap/core';
import { setBlockType, lift } from '@tiptap/pm/commands';
import { liftListItem } from '@tiptap/pm/schema-list';

/**
 * SmartKeysExtension handles intelligent Enter and Backspace behaviors (Task 1.9 / Plan 7.2):
 * - Backspace at start of heading converts it to a regular paragraph before merging.
 * - Backspace at start of first list item lifts it out of the list without deleting preceding text.
 * - Backspace at start of first blockquote child lifts it out of the quote without deleting preceding text.
 */
export const SmartKeysExtension = Extension.create({
  name: 'smartKeys',

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const event =
          typeof window !== 'undefined' ? (window.event as KeyboardEvent | undefined) : undefined;
        const isComposing = Boolean(event?.isComposing);
        const isImeKeyCode = event?.keyCode === 229;

        // IME Protection: Never intercept Backspace while typing with IME (Unikey/EVKey composition)
        if (this.editor.view.composing || isComposing || isImeKeyCode) {
          return false;
        }

        const { state, dispatch } = this.editor.view;
        const { selection } = state;

        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;

        // 1. Backspace at start of heading -> convert to paragraph (Task 1.9 behavior 4)
        if ($from.parent.type.name === 'heading' && $from.parentOffset === 0) {
          return setBlockType(state.schema.nodes.paragraph)(state, dispatch);
        }

        // 2. Backspace at start of list item -> lift list item out of list (Task 1.9 behavior 5)
        if (state.schema.nodes.listItem && $from.parentOffset === 0) {
          let inListItem = false;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type === state.schema.nodes.listItem) {
              if ($from.index(d) === 0) {
                inListItem = true;
              }
              break;
            }
          }
          if (inListItem) {
            if (liftListItem(state.schema.nodes.listItem)(state, dispatch)) {
              return true;
            }
          }
        }

        // 3. Backspace at start of blockquote -> lift block out of blockquote (Task 1.9 behavior 5)
        if (state.schema.nodes.blockquote && $from.parentOffset === 0) {
          let inBlockquote = false;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type === state.schema.nodes.blockquote) {
              if ($from.index(d) === 0) {
                inBlockquote = true;
              }
              break;
            }
          }
          if (inBlockquote) {
            if (lift(state, dispatch)) {
              return true;
            }
          }
        }

        return false;
      },
    };
  },
});
