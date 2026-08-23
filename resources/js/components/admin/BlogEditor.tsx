import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect } from 'react';

// UI Primitives
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import {
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';

// Tiptap Node
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// Tiptap UI
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import { ColorHighlightPopover } from '@/components/tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { LinkPopover } from '@/components/tiptap-ui/link-popover';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// Lib
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// Styles
import '@/components/tiptap-templates/simple/simple-editor.scss';

interface BlogEditorProps {
    value: string; // HTML content
    valueJson?: object | null; // JSON content (optional, preferred for editing)
    onChange: (data: { html: string; json: object }) => void;
    height?: number;
}

export default function BlogEditor({
    value,
    valueJson,
    onChange,
    height = 400,
}: BlogEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        editorProps: {
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                'aria-label': 'Blog content editor',
                class: 'simple-editor',
            },
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            ImageUploadNode.configure({
                accept: 'image/*',
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error('Upload failed:', error),
            }),
        ],
        // Prefer JSON content if available, otherwise use HTML
        content: valueJson || value,
        onUpdate: ({ editor }) => {
            onChange({
                html: editor.getHTML(),
                json: editor.getJSON(),
            });
        },
    });

    // Update editor content when value prop changes (e.g., from AI generation)
    useEffect(() => {
        if (!editor) return;

        // Prefer JSON if available, otherwise use HTML
        const newContent = valueJson || value;
        const currentContent = valueJson ? editor.getJSON() : editor.getHTML();

        if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
            editor.commands.setContent(newContent);
        }
    }, [value, valueJson, editor]);

    return (
        <div
            className="simple-editor-wrapper dark:border-zinc-700 dark:bg-zinc-900"
            style={{
                width: '100%',
                height: 'auto',
                overflow: 'visible',
                border: '1px solid',
                borderRadius: '0.5rem',
            }}
        >
            <EditorContext.Provider value={{ editor }}>
                <Toolbar className="dark:border-zinc-700 dark:bg-zinc-900">
                    <Spacer />

                    <ToolbarGroup>
                        <UndoRedoButton action="undo" />
                        <UndoRedoButton action="redo" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
                        <ListDropdownMenu
                            types={['bulletList', 'orderedList', 'taskList']}
                        />
                        <BlockquoteButton />
                        <CodeBlockButton />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="bold" />
                        <MarkButton type="italic" />
                        <MarkButton type="strike" />
                        <MarkButton type="code" />
                        <MarkButton type="underline" />
                        <ColorHighlightPopover />
                        <LinkPopover />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="superscript" />
                        <MarkButton type="subscript" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <TextAlignButton align="left" />
                        <TextAlignButton align="center" />
                        <TextAlignButton align="right" />
                        <TextAlignButton align="justify" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <ImageUploadButton text="Add Image" />
                    </ToolbarGroup>

                    <Spacer />
                </Toolbar>

                <EditorContent
                    editor={editor}
                    role="presentation"
                    className="simple-editor-content dark:text-zinc-100"
                    style={{
                        minHeight: `${height}px`,
                        maxWidth: '100%',
                        padding: '1rem',
                    }}
                />
            </EditorContext.Provider>
        </div>
    );
}
