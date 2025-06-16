// DataTable.tsx - Dedicated table component for list card

import React from "react";
import { dataSourceConfig, formatValue } from "../lib/chartConfig.js";

interface DataTableProps {
  currentData: any[];
  selectedMetric: string;
  selectedTable: string;
  granularity: string;
  groupBy: string;
  overlayActive?: boolean;
  overlayData?: any[] | null;
  overlayMetric?: string;
  overlayGroupBy?: string;
}

export function DataTable({
  currentData,
  selectedMetric,
  selectedTable,
  granularity,
  groupBy,
  overlayActive,
  overlayData,
  overlayMetric,
  overlayGroupBy,
}: DataTableProps) {
  console.log("DataTable received data:", currentData);
  console.log(
    "First row keys:",
    currentData.length > 0 ? Object.keys(currentData[0]) : []
  );

  // Merge overlay data if active
  const mergedData = React.useMemo(() => {
    if (!overlayActive || !overlayData || !currentData) {
      return currentData;
    }

    console.log("Merging data - primary:", currentData);
    console.log("Merging data - overlay:", overlayData);

    // Merge the data arrays
    return currentData.map((row, index) => {
      const overlayRow = overlayData[index];
      if (!overlayRow) return row;

      const merged = { ...row };

      // Add overlay columns based on overlay groupBy
      if (overlayGroupBy === "org") {
        // For org view, only add the selected overlay metric
        merged[`${overlayMetric}_overlay`] = overlayRow[overlayMetric];
      } else {
        // For team/person view, add all columns
        Object.keys(overlayRow).forEach((key) => {
          if (key !== "name" && !key.endsWith("_hasData")) {
            merged[`${key}_overlay`] = overlayRow[key];
          }
        });
      }

      console.log("Merged row:", merged);
      return merged;
    });
  }, [currentData, overlayData, overlayActive, overlayGroupBy, overlayMetric]);

  // Use merged data if overlay is active
  const dataToDisplay = overlayActive && overlayData ? mergedData : currentData;

  // Extract column keys based on groupBy
  const primaryColumnKeys =
    dataToDisplay.length > 0
      ? Object.keys(dataToDisplay[0]).filter((key) => {
          // For org view, we'll handle this differently
          if (groupBy === "org") {
            return false; // No dynamic columns for org view
          }
          // For other views, show all keys except 'name', '_hasData', and overlay columns
          return (
            key !== "name" &&
            !key.endsWith("_hasData") &&
            !key.endsWith("_overlay")
          );
        })
      : [];

  // Extract overlay column keys
  const overlayColumnKeys =
    overlayActive && dataToDisplay.length > 0
      ? Object.keys(dataToDisplay[0]).filter((key) => {
          // Always show overlay columns, regardless of groupBy
          return key.endsWith("_overlay") && !key.endsWith("_hasData");
        })
      : [];

  // Combine all columns
  const columnKeys = [...primaryColumnKeys, ...overlayColumnKeys];

  console.log("GroupBy:", groupBy);
  console.log("Column keys for table:", columnKeys);

  const config = dataSourceConfig[selectedTable];
  const column = config.tableColumns.find((c) => c.key === selectedMetric);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              {granularity === "monthly" ? "Date" : "Period"}
            </th>
            {groupBy === "org" && !overlayActive ? (
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                Organization
              </th>
            ) : groupBy === "org" && overlayActive ? (
              <>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  Organization
                </th>
                {overlayColumnKeys.map((key) => (
                  <th
                    key={key}
                    className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {key}
                  </th>
                ))}
              </>
            ) : (
              columnKeys.map((key) => (
                <th
                  key={key}
                  className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                >
                  {key}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {dataToDisplay.map((row, index) => (
            <tr
              key={row.name}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                {row.name}
              </td>
              {groupBy === "org" && !overlayActive ? (
                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                  {formatValue(
                    row[selectedMetric],
                    column ? column.format : "number"
                  )}
                </td>
              ) : groupBy === "org" && overlayActive ? (
                <>
                  <td className="border border-gray-200 px-4 py-3 text-gray-700">
                    {formatValue(
                      row[selectedMetric],
                      column ? column.format : "number"
                    )}
                  </td>
                  {overlayColumnKeys.map((key) => (
                    <td
                      key={key}
                      className="border border-gray-200 px-4 py-3 text-gray-700"
                    >
                      {formatValue(row[key], "number")}
                    </td>
                  ))}
                </>
              ) : (
                columnKeys.map((key) => (
                  <td
                    key={key}
                    className="border border-gray-200 px-4 py-3 text-gray-700"
                  >
                    {formatValue(row[key], "number")}
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
