import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ImagesPageContent = dynamic(() => import('./ImagesPageContent'));

export default function Page() {
    return (
        <Suspense fallback={<div>Loading images...</div>}>
            <ImagesPageContent />
        </Suspense>
    );
}