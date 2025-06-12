# Dashboard Visualization Patterns

Interactive dashboard demonstrating different chart visualization patterns for DevOps metrics.

## Data Sources

### GitHub Actions 📊

CI/CD Pipeline metrics for deployment and build tracking.

**Metrics:**

- **Deployments:** Daily deployment count
- **Success Rate:** Percentage of successful deployments
- **Build Time:** Average build duration in minutes
- **Tests Run:** Total number of tests executed

### PagerDuty 🚨

Incident Management metrics for reliability and response tracking.

**Metrics:**

- **Incidents:** Daily incident count
- **MTTR:** Mean Time to Recovery in minutes
- **Critical Incidents:** High-severity incidents
- **Users Affected:** Total users impacted

### GitHub PRs 🔀

Pull Request Activity metrics for code review and collaboration tracking.

**Metrics:**

- **Pull Requests:** Daily PR count
- **Merge Rate:** Percentage of PRs merged
- **Review Time:** Average review time in hours
- **Lines Changed:** Total lines of code changed

## Visualization Patterns

### Pattern 1: Single Source Time Series

Current implementation demonstrating single metric visualization over time.

**Features:**

- Switch between data sources using the dropdown
- Toggle between stacked and overlapping views
- Try different chart types for the same data
- Observe correlations in the data patterns

**Available Chart Types:**

- Area Chart
- Line Chart
- Vertical Bar Chart
- Horizontal Bar Chart
- Table View
- Tremor Area Chart
- Tremor Line Chart

### Pattern 2: Frontend ComposedChart Combinations (Planned)

Two data sources displayed together using ComposedChart - without backend math calculations.

**Examples:**

- Deployments vs Incidents: GitHub Actions count + PagerDuty incident count over time
- Code Changes vs Bug Reports: GitHub PR count + Jira bug count over time
- Deployments vs Error Rate: GitHub Actions count + Error percentage over time

### Pattern 3: ScatterChart Correlations (Planned)

Two metrics plotted against each other (no time axis).

**Examples:**

- PR Size vs Review Time: Lines of code (X) vs review hours (Y)
- Code Quality vs Velocity: Coverage % (X) vs deployment frequency (Y)
- Incident Impact vs Recovery: Users affected (X) vs recovery time (Y)

## Out of Scope

### Backend Calculated Metrics

This exploration does not include combining multiple data sources with mathematical operations in the backend. Examples of what we're **not** building:

- Change Failure Rate: (PagerDuty incidents ÷ GitHub Actions deployments) × 100
- Lead Time for Changes: GitHub PR merge → GitHub Actions deployment completion
- Code Review Efficiency: GitHub PR size ÷ GitHub review time

These composite metrics would require complex data correlation logic and are beyond the scope of this visualization pattern exploration.

## Technical Implementation

### Chart Configuration

Data source configurations are defined in `lib/chartConfig.js` with:

- Metric definitions and colors
- Table column formatting
- Data source metadata

### Data Processing

- Daily time series data in `lib/data.js`
- Aggregation utilities in `lib/utils.js`
- Support for both average and sum operators

### UI Components

- Chart controls using Radix UI Select components
- Recharts for primary visualizations
- Tremor components for enhanced chart types
- Responsive design with Tailwind CSS

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Next Steps

1. **Pattern 2 Implementation**: Build dual-axis composed charts showing multiple data sources
2. **Pattern 3 Implementation**: Create scatter plot correlations
3. **Real Data Integration**: Connect to actual DevOps tool APIs
4. **Advanced Filtering**: Add date range and team filtering
5. **Export Capabilities**: Add chart export and sharing features
