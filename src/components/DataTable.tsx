// DataTable.tsx - Dedicated table component for list card

import React from "react";
import { dataSourceConfig, formatValue } from "../lib/chartConfig.js";

// Helper function to get column label
function getColumnLabel(
  key: string,
  groupBy: string,
  selectedTable: string,
  selectedMetric: string,
  overlayTable?: string,
  overlayMetric?: string,
  overlayGroupBy?: string
): string {
  // Check if it's an overlay column
  if (key.endsWith("_overlay")) {
    const baseKey = key.replace("_overlay", "");

    // Get overlay metric label
    if (overlayTable && overlayMetric) {
      const overlayConfig = dataSourceConfig[overlayTable];
      const metricConfig = [
        ...overlayConfig.metrics,
        overlayConfig.overlayMetric,
      ].find((m) => m?.key === overlayMetric);
      const metricLabel = metricConfig?.label || overlayMetric;

      // For org overlay
      if (overlayGroupBy === "org") {
        return `${metricLabel} - Organization`;
      }

      // For team/person overlay
      if (baseKey === overlayMetric) {
        return `${metricLabel} - Organization`;
      }

      return `${metricLabel} - ${baseKey}`;
    }
  }

  // For primary columns
  const config = dataSourceConfig[selectedTable];
  const metricLabel =
    config.metrics.find((m) => m.key === selectedMetric)?.label ||
    config.overlayMetric?.label ||
    selectedMetric;

  // For org view
  if (groupBy === "org") {
    return `${metricLabel} - Organization`;
  }

  // For team/person view
  return `${metricLabel} - ${key}`;
}

interface DataTableProps {
  currentData: any[];
  selectedMetric: string;
  selectedTable: string;
  granularity: string;
  groupBy: string;
  viewMode?: string;
  rawData?: any[];
  overlayActive?: boolean;
  overlayData?: any[] | null;
  overlayMetric?: string;
  overlayTable?: string;
  overlayGroupBy?: string;
}

export function DataTable({
  currentData,
  selectedMetric,
  selectedTable,
  granularity,
  groupBy,
  viewMode = "day",
  rawData,
  overlayActive,
  overlayData,
  overlayMetric,
  overlayTable,
  overlayGroupBy,
}: DataTableProps) {
  // Check if we're in record view
  if (viewMode === "record" && rawData) {
    return (
      <RecordTable
        data={rawData}
        selectedTable={selectedTable}
        groupBy={groupBy}
      />
    );
  }

  // Merge overlay data if active
  const mergedData = React.useMemo(() => {
    if (!overlayActive || !overlayData || !currentData) {
      return currentData;
    }

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
                  {(() => {
                    const config = dataSourceConfig[selectedTable];
                    const metricLabel =
                      config.metrics.find((m) => m.key === selectedMetric)
                        ?.label ||
                      config.overlayMetric?.label ||
                      selectedMetric;
                    return `${metricLabel} - Organization`;
                  })()}
                </th>
                {overlayColumnKeys.map((key) => (
                  <th
                    key={key}
                    className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {getColumnLabel(
                      key,
                      groupBy,
                      selectedTable,
                      selectedMetric,
                      overlayTable,
                      overlayMetric,
                      overlayGroupBy
                    )}
                  </th>
                ))}
              </>
            ) : (
              columnKeys.map((key) => (
                <th
                  key={key}
                  className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
                >
                  {getColumnLabel(
                    key,
                    groupBy,
                    selectedTable,
                    selectedMetric,
                    overlayTable,
                    overlayMetric,
                    overlayGroupBy
                  )}
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

// RecordTable component for showing raw records
interface RecordTableProps {
  data: any[];
  selectedTable: string;
  groupBy: string;
}

function RecordTable({ data, selectedTable, groupBy }: RecordTableProps) {
  // Group records by the groupBy field
  const groupedData = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    data.forEach((record) => {
      let groupKey = "Unknown";

      if (groupBy === "org") {
        groupKey = "Organization";
      } else if (groupBy === "team") {
        groupKey = record.team || "Unknown";
      } else if (groupBy === "person") {
        groupKey = record.author || record.assigned_to || "Unknown";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });

    // Sort records within each group by date
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(a.created_at || a.deployed_at || 0).getTime() -
          new Date(b.created_at || b.deployed_at || 0).getTime()
      );
    });

    return groups;
  }, [data, groupBy]);

  // Sort group names alphabetically
  const sortedGroupNames = Object.keys(groupedData).sort();

  return (
    <div className="space-y-6">
      {sortedGroupNames.map((groupName) => (
        <div key={groupName}>
          <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
            {groupName} ({groupedData[groupName].length} records)
          </div>
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Author
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Team
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedData[groupName].map((record, index) => (
                <tr
                  key={record.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {record.id}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {new Date(
                      record.created_at || record.deployed_at
                    ).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {record.author || record.assigned_to || "N/A"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {record.team || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
