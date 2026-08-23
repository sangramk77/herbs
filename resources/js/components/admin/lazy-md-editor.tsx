import type { MDEditorProps } from '@uiw/react-md-editor';
import { Suspense, lazy } from 'react';

import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = lazy(() => import('@uiw/react-md-editor'));

export default function LazyMDEditor(props: MDEditorProps) {
    return (
        <Suspense
            fallback={
                <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    Loading editor...
                </div>
            }
        >
            <MDEditor {...props} />
        </Suspense>
    );
}
