export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 p-8 max-w-4xl text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Predik
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300">
          Prediction Markets para Latinoamérica
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Predice el futuro de tus eventos favoritos: deportes, política,
          entretenimiento y más.
        </p>
        <div className="flex gap-4 mt-8">
          <a
            href="https://app.predik.io"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Comenzar a Predecir
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Cómo Funciona
          </a>
        </div>
      </main>
    </div>
  );
}
