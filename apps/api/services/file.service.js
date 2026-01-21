// services/file.service.js
import { inspectFile, processFile } from "../utils/fileHandlerRegistry.js";

function normalizeFileType(file) {
  const mime = file.mimetype;
  const name = file.originalname.toLowerCase();

  // Modern Excel (.xlsx)
  if (mime.includes("spreadsheetml") || name.endsWith(".xlsx")) {
    return "xlsx";
  }

  // Régi Excel (.xls)
  if (mime.includes("ms-excel") || name.endsWith(".xls")) {
    return "xls";
  }

  if (mime.includes("csv") || name.endsWith(".csv")) {
    return "csv";
  }

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    return "pdf";
  }

  return "unknown";
}


export async function handleFileInspect(req, res) {
  try {
    const file = req.file;
    const type = normalizeFileType(file);
    const meta = await inspectFile(file);

    res.json({
      type,
      sheets: meta.sheets || [],
      fileInfo: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Inspect failed" });
  }
}

export async function handleFileProcess(req, res) {
  try {
    const file = req.file;
    const { sheet, format } = req.body;

    const result = await processFile(file, { sheet, format });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Process failed" });
  }
}
