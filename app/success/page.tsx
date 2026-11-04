'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-gray-700">
      <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold mb-2">Uspešno plaćanje!</h1>
      <p className="text-gray-300 mb-6">
        Hvala vam što ste izabrali DiV.ai. Vaša pretplata je uspešno aktivirana.
      </p>
      
      {sessionId && (
        <p className="text-xs text-gray-500 mb-6 break-all">
          ID sesije: {sessionId}
        </p>
      )}

      <Link
        href="/"
        className="inline-block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition duration-200"
      >
        Nazad na početnu stranu
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <Suspense fallback={<div className="text-white">Učitavanje...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}