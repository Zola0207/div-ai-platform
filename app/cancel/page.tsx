import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-gray-700">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ✕
        </div>
        <h1 className="text-2xl font-bold mb-2">Plaćanje otkazano</h1>
        <p className="text-gray-300 mb-6">
          Proces plaćanja je prekinut. Ništa vam nije naplaćeno. Možete pokušati ponovo kada god budete spremni.
        </p>
        
        <Link
          href="/"
          className="inline-block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition duration-200"
        >
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
}