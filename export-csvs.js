import fs from "fs";
import path from "path";
import os from "os";

// Import data directly from your data.js file - using your actual export names
import {
  githubPRData,
  pagerDutyData,
  githubActionsData,
} from "./src/lib/data.js";

function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(",");
  }

  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle null/undefined values and escape commas
      if (value === null || value === undefined) {
        return "";
      }
      // Escape values that contain commas or quotes
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"'))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

function exportCSVs() {
  try {
    // Get Downloads folder path
    const downloadsPath = path.join(os.homedir(), "Downloads");

    console.log(
      `📊 Found ${githubPRData.length} PRs, ${pagerDutyData.length} incidents, ${githubActionsData.length} deployments`
    );

    // PR data
    const prHeaders = [
      "id",
      "created_at",
      "merged_at",
      "author",
      "team",
      "lines_added",
      "lines_removed",
      "review_time_hours",
    ];
    const prCSV = arrayToCSV(githubPRData, prHeaders);
    fs.writeFileSync(path.join(downloadsPath, "prs.csv"), prCSV);
    console.log("✅ prs.csv created in Downloads");

    // Incidents data
    const incidentHeaders = [
      "id",
      "created_at",
      "resolved_at",
      "severity",
      "users_affected",
      "assigned_team",
      "service",
    ];
    const incidentsCSV = arrayToCSV(pagerDutyData, incidentHeaders);
    fs.writeFileSync(path.join(downloadsPath, "incidents.csv"), incidentsCSV);
    console.log("✅ incidents.csv created in Downloads");

    // Deployments data
    const deployHeaders = [
      "id",
      "deployed_at",
      "status",
      "duration_minutes",
      "tests_run",
      "author",
      "team",
      "repo",
    ];
    const deploymentsCSV = arrayToCSV(githubActionsData, deployHeaders);
    fs.writeFileSync(
      path.join(downloadsPath, "deployments.csv"),
      deploymentsCSV
    );
    console.log("✅ deployments.csv created in Downloads");

    console.log("\n🎉 All CSV files exported successfully!");
    console.log(`📁 Files created in: ${downloadsPath}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the export
exportCSVs();
