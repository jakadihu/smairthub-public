import { modules } from "@modules/registry";

export default function ModulesPage() {
  return (
    <div className="grid grid-cols-3 gap-6 p-8">
      {modules.map((mod) => (
        <div
          key={mod.meta.id}
          className="border rounded-lg p-4 shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{mod.meta.name}</h2>
          <p className="text-gray-600 mb-4">{mod.meta.description}</p>

          <mod.Component />
        </div>
      ))}
    </div>
  );
}
