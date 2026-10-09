import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-4xl font-extrabold text-indigo-600">404</h2>
        <h3 className="text-xl font-semibold text-slate-800">Page Not Found</h3>
        <p className="text-sm text-slate-500">
          The requested page could not be found or may have been moved.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
