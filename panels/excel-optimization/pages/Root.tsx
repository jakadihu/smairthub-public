import Uploader from "./Uploader"

export function ExcelOptimizationRootPage({ locale }: { locale: string }) {
  return (
    <div>
      <h1 className="text-blue-300">Excel optimalizálás</h1>
      <p>Ez a modul főoldala.</p>

      <Uploader />
    </div>
  )
}
