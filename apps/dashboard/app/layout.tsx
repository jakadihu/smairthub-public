import "./globals.css"
import { ReactNode } from "react"

export const metadata = {
  title: "SmairtHub Dashboard",
  description: "Excel AI modul és admin felület"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hu">
      <body className="bg-gray-100 text-gray-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r p-6 hidden md:block">
            <h1 className="text-2xl font-bold mb-8">SmairtHub</h1>

            <nav className="space-y-4">
              <a href="/" className="block text-gray-700 hover:text-black">
                Dashboard
              </a>
              <a href="/excel" className="block text-gray-700 hover:text-black">
                Excel AI modul
              </a>
              <a href="/settings" className="block text-gray-700 hover:text-black">
                Beállítások
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {/* Topbar */}
            <header className="bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">SmairtHub Dashboard</h2>

              {/* Language switch placeholder */}
              <div className="flex items-center gap-4 text-gray-600">
                <button className="hover:text-black">HU</button>
                <button className="hover:text-black">EN</button>
              </div>
            </header>

            {/* Page content */}
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
