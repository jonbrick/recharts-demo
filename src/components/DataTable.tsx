// DataTable.tsx - Dedicated table component for list card

import React from "react";
import { dataSourceConfig, formatValue } from "../lib/chartConfig.js";

interface DataTableProps {
  currentData: any[];
  selectedMetric: string;
  selectedTable: string;
  granularity: string;
  groupBy: string;
}

export function DataTable({
  currentData,
  selectedMetric,
  selectedTable,
  granularity,
  groupBy,
}: DataTableProps) {
  console.log("DataTable received data:", currentData);
  console.log(
    "First row keys:",
    currentData.length > 0 ? Object.keys(currentData[0]) : []
  );

  // Extract column keys based on groupBy
  const columnKeys =
    currentData.length > 0
      ? Object.keys(currentData[0]).filter((key) => {
          // For org view, we'll handle this differently
          if (groupBy === "org") {
            return false; // No dynamic columns for org view
          }
          // For other views, show all keys except 'name' and '_hasData'
          return key !== "name" && !key.endsWith("_hasData");
        })
      : [];

  console.log("GroupBy:", groupBy);
  console.log("Column keys for table:", columnKeys);

  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );
  const column = config.tableColumns.find((c) => c.key === selectedMetric);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              {granularity === "monthly" ? "Date" : "Period"}
            </th>
            {groupBy === "org" ? (
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                Organization
              </th>
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
          {currentData.map((row, index) => (
            <tr
              key={row.name}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                {row.name}
              </td>
              {groupBy === "org" ? (
                <td className="border border-gray-200 px-4 py-3 text-gray-700">
                  {formatValue(
                    row[selectedMetric],
                    column ? column.format : "number"
                  )}
                </td>
              ) : (
                columnKeys.map((key) => (
                  <td
                    key={key}
                    className="border border-gray-200 px-4 py-3 text-gray-700"
                  >
                    {formatValue(row[key], column ? column.format : "number")}
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
