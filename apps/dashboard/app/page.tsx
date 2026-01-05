export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Üdv a SmairtHub Dashboardon!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Excel AI modul</h2>
          <p className="text-gray-600 mb-4">
            Tölts fel egy Excel fájlt, és az AI megtisztítja, javítja, normalizálja.
          </p>
          <a
            href="/excel"
            className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Megnyitás
          </a>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Statisztikák</h2>
          <p className="text-gray-600">Hamarosan…</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Fiók</h2>
          <p className="text-gray-600">Beállítások, profil, előfizetés.</p>
        </div>
      </div>
    </div>
  )
}
