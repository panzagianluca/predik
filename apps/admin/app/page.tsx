export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Predik Admin Panel
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Comment Moderation</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve user comments
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Market Metadata</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Spanish translations and categories
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage platform announcements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
