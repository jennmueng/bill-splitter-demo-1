import BillEditor from '@/components/BillEditor';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Bill Splitter</h1>
          <p className="text-gray-600 mt-1">Split bills easily with friends and family</p>
        </div>
      </header>

      <main className="py-6">
        <BillEditor />
      </main>
    </div>
  );
}
