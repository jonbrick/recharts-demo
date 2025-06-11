import React, { useState, useEffect } from "react";
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

export default function App() {
  const [isStacked, setIsStacked] = useState(true);
  const [chartType, setChartType] = useState("area");
  const [granularity, setGranularity] = useState("monthly");

  const data = [
    {
      name: "Jun 2",
      pullRequests: 2,
      releases: 0,
      bugs: 1,
      features: 3,
      total: 6,
    },
    {
      name: "Jun 4",
      pullRequests: 2,
      releases: 0,
      bugs: 0,
      features: 2,
      total: 4,
    },
    {
      name: "Jun 6",
      pullRequests: 4,
      releases: 0,
      bugs: 2,
      features: 5,
      total: 11,
    },
    {
      name: "Jun 8",
      pullRequests: 2,
      releases: 0,
      bugs: 0,
      features: 2,
      total: 4,
    },
    {
      name: "Jun 9",
      pullRequests: 8,
      releases: 15,
      bugs: 3,
      features: 6,
      total: 32,
    },
  ];

  const allTimeData = [
    {
      name: "All Time",
      pullRequests: data.reduce((sum, row) => sum + row.pullRequests, 0),
      releases: data.reduce((sum, row) => sum + row.releases, 0),
      bugs: data.reduce((sum, row) => sum + row.bugs, 0),
      features: data.reduce((sum, row) => sum + row.features, 0),
      total: data.reduce((sum, row) => sum + row.total, 0),
    },
  ];

  // Check if current chart type supports All Time view
  const supportsAllTime = chartType !== "line" && chartType !== "area";

  // Get the current dataset based on granularity
  const currentData = granularity === "monthly" ? data : allTimeData;

  // Auto-switch to monthly if All Time is not supported
  useEffect(() => {
    if (!supportsAllTime && granularity === "all-time") {
      setGranularity("monthly");
    }
  }, [chartType, supportsAllTime, granularity]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Recharts: Interactive Chart Demo
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setIsStacked(!isStacked)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Switch to {isStacked ? "Overlapping" : "Stacked"} View
          </button>

          <button
            onClick={() =>
              setGranularity(granularity === "monthly" ? "all-time" : "monthly")
            }
            disabled={!supportsAllTime}
            className={`font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg ${
              supportsAllTime
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {supportsAllTime
              ? `Switch to ${
                  granularity === "monthly" ? "All Time" : "Monthly"
                } View`
              : "All Time View (Not available for trends)"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Development Activity Dashboard
            </h2>

            <p className="text-gray-600 mb-6">
              Engineering team activity metrics for June 2025
            </p>
          </div>

          <div className="ml-4">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm"
            >
              <option value="area">📈 Area Chart</option>
              <option value="line">📊 Line Chart</option>
              <option value="vertical-bar">📊 Vertical Bars</option>
              <option value="horizontal-bar">📊 Horizontal Bars</option>
              <option value="table">📋 Table View</option>
            </select>
          </div>
        </div>

        {isStacked && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 font-medium">Grand Total</div>
            <div className="text-3xl font-bold text-gray-800">
              {currentData
                .reduce((sum, row) => sum + row.total, 0)
                .toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {granularity === "monthly"
                ? "Sum of all activity types across all days"
                : "Sum of all activity types for the full period"}
            </div>
          </div>
        )}

        {chartType === "area" && (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />

              <Area
                type="monotone"
                dataKey="pullRequests"
                stackId={isStacked ? "1" : "pullRequests"}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={isStacked ? 0.8 : 0.4}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="releases"
                stackId={isStacked ? "1" : "releases"}
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={isStacked ? 0.8 : 0.4}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bugs"
                stackId={isStacked ? "1" : "bugs"}
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={isStacked ? 0.8 : 0.4}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="features"
                stackId={isStacked ? "1" : "features"}
                stroke="#ff7c7c"
                fill="#ff7c7c"
                fillOpacity={isStacked ? 0.8 : 0.4}
                strokeWidth={2}
              />

              {isStacked && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1e40af"
                  strokeWidth={4}
                  dot={{ fill: "#1e40af", strokeWidth: 2, r: 6 }}
                  strokeDasharray="8 4"
                  name="Total"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {chartType === "line" && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />

              <Line
                type="monotone"
                dataKey="pullRequests"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="releases"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="bugs"
                stroke="#ffc658"
                strokeWidth={3}
                dot={{ fill: "#ffc658", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="features"
                stroke="#ff7c7c"
                strokeWidth={3}
                dot={{ fill: "#ff7c7c", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "vertical-bar" && (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={currentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />

              <Bar
                dataKey="pullRequests"
                stackId={isStacked ? "1" : "pullRequests"}
                fill="#8884d8"
              />
              <Bar
                dataKey="releases"
                stackId={isStacked ? "1" : "releases"}
                fill="#82ca9d"
              />
              <Bar
                dataKey="bugs"
                stackId={isStacked ? "1" : "bugs"}
                fill="#ffc658"
              />
              <Bar
                dataKey="features"
                stackId={isStacked ? "1" : "features"}
                fill="#ff7c7c"
              />

              {isStacked && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1e40af"
                  strokeWidth={4}
                  dot={{ fill: "#1e40af", strokeWidth: 2, r: 6 }}
                  strokeDasharray="8 4"
                  name="Total"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {chartType === "horizontal-bar" && (
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />

              <Bar
                dataKey="pullRequests"
                stackId={isStacked ? "1" : "pullRequests"}
                fill="#8884d8"
              />
              <Bar
                dataKey="releases"
                stackId={isStacked ? "1" : "releases"}
                fill="#82ca9d"
              />
              <Bar
                dataKey="bugs"
                stackId={isStacked ? "1" : "bugs"}
                fill="#ffc658"
              />
              <Bar
                dataKey="features"
                stackId={isStacked ? "1" : "features"}
                fill="#ff7c7c"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    {granularity === "monthly" ? "Date" : "Period"}
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Pull Requests
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Releases
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Bug Fixes
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Features
                  </th>
                  {isStacked && (
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-blue-50">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, index) => {
                  const total =
                    row.pullRequests + row.releases + row.bugs + row.features;
                  return (
                    <tr
                      key={row.name}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                        {row.name}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">
                        {row.pullRequests.toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">
                        {row.releases.toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">
                        {row.bugs.toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">
                        {row.features.toLocaleString()}
                      </td>
                      {isStacked && (
                        <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900 bg-blue-50">
                          {total.toLocaleString()}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {isStacked && granularity === "monthly" && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-200 px-4 py-3 text-gray-900">
                      Totals
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-900">
                      {data
                        .reduce((sum, row) => sum + row.pullRequests, 0)
                        .toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-900">
                      {data
                        .reduce((sum, row) => sum + row.releases, 0)
                        .toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-900">
                      {data
                        .reduce((sum, row) => sum + row.bugs, 0)
                        .toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-900">
                      {data
                        .reduce((sum, row) => sum + row.features, 0)
                        .toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-900 bg-blue-100">
                      {data
                        .reduce(
                          (sum, row) =>
                            sum +
                            row.pullRequests +
                            row.releases +
                            row.bugs +
                            row.features,
                          0
                        )
                        .toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>

            <div className="mt-4 text-sm text-gray-600 text-center">
              {isStacked
                ? `💡 Stacked view: Shows individual values + totals (${
                    granularity === "monthly" ? "day by day" : "for all time"
                  })`
                : `💡 Individual view: Shows only individual activity values (${
                    granularity === "monthly" ? "day by day" : "for all time"
                  })`}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Visualization Controls & Data Granularity:
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-purple-600">📈 Area Charts:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Shows filled regions under lines</li>
              <li>• Great for showing volume/magnitude</li>
              <li>• Stacking works beautifully</li>
              <li>• Best for part-to-whole relationships</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-blue-600">📊 Line Charts:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Clean, focused on trends</li>
              <li>• Easy to compare multiple series</li>
              <li>• No stacking (lines overlay)</li>
              <li>• Best for showing changes over time</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-green-600">📊 Vertical Bars:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Traditional column charts</li>
              <li>• Great for time series data</li>
              <li>• Easy to compare values</li>
              <li>• Works well with short labels</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-indigo-600">
              📊 Horizontal Bars:
            </h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Perfect for long category names</li>
              <li>• Great for rankings/comparisons</li>
              <li>• Easy to read labels</li>
              <li>• Better for many categories</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-orange-600">📋 Table View:</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Raw data with exact values</li>
              <li>• Easy to scan specific numbers</li>
              <li>• Shows totals when stacked</li>
              <li>• Foundation for all visualizations</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>🔗 Stacked:</strong> Same{" "}
              <code className="bg-blue-200 px-1 rounded">stackId="1"</code> -
              elements build on top of each other
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>📊 Overlapping:</strong> Unique{" "}
              <code className="bg-green-200 px-1 rounded">stackId</code> -
              elements start from baseline
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-purple-800 text-sm">
              <strong>📅 Granularity:</strong>{" "}
              <span className="bg-purple-200 px-1 rounded">Monthly</span>{" "}
              (detailed) vs{" "}
              <span className="bg-purple-200 px-1 rounded">All Time</span>{" "}
              (aggregated)
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-800 text-sm">
            <strong>💡 Pro Tip:</strong> Try switching between Monthly and All
            Time granularity to see how the same data can be analyzed at
            different time scales. Monthly shows trends and patterns, while All
            Time gives you the big picture summary!
          </p>
        </div>
      </div>
    </div>
  );
}
