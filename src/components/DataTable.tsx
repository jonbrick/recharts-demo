// DataTable.tsx - Dedicated table component for list card

import React from "react";
import { dataSourceConfig, formatValue } from "../lib/chartConfig.js";
import { generateDynamicLabel } from "../lib/chartUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";

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
      if (!overlayConfig) {
        return `${overlayMetric} - ${baseKey}`;
      }
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
  dateMode?: string;
  relativeDays?: number;
  selectedDateRange?: { from: Date; to: Date };
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
  dateMode,
  relativeDays,
  selectedDateRange,
}: DataTableProps) {
  // Generate dynamic label
  const dynamicLabel = generateDynamicLabel({
    selectedTable,
    selectedMetric,
    dateMode: dateMode || "relative",
    relativeDays: relativeDays || 14,
    selectedDateRange: selectedDateRange || {
      from: new Date(),
      to: new Date(),
    },
    groupBy,
    dataSourceConfig,
  });

  // Merge overlay data if active
  const mergedData = React.useMemo(() => {
    if (!overlayActive || !overlayData || !currentData) {
      return currentData;
    }

    // Merge the data arrays
    return currentData.map((row, index) => {
      const overlayRow = overlayData[index];
      if (!overlayRow) return row;

      // Filter out _hasData properties to prevent React DOM warnings
      const cleanRow = Object.fromEntries(
        Object.entries(row).filter(([key]) => !key.endsWith("_hasData"))
      );
      const merged = { ...cleanRow };

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
      ? Object.keys(dataToDisplay[0])
          .filter((key) => {
            if (groupBy === "org") {
              // Only show the selected metric for org view
              return key === `${selectedMetric}_display`;
            }
            // For other views, only show '_display' keys
            return key.endsWith("_display") && !key.endsWith("_overlay");
          })
          .map((key) => key.replace("_display", "")) // Remove suffix for clean names
      : [];

  // Extract overlay column keys
  const overlayColumnKeys =
    overlayActive && dataToDisplay.length > 0
      ? Object.keys(dataToDisplay[0]).filter((key) => {
          // Only show overlay columns that are not _display_overlay or _hasData
          return (
            key.endsWith("_overlay") &&
            !key.endsWith("_display_overlay") &&
            !key.endsWith("_hasData")
          );
        })
      : [];

  // Combine all columns
  const columnKeys = [...primaryColumnKeys, ...overlayColumnKeys];

  const config = dataSourceConfig[selectedTable];
  const column = config.tableColumns.find((c) => c.key === selectedMetric);

  // Check if we're in record view (moved to after all hooks)
  if (viewMode === "record" && rawData) {
    return (
      <div className="relative">
        <div className="text-sm text-gray-600 mb-2">{dynamicLabel}</div>
        <RecordTable
          data={rawData}
          selectedTable={selectedTable}
          groupBy={groupBy}
        />
      </div>
    );
  }

  // Default: return the day view table
  return (
    <div className="relative">
      <div className="text-sm text-gray-600 mb-4">{dynamicLabel}</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                {granularity === "monthly" ? "Date" : "Period"}
              </th>
              {groupBy === "org" && !overlayActive ? (
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  {(() => {
                    const config = dataSourceConfig[selectedTable];
                    const metricLabel =
                      config.metrics.find((m) => m.key === selectedMetric)
                        ?.label ||
                      config.overlayMetric?.label ||
                      selectedMetric;
                    return metricLabel;
                  })()}
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
                    {row[`${selectedMetric}_display`] ||
                      formatValue(
                        row[selectedMetric],
                        column ? column.format : "number"
                      )}
                  </td>
                ) : groupBy === "org" && overlayActive ? (
                  <>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">
                      {row[`${selectedMetric}_display`] ||
                        formatValue(
                          row[selectedMetric],
                          column ? column.format : "number"
                        )}
                    </td>
                    {overlayColumnKeys.map((key) => (
                      <td
                        key={key}
                        className="border border-gray-200 px-4 py-3 text-gray-700"
                      >
                        {row[key] !== undefined
                          ? formatValue(row[key], "number")
                          : ""}
                      </td>
                    ))}
                  </>
                ) : (
                  columnKeys.map((key) => (
                    <td
                      key={key}
                      className="border border-gray-200 px-4 py-3 text-gray-700"
                    >
                      {row[`${key}_display`] || formatValue(row[key], "number")}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  // Define columns based on data source (memoized to ensure consistent hook order)
  const columns = React.useMemo(() => {
    switch (selectedTable) {
      case "githubPR":
        return [
          { key: "id", label: "PR ID", format: "string" },
          { key: "created_at", label: "Created", format: "date" },
          { key: "author", label: "Author", format: "string" },
          { key: "team", label: "Team", format: "string" },
          { key: "lines_added", label: "Lines +", format: "number" },
          { key: "lines_removed", label: "Lines -", format: "number" },
          { key: "merged_at", label: "Merged", format: "date" },
          {
            key: "review_time_hours",
            label: "Review Time (hrs)",
            format: "decimal",
          },
        ];
      case "pagerDuty":
        return [
          { key: "id", label: "Incident ID", format: "string" },
          { key: "created_at", label: "Created", format: "date" },
          { key: "resolved_at", label: "Resolved", format: "date" },
          { key: "severity", label: "Severity", format: "string" },
          { key: "assigned_team", label: "Team", format: "string" },
          { key: "service", label: "Service", format: "string" },
          { key: "users_affected", label: "Users Affected", format: "number" },
        ];
      case "githubActions":
        return [
          { key: "id", label: "Deploy ID", format: "string" },
          { key: "deployed_at", label: "Deployed", format: "date" },
          { key: "status", label: "Status", format: "string" },
          { key: "author", label: "Author", format: "string" },
          { key: "team", label: "Team", format: "string" },
          { key: "repo", label: "Repository", format: "string" },
          {
            key: "duration_minutes",
            label: "Duration (min)",
            format: "decimal",
          },
          { key: "tests_run", label: "Tests Run", format: "number" },
        ];
      default:
        return [];
    }
  }, [selectedTable]);

  // Group records by the groupBy field
  const groupedData = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    data.forEach((record) => {
      let groupKey = "Unknown";

      if (groupBy === "org") {
        groupKey = "Organization";
      } else if (groupBy === "team") {
        groupKey = record.team || record.assigned_team || "Unknown";
      } else if (groupBy === "person") {
        groupKey = record.author || record.assigned_to || "Unknown";
      } else if (groupBy === "service") {
        groupKey = record.service || "Unknown";
      } else if (groupBy === "repo") {
        groupKey = record.repo || "Unknown";
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
    <Accordion
      type="multiple"
      className="space-y-2"
      defaultValue={sortedGroupNames}
    >
      {sortedGroupNames.map((groupName) => (
        <AccordionItem key={groupName} value={groupName}>
          <AccordionTrigger className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200">
            {groupName} ({groupedData[groupName].length} records)
          </AccordionTrigger>
          <AccordionContent>
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedData[groupName].map((record, index) => (
                  <tr
                    key={`${groupName}-${record.id}-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="border border-gray-200 px-4 py-2 text-sm"
                      >
                        {col.format === "date" && record[col.key]
                          ? new Date(record[col.key]).toLocaleDateString()
                          : col.format === "number" || col.format === "decimal"
                          ? formatValue(record[col.key], col.format)
                          : record[col.key] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
