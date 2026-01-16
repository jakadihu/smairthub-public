"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

export default function Uploader() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Feltöltött fájlok:", acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  return (    
    <div
      {...getRootProps()}
      className={`
        rounded-xl p-10 cursor-pointer transition
        flex flex-col items-center justify-center text-center

        ${
          isDragActive
            ? "bg-blue-200 dark:bg-blue-900/40"
            : "bg-red-300 dark:bg-gray-700"
        }
      `}
    >
      <input {...getInputProps()} />

      <Upload
        className={`
          w-12 h-12 mb-4 transition
          ${
            isDragActive
              ? "text-blue-700 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-200"
          }
        `}
      />

      {isDragActive ? (
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          Dobd ide a fájlt…
        </p>
      ) : (
        <>
          <p className="text-gray-900 dark:text-gray-100 font-medium">
            Húzd ide az Excel/CSV fájlt
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
            vagy kattints a feltöltéshez
          </p>
        </>
      )}      
    </div>
  )
}
