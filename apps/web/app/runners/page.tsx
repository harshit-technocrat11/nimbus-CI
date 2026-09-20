'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RunnersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/runs');
  }, [router]);

  return (
    <div className="py-12 text-center text-xs text-[#8B949E]">
      Redirecting to Workflow Runs...
    </div>
  );
}
