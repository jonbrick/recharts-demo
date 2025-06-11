# Recharts Data Type Context

## 1. Single Source Time Series

_One data source, time-based charts_

### Examples:

- **Deployment Frequency**: Time vs Count (GitHub Actions)
- **Mean Time to Recovery**: Time vs Hours (PagerDuty)
- **PR Volume**: Time vs Count (GitHub)
- **Bug Reports**: Time vs Count (Jira)
- **Error Rate**: Time vs Percentage (Datadog/Sentry)

### Recharts Components:

- LineChart
- BarChart
- AreaChart

---

## 2. Backend Calculated Metrics

_Multiple sources combined in backend, displayed as single metric_

### Examples:

- **Change Failure Rate**: (PagerDuty incidents ÷ GitHub Actions deployments) × 100
- **Lead Time for Changes**: GitHub PR merge → GitHub Actions deployment completion
- **Code Review Efficiency**: GitHub PR size ÷ GitHub review time
- **Defect Escape Rate**: Production incidents ÷ Total deployments
- **Sprint Velocity**: Jira story points ÷ Sprint duration

### Recharts Components:

- LineChart
- BarChart
- Single value displays

---

## 3. Frontend ComposedChart Combinations

_Two data sources displayed together using ComposedChart_

### Examples:

- **Deployments vs Incidents**: GitHub Actions count + PagerDuty incident count over time
- **Code Changes vs Bug Reports**: GitHub PR count + Jira bug count over time
- **Deployments vs Error Rate**: GitHub Actions count + Datadog error percentage over time
- **Feature Releases vs Adoption**: LaunchDarkly activations + User metrics over time
- **Vulnerability Discoveries vs Fixes**: Snyk findings + Snyk resolutions over time

### Recharts Components:

- **ComposedChart** with multiple Bar/Line/Area components
- **ReferenceLine** for thresholds
- **YAxis** with different yAxisId props for separate scales

---

## 4. ScatterChart Correlations

_Two metrics plotted against each other (no time axis)_

### Examples:

- **PR Size vs Review Time**: GitHub lines of code (X) vs GitHub review hours (Y)
- **Code Quality vs Velocity**: SonarQube coverage % (X) vs GitHub Actions deployment frequency (Y)
- **Issue Complexity vs Resolution**: Jira story points (X) vs Jira resolution days (Y)
- **Vulnerability Severity vs Fix Time**: Snyk severity score (X) vs fix days (Y)
- **Incident Impact vs Recovery**: PagerDuty users affected (X) vs recovery time (Y)
- **Team Size vs Productivity**: Team headcount (X) vs GitHub commits per week (Y)

### Recharts Components:

- **ScatterChart**
- **ZAxis** for bubble size (if using bubble chart variant)

---

## Data Source Mapping

### Primary Tools:

- **GitHub**: Code changes, PR data, repository metrics
- **GitHub Actions**: Deployment data, build metrics
- **PagerDuty**: Incident data, alerting metrics
- **Jira**: Work item tracking, story points, resolution times
- **SonarQube**: Code quality metrics, coverage data
- **Snyk**: Vulnerability data, security metrics
- **Datadog**: Performance metrics, error rates
- **LaunchDarkly**: Feature flag data, rollout metrics

### Integration Complexity:

1. **Single Source** → Simplest
2. **Backend Calculated** → Medium (requires data correlation)
3. **Frontend Dual-Axis** → Medium (requires synchronized time ranges)
4. **Scatter Plot** → Complex (requires data normalization and matching)

---

## Implementation Notes

### Backend Considerations:

- Data correlation windows (e.g., incidents within 4 hours of deployment)
- Service/application name mapping across tools
- Time zone normalization
- Data freshness and caching strategies

### Frontend Considerations:

- Chart library selection (Recharts, D3, Chart.js)
- Responsive design for different chart types
- Interactive features (zoom, filter, drill-down)
- Performance optimization for large datasets

### Common Challenges:

- Inconsistent service naming across tools
- Different timestamp formats
- API rate limiting
- Missing or incomplete data
- Real-time vs batch data processing
