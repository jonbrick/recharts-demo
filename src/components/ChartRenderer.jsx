// ChartRenderer.jsx - Unified chart rendering component

import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  AreaChart as TremorAreaChart,
  LineChart as TremorLineChart,
} from "@tremor/react";
import { dataSourceConfig, formatValue } from "../lib/chartConfig.js";

const commonChartProps = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
};

const commonTooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

function AreaChartComponent({ currentData, selectedTable, selectedMetric }) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={currentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
        <Tooltip contentStyle={commonTooltipStyle} />
        <Legend />

        <Area
          type="monotone"
          dataKey={selectedMetric}
          stroke={metric.color}
          fill={metric.color}
          fillOpacity={0.8}
          strokeWidth={2}
          name={metric.label}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LineChartComponent({ currentData, selectedTable, selectedMetric }) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={currentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
        <Tooltip contentStyle={commonTooltipStyle} />
        <Legend />

        <Line
          type="monotone"
          dataKey={selectedMetric}
          stroke={metric.color}
          strokeWidth={3}
          dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
          name={metric.label}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function VerticalBarChartComponent({
  currentData,
  selectedTable,
  selectedMetric,
}) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={currentData} {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
        <Tooltip contentStyle={commonTooltipStyle} />
        <Legend />

        <Bar dataKey={selectedMetric} fill={metric.color} name={metric.label} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChartComponent({
  currentData,
  selectedTable,
  selectedMetric,
}) {
  const config = dataSourceConfig[selectedTable];
  const metric = [...config.metrics, config.overlayMetric].find(
    (m) => m.key === selectedMetric
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        layout="vertical"
        data={currentData}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          type="number"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#666" }}
          axisLine={{ stroke: "#ccc" }}
          width={70}
        />
        <Tooltip contentStyle={commonTooltipStyle} />
        <Legend />

        <Bar dataKey={selectedMetric} fill={metric.color} name={metric.label} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TableComponent({
  currentData,
  selectedTable,
  selectedMetric,
  granularity,
}) {
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
            <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
              {column ? column.label : metric.label}
            </th>
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
              <td className="border border-gray-200 px-4 py-3 text-gray-700">
                {formatValue(
                  row[selectedMetric],
                  column ? column.format : "number"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-sm text-gray-600 text-center">
        💡 Pattern 1: Single metric ({metric.label}) over time
      </div>
    </div>
  );
}

export function ChartRenderer({
  chartType,
  currentData,
  selectedTable,
  selectedMetric,
  granularity,
}) {
  // Add Tremor chart components
  function TremorAreaChartComponent({
    currentData,
    selectedTable,
    selectedMetric,
  }) {
    const config = dataSourceConfig[selectedTable];
    const metric = [...config.metrics, config.overlayMetric].find(
      (m) => m.key === selectedMetric
    );

    return (
      <div className="h-96">
        <TremorAreaChart
          data={currentData}
          index="name"
          categories={[selectedMetric]}
          colors={["blue"]}
          valueFormatter={(value) => value.toFixed(1)}
          className="h-full"
        />
        <div className="mt-4 text-sm text-gray-600 text-center">
          🔥 Tremor Area Chart - {metric.label}
        </div>
      </div>
    );
  }

  function TremorLineChartComponent({
    currentData,
    selectedTable,
    selectedMetric,
  }) {
    const config = dataSourceConfig[selectedTable];
    const metric = [...config.metrics, config.overlayMetric].find(
      (m) => m.key === selectedMetric
    );

    return (
      <div className="h-96">
        <TremorLineChart
          data={currentData}
          index="name"
          categories={[selectedMetric]}
          colors={["emerald"]}
          valueFormatter={(value) => value.toFixed(1)}
          className="h-full"
        />
        <div className="mt-4 text-sm text-gray-600 text-center">
          🔥 Tremor Line Chart - {metric.label}
        </div>
      </div>
    );
  }

  const chartComponents = {
    area: AreaChartComponent,
    line: LineChartComponent,
    "vertical-bar": VerticalBarChartComponent,
    "horizontal-bar": HorizontalBarChartComponent,
    table: TableComponent,
    "tremor-area": TremorAreaChartComponent,
    "tremor-line": TremorLineChartComponent,
  };
  const Component = chartComponents[chartType];

  if (!Component) {
    return <div>Chart type not supported</div>;
  }

  return (
    <Component
      currentData={currentData}
      selectedTable={selectedTable}
      selectedMetric={selectedMetric}
      granularity={granularity}
    />
  );
}
