# Dashboard Builder Demo

An interactive dashboard system that visualizes DevOps metrics with dynamic charts and tables. This demo explores different visualization patterns using real-world data sources like GitHub PRs, GitHub Actions, and PagerDuty incidents.

## Features

### Dynamic Data Visualization

- **Multiple Chart Types**: Area, Line, Bar (vertical/horizontal), Stacked charts
- **Table View**: Dynamic table that mirrors chart data structure
- **Real-time Controls**: Instant updates when changing metrics, groupings, or date ranges
- **Overlay Support**: Compare two different data sources on the same chart

### Smart Grouping System

- **Organization View**: See aggregated totals for your entire organization
- **Team Breakdown**: Compare Platform Team vs Product Team performance
- **Individual Metrics**: Track contributions by specific team members

### Data Sources

#### GitHub Pull Requests 🔀

Track code review and collaboration metrics:

- **Pull Requests**: Daily PR count
- **Merge Rate**: Percentage of PRs successfully merged
- **Review Time**: Average hours from PR creation to merge
- **Lines Changed**: Total code modifications

#### GitHub Actions 📊

Monitor CI/CD pipeline performance:

- **Deployments**: Daily deployment frequency
- **Success Rate**: Percentage of successful builds
- **Build Time**: Average build duration in minutes
- **Tests Run**: Total test executions

#### PagerDuty 🚨

Analyze incident management and reliability:

- **Incidents**: Daily incident count
- **MTTR**: Mean Time to Recovery in minutes
- **Critical Incidents**: High-severity event tracking
- **Users Affected**: Impact radius of incidents

## How It Works

### Architecture Overview

The dashboard follows a unidirectional data flow pattern:

```
User Interaction → State Update → Data Transformation → Component Re-render
```

### Data Processing Pipeline

1. **Raw Events**: Individual records (PRs, deployments, incidents) with timestamps and metadata
2. **Transformation Layer**: Groups and aggregates data based on selected view (org/team/person)
3. **Formatted Output**: Time-series data ready for visualization

Example data transformation:

```javascript
// Raw PR data
{
  id: "pr-001",
  created_at: "2025-05-15T08:30:00Z",
  author: "sarah_chen",
  team: "platform",
  lines_added: 234
}

// Transformed for Team View
{
  name: "May 15",
  "Platform Team": 5,    // Total PRs from platform team
  "Product Team": 2      // Total PRs from product team
}
```

### Control System

All controls are configuration-driven, pulling options from a central config:

- **Data Source Selector**: Switch between GitHub PRs, Actions, or PagerDuty
- **Metric Selector**: Choose which metric to visualize
- **Group By Selector**: Change data aggregation (Org/Team/Person)
- **Chart Type Selector**: Pick visualization style
- **Date Range Picker**: Filter data to specific time periods

### Table Implementation

The table dynamically adjusts its structure based on the selected grouping:

- **Org View**: Single column showing organization totals
- **Team View**: Multiple columns, one per team
- **Person View**: Multiple columns, one per individual

The same transformed data that feeds the charts also feeds the table, ensuring consistency across all visualizations.

## Visualization Patterns

### Pattern 1: Single Source Time Series (Implemented)

View one data source with various grouping and aggregation options. Switch between different chart types to find the best representation for your data.

### Pattern 2: Overlay Comparisons (Implemented)

Combine two data sources on a single chart using dual Y-axes. For example:

- GitHub PRs (bars) with PagerDuty Incidents (line)
- Deployments (area) with Build Success Rate (line)

### Pattern 3: Correlation Analysis (Planned)

Future implementation for scatter plots showing relationships between metrics without time dimension.

## Technical Stack

- **React** with TypeScript for type safety
- **Recharts** for primary chart rendering
- **Tailwind CSS** for styling
- **Radix UI** for accessible dropdown components
- **Next.js** as the framework

## Running the Demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the dashboard.

## Key Design Principles

1. **Single Source of Truth**: All state management happens in the main page component
2. **Configuration-Driven**: Data sources, metrics, and options defined in central config
3. **Pure Components**: UI components receive data via props and emit events upward
4. **Consistent Formatting**: Centralized formatting functions for numbers, percentages, and dates
5. **Responsive Design**: Works seamlessly across desktop and tablet viewports

## Data Model

The system uses a flexible event-based data model where each data source has:

- Common fields: `id`, `created_at`, timestamps
- Source-specific fields: `author`, `team`, `severity`, etc.
- Calculated metrics: Derived from raw event data

This design allows for easy addition of new data sources while maintaining consistent visualization patterns.
