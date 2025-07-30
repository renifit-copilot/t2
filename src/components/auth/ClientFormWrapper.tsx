'use client';

import dynamic from 'next/dynamic';

// ⚠️  ssr:false → компонент никогда не рендерится на сервере :contentReference[oaicite:1]{index=1}
const ClientForm = dynamic(() => import('./ClientForm').then(mod => mod.ClientForm), {
  ssr: false,
});


export default function ClientFormWrapper() {
  return <ClientForm />;
}
