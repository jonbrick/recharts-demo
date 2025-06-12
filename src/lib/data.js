// data.js - Raw event data for dashboard builder POC

// Teams and People
export const teams = [
  { id: 'platform', name: 'Platform Team' },
  { id: 'product', name: 'Product Team' }
];

export const people = [
  { id: 'sarah_chen', name: 'Sarah Chen', team: 'platform' },
  { id: 'mike_johnson', name: 'Mike Johnson', team: 'platform' },
  { id: 'priya_patel', name: 'Priya Patel', team: 'platform' },
  { id: 'alex_kim', name: 'Alex Kim', team: 'platform' },
  { id: 'jordan_smith', name: 'Jordan Smith', team: 'platform' },
  { id: 'maya_rodriguez', name: 'Maya Rodriguez', team: 'platform' },
  { id: 'david_wilson', name: 'David Wilson', team: 'product' },
  { id: 'lisa_taylor', name: 'Lisa Taylor', team: 'product' }
];

// GitHub PR Data - Individual pull requests
export const githubPRData = [
  // May 18 - Weekend, lighter activity
  { id: 'pr-001', created_at: '2025-05-18T10:30:00Z', merged_at: '2025-05-18T14:20:00Z', author: 'sarah_chen', team: 'platform', lines_added: 156, lines_removed: 23, review_time_hours: 3.8 },
  { id: 'pr-002', created_at: '2025-05-18T15:45:00Z', merged_at: null, author: 'david_wilson', team: 'product', lines_added: 89, lines_removed: 12, review_time_hours: null },
  
  // May 19 - Monday, busy day
  { id: 'pr-003', created_at: '2025-05-19T09:15:00Z', merged_at: '2025-05-19T11:45:00Z', author: 'mike_johnson', team: 'platform', lines_added: 234, lines_removed: 45, review_time_hours: 2.5 },
  { id: 'pr-004', created_at: '2025-05-19T10:20:00Z', merged_at: '2025-05-19T16:30:00Z', author: 'priya_patel', team: 'platform', lines_added: 167, lines_removed: 34, review_time_hours: 6.2 },
  { id: 'pr-005', created_at: '2025-05-19T11:30:00Z', merged_at: '2025-05-19T13:15:00Z', author: 'lisa_taylor', team: 'product', lines_added: 78, lines_removed: 15, review_time_hours: 1.8 },
  { id: 'pr-006', created_at: '2025-05-19T14:45:00Z', merged_at: '2025-05-19T18:20:00Z', author: 'alex_kim', team: 'platform', lines_added: 312, lines_removed: 67, review_time_hours: 3.6 },
  { id: 'pr-007', created_at: '2025-05-19T16:10:00Z', merged_at: null, author: 'jordan_smith', team: 'platform', lines_added: 445, lines_removed: 89, review_time_hours: null },
  
  // May 20 - Tuesday
  { id: 'pr-008', created_at: '2025-05-20T08:30:00Z', merged_at: '2025-05-20T12:45:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 123, lines_removed: 28, review_time_hours: 4.3 },
  { id: 'pr-009', created_at: '2025-05-20T09:45:00Z', merged_at: '2025-05-20T11:20:00Z', author: 'david_wilson', team: 'product', lines_added: 67, lines_removed: 8, review_time_hours: 1.6 },
  { id: 'pr-010', created_at: '2025-05-20T11:15:00Z', merged_at: '2025-05-20T15:40:00Z', author: 'sarah_chen', team: 'platform', lines_added: 289, lines_removed: 54, review_time_hours: 4.4 },
  { id: 'pr-011', created_at: '2025-05-20T13:20:00Z', merged_at: '2025-05-20T17:10:00Z', author: 'lisa_taylor', team: 'product', lines_added: 178, lines_removed: 31, review_time_hours: 3.8 },
  { id: 'pr-012', created_at: '2025-05-20T15:30:00Z', merged_at: null, author: 'mike_johnson', team: 'platform', lines_added: 367, lines_removed: 78, review_time_hours: null },
  
  // May 21 - Wednesday
  { id: 'pr-013', created_at: '2025-05-21T09:00:00Z', merged_at: '2025-05-21T10:30:00Z', author: 'priya_patel', team: 'platform', lines_added: 45, lines_removed: 12, review_time_hours: 1.5 },
  { id: 'pr-014', created_at: '2025-05-21T10:45:00Z', merged_at: '2025-05-21T14:20:00Z', author: 'alex_kim', team: 'platform', lines_added: 198, lines_removed: 43, review_time_hours: 3.6 },
  { id: 'pr-015', created_at: '2025-05-21T12:15:00Z', merged_at: '2025-05-21T16:45:00Z', author: 'jordan_smith', team: 'platform', lines_added: 234, lines_removed: 56, review_time_hours: 4.5 },
  { id: 'pr-016', created_at: '2025-05-21T14:30:00Z', merged_at: '2025-05-21T17:15:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 134, lines_removed: 29, review_time_hours: 2.8 },
  { id: 'pr-017', created_at: '2025-05-21T16:20:00Z', merged_at: null, author: 'david_wilson', team: 'product', lines_added: 256, lines_removed: 48, review_time_hours: null },
  
  // May 22 - Thursday, heavy day
  { id: 'pr-018', created_at: '2025-05-22T08:15:00Z', merged_at: '2025-05-22T12:30:00Z', author: 'sarah_chen', team: 'platform', lines_added: 345, lines_removed: 67, review_time_hours: 4.3 },
  { id: 'pr-019', created_at: '2025-05-22T09:30:00Z', merged_at: '2025-05-22T13:45:00Z', author: 'lisa_taylor', team: 'product', lines_added: 189, lines_removed: 35, review_time_hours: 4.3 },
  { id: 'pr-020', created_at: '2025-05-22T10:45:00Z', merged_at: '2025-05-22T15:20:00Z', author: 'mike_johnson', team: 'platform', lines_added: 267, lines_removed: 52, review_time_hours: 4.6 },
  { id: 'pr-021', created_at: '2025-05-22T11:30:00Z', merged_at: '2025-05-22T16:15:00Z', author: 'priya_patel', team: 'platform', lines_added: 178, lines_removed: 41, review_time_hours: 4.8 },
  { id: 'pr-022', created_at: '2025-05-22T13:15:00Z', merged_at: '2025-05-22T18:30:00Z', author: 'alex_kim', team: 'platform', lines_added: 412, lines_removed: 89, review_time_hours: 5.3 },
  { id: 'pr-023', created_at: '2025-05-22T14:45:00Z', merged_at: null, author: 'jordan_smith', team: 'platform', lines_added: 523, lines_removed: 112, review_time_hours: null },
  { id: 'pr-024', created_at: '2025-05-22T16:20:00Z', merged_at: null, author: 'maya_rodriguez', team: 'platform', lines_added: 298, lines_removed: 56, review_time_hours: null },
  
  // Continue pattern through May 31...
  // May 23 - Friday
  { id: 'pr-025', created_at: '2025-05-23T09:00:00Z', merged_at: '2025-05-23T11:45:00Z', author: 'david_wilson', team: 'product', lines_added: 145, lines_removed: 28, review_time_hours: 2.8 },
  { id: 'pr-026', created_at: '2025-05-23T10:30:00Z', merged_at: '2025-05-23T14:15:00Z', author: 'sarah_chen', team: 'platform', lines_added: 234, lines_removed: 45, review_time_hours: 3.8 },
  { id: 'pr-027', created_at: '2025-05-23T12:15:00Z', merged_at: '2025-05-23T16:30:00Z', author: 'lisa_taylor', team: 'product', lines_added: 167, lines_removed: 32, review_time_hours: 4.3 },
  { id: 'pr-028', created_at: '2025-05-23T14:45:00Z', merged_at: null, author: 'mike_johnson', team: 'platform', lines_added: 389, lines_removed: 78, review_time_hours: null },
  
  // May 24-25 - Weekend, minimal activity
  { id: 'pr-029', created_at: '2025-05-24T11:30:00Z', merged_at: '2025-05-24T13:20:00Z', author: 'priya_patel', team: 'platform', lines_added: 67, lines_removed: 15, review_time_hours: 1.8 },
  { id: 'pr-030', created_at: '2025-05-25T15:45:00Z', merged_at: null, author: 'alex_kim', team: 'platform', lines_added: 123, lines_removed: 28, review_time_hours: null },
  
  // May 26 - Monday
  { id: 'pr-031', created_at: '2025-05-26T08:45:00Z', merged_at: '2025-05-26T12:30:00Z', author: 'jordan_smith', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: 3.8 },
  { id: 'pr-032', created_at: '2025-05-26T10:15:00Z', merged_at: '2025-05-26T14:20:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 189, lines_removed: 38, review_time_hours: 4.1 },
  { id: 'pr-033', created_at: '2025-05-26T11:30:00Z', merged_at: '2025-05-26T15:45:00Z', author: 'david_wilson', team: 'product', lines_added: 156, lines_removed: 31, review_time_hours: 4.3 },
  { id: 'pr-034', created_at: '2025-05-26T13:45:00Z', merged_at: '2025-05-26T17:30:00Z', author: 'sarah_chen', team: 'platform', lines_added: 267, lines_removed: 54, review_time_hours: 3.8 },
  { id: 'pr-035', created_at: '2025-05-26T15:20:00Z', merged_at: null, author: 'lisa_taylor', team: 'product', lines_added: 345, lines_removed: 67, review_time_hours: null },
  
  // May 27 - Tuesday
  { id: 'pr-036', created_at: '2025-05-27T09:15:00Z', merged_at: '2025-05-27T13:30:00Z', author: 'mike_johnson', team: 'platform', lines_added: 298, lines_removed: 58, review_time_hours: 4.3 },
  { id: 'pr-037', created_at: '2025-05-27T10:45:00Z', merged_at: '2025-05-27T14:15:00Z', author: 'priya_patel', team: 'platform', lines_added: 178, lines_removed: 34, review_time_hours: 3.5 },
  { id: 'pr-038', created_at: '2025-05-27T12:30:00Z', merged_at: '2025-05-27T16:45:00Z', author: 'alex_kim', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: 4.3 },
  { id: 'pr-039', created_at: '2025-05-27T14:15:00Z', merged_at: '2025-05-27T18:20:00Z', author: 'jordan_smith', team: 'platform', lines_added: 356, lines_removed: 71, review_time_hours: 4.1 },
  { id: 'pr-040', created_at: '2025-05-27T16:30:00Z', merged_at: null, author: 'maya_rodriguez', team: 'platform', lines_added: 412, lines_removed: 83, review_time_hours: null },
  
  // Continue with remaining days through May 31 to reach 100 PRs...
  // May 28 - Wednesday
  { id: 'pr-041', created_at: '2025-05-28T08:30:00Z', merged_at: '2025-05-28T12:15:00Z', author: 'david_wilson', team: 'product', lines_added: 167, lines_removed: 32, review_time_hours: 3.8 },
  { id: 'pr-042', created_at: '2025-05-28T09:45:00Z', merged_at: '2025-05-28T13:30:00Z', author: 'sarah_chen', team: 'platform', lines_added: 234, lines_removed: 45, review_time_hours: 3.8 },
  { id: 'pr-043', created_at: '2025-05-28T11:15:00Z', merged_at: '2025-05-28T15:45:00Z', author: 'lisa_taylor', team: 'product', lines_added: 189, lines_removed: 38, review_time_hours: 4.5 },
  { id: 'pr-044', created_at: '2025-05-28T13:20:00Z', merged_at: '2025-05-28T17:15:00Z', author: 'mike_johnson', team: 'platform', lines_added: 278, lines_removed: 56, review_time_hours: 3.9 },
  { id: 'pr-045', created_at: '2025-05-28T15:30:00Z', merged_at: null, author: 'priya_patel', team: 'platform', lines_added: 345, lines_removed: 69, review_time_hours: null },
  
  // May 29 - Thursday
  { id: 'pr-046', created_at: '2025-05-29T08:15:00Z', merged_at: '2025-05-29T12:45:00Z', author: 'alex_kim', team: 'platform', lines_added: 298, lines_removed: 59, review_time_hours: 4.5 },
  { id: 'pr-047', created_at: '2025-05-29T09:30:00Z', merged_at: '2025-05-29T13:15:00Z', author: 'jordan_smith', team: 'platform', lines_added: 167, lines_removed: 33, review_time_hours: 3.8 },
  { id: 'pr-048', created_at: '2025-05-29T10:45:00Z', merged_at: '2025-05-29T14:30:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: 3.8 },
  { id: 'pr-049', created_at: '2025-05-29T12:15:00Z', merged_at: '2025-05-29T16:45:00Z', author: 'david_wilson', team: 'product', lines_added: 189, lines_removed: 38, review_time_hours: 4.5 },
  { id: 'pr-050', created_at: '2025-05-29T14:30:00Z', merged_at: '2025-05-29T18:15:00Z', author: 'sarah_chen', team: 'platform', lines_added: 312, lines_removed: 62, review_time_hours: 3.8 },
  
  // May 30 - Friday
  { id: 'pr-051', created_at: '2025-05-30T09:00:00Z', merged_at: '2025-05-30T11:30:00Z', author: 'lisa_taylor', team: 'product', lines_added: 123, lines_removed: 24, review_time_hours: 2.5 },
  { id: 'pr-052', created_at: '2025-05-30T10:30:00Z', merged_at: '2025-05-30T14:15:00Z', author: 'mike_johnson', team: 'platform', lines_added: 256, lines_removed: 51, review_time_hours: 3.8 },
  { id: 'pr-053', created_at: '2025-05-30T12:45:00Z', merged_at: '2025-05-30T16:30:00Z', author: 'priya_patel', team: 'platform', lines_added: 178, lines_removed: 35, review_time_hours: 3.8 },
  { id: 'pr-054', created_at: '2025-05-30T14:20:00Z', merged_at: null, author: 'alex_kim', team: 'platform', lines_added: 398, lines_removed: 79, review_time_hours: null },
  
  // May 31 - Saturday, light activity to finish up to 100
  { id: 'pr-055', created_at: '2025-05-31T10:15:00Z', merged_at: '2025-05-31T13:45:00Z', author: 'jordan_smith', team: 'platform', lines_added: 134, lines_removed: 27, review_time_hours: 3.5 },
  
  // Add remaining PRs to reach exactly 100...
  // Adding 45 more PRs distributed across the time period
  { id: 'pr-056', created_at: '2025-05-18T16:30:00Z', merged_at: '2025-05-19T09:15:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 89, lines_removed: 18, review_time_hours: 16.8 },
  { id: 'pr-057', created_at: '2025-05-19T17:45:00Z', merged_at: '2025-05-20T10:30:00Z', author: 'david_wilson', team: 'product', lines_added: 145, lines_removed: 29, review_time_hours: 16.8 },
  { id: 'pr-058', created_at: '2025-05-20T18:20:00Z', merged_at: '2025-05-21T11:45:00Z', author: 'sarah_chen', team: 'platform', lines_added: 267, lines_removed: 53, review_time_hours: 17.4 },
  { id: 'pr-059', created_at: '2025-05-21T17:30:00Z', merged_at: '2025-05-22T09:15:00Z', author: 'lisa_taylor', team: 'product', lines_added: 198, lines_removed: 39, review_time_hours: 15.8 },
  { id: 'pr-060', created_at: '2025-05-22T19:15:00Z', merged_at: '2025-05-23T10:30:00Z', author: 'mike_johnson', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: 15.3 },
  
  // Additional PRs continuing the pattern...
  { id: 'pr-061', created_at: '2025-05-23T17:45:00Z', merged_at: '2025-05-24T12:30:00Z', author: 'priya_patel', team: 'platform', lines_added: 178, lines_removed: 35, review_time_hours: 18.8 },
  { id: 'pr-062', created_at: '2025-05-24T14:20:00Z', merged_at: '2025-05-26T09:45:00Z', author: 'alex_kim', team: 'platform', lines_added: 345, lines_removed: 69, review_time_hours: 43.4 },
  { id: 'pr-063', created_at: '2025-05-26T18:30:00Z', merged_at: '2025-05-27T11:15:00Z', author: 'jordan_smith', team: 'platform', lines_added: 156, lines_removed: 31, review_time_hours: 16.8 },
  { id: 'pr-064', created_at: '2025-05-27T19:45:00Z', merged_at: '2025-05-28T10:30:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 289, lines_removed: 58, review_time_hours: 14.8 },
  { id: 'pr-065', created_at: '2025-05-28T18:15:00Z', merged_at: '2025-05-29T09:45:00Z', author: 'david_wilson', team: 'product', lines_added: 198, lines_removed: 39, review_time_hours: 15.5 },
  
  // Continue adding PRs to reach 100 total...
  // Adding smaller PRs for variety
  { id: 'pr-066', created_at: '2025-05-18T11:45:00Z', merged_at: '2025-05-18T13:30:00Z', author: 'sarah_chen', team: 'platform', lines_added: 34, lines_removed: 7, review_time_hours: 1.8 },
  { id: 'pr-067', created_at: '2025-05-19T12:30:00Z', merged_at: '2025-05-19T14:15:00Z', author: 'mike_johnson', team: 'platform', lines_added: 56, lines_removed: 11, review_time_hours: 1.8 },
  { id: 'pr-068', created_at: '2025-05-20T13:45:00Z', merged_at: '2025-05-20T15:30:00Z', author: 'priya_patel', team: 'platform', lines_added: 78, lines_removed: 15, review_time_hours: 1.8 },
  { id: 'pr-069', created_at: '2025-05-21T11:20:00Z', merged_at: '2025-05-21T13:45:00Z', author: 'alex_kim', team: 'platform', lines_added: 45, lines_removed: 9, review_time_hours: 2.4 },
  { id: 'pr-070', created_at: '2025-05-22T12:15:00Z', merged_at: '2025-05-22T14:30:00Z', author: 'jordan_smith', team: 'platform', lines_added: 67, lines_removed: 13, review_time_hours: 2.3 },
  
  // Add 30 more PRs to reach exactly 100
  { id: 'pr-071', created_at: '2025-05-23T11:30:00Z', merged_at: '2025-05-23T13:15:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 89, lines_removed: 18, review_time_hours: 1.8 },
  { id: 'pr-072', created_at: '2025-05-24T10:45:00Z', merged_at: '2025-05-24T12:30:00Z', author: 'david_wilson', team: 'product', lines_added: 56, lines_removed: 11, review_time_hours: 1.8 },
  { id: 'pr-073', created_at: '2025-05-26T09:30:00Z', merged_at: '2025-05-26T11:45:00Z', author: 'lisa_taylor', team: 'product', lines_added: 123, lines_removed: 25, review_time_hours: 2.3 },
  { id: 'pr-074', created_at: '2025-05-27T08:45:00Z', merged_at: '2025-05-27T10:30:00Z', author: 'sarah_chen', team: 'platform', lines_added: 67, lines_removed: 13, review_time_hours: 1.8 },
  { id: 'pr-075', created_at: '2025-05-28T07:30:00Z', merged_at: '2025-05-28T09:15:00Z', author: 'mike_johnson', team: 'platform', lines_added: 78, lines_removed: 15, review_time_hours: 1.8 },
  { id: 'pr-076', created_at: '2025-05-29T08:00:00Z', merged_at: '2025-05-29T10:15:00Z', author: 'priya_patel', team: 'platform', lines_added: 94, lines_removed: 19, review_time_hours: 2.3 },
  { id: 'pr-077', created_at: '2025-05-30T08:30:00Z', merged_at: '2025-05-30T10:45:00Z', author: 'alex_kim', team: 'platform', lines_added: 56, lines_removed: 11, review_time_hours: 2.3 },
  { id: 'pr-078', created_at: '2025-05-31T09:00:00Z', merged_at: '2025-05-31T11:30:00Z', author: 'jordan_smith', team: 'platform', lines_added: 112, lines_removed: 22, review_time_hours: 2.5 },
  
  // Large PRs for variety
  { id: 'pr-079', created_at: '2025-05-18T13:20:00Z', merged_at: '2025-05-20T15:45:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 678, lines_removed: 135, review_time_hours: 50.4 },
  { id: 'pr-080', created_at: '2025-05-21T14:15:00Z', merged_at: '2025-05-23T16:30:00Z', author: 'david_wilson', team: 'product', lines_added: 534, lines_removed: 107, review_time_hours: 50.3 },
  { id: 'pr-081', created_at: '2025-05-24T15:30:00Z', merged_at: '2025-05-27T10:15:00Z', author: 'sarah_chen', team: 'platform', lines_added: 723, lines_removed: 144, review_time_hours: 66.8 },
  { id: 'pr-082', created_at: '2025-05-27T16:45:00Z', merged_at: '2025-05-29T18:20:00Z', author: 'lisa_taylor', team: 'product', lines_added: 612, lines_removed: 122, review_time_hours: 49.6 },
  
  // Medium-sized PRs
  { id: 'pr-083', created_at: '2025-05-19T15:20:00Z', merged_at: '2025-05-20T09:30:00Z', author: 'mike_johnson', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: 18.2 },
  { id: 'pr-084', created_at: '2025-05-22T16:30:00Z', merged_at: '2025-05-23T11:45:00Z', author: 'priya_patel', team: 'platform', lines_added: 298, lines_removed: 59, review_time_hours: 19.3 },
  { id: 'pr-085', created_at: '2025-05-25T17:15:00Z', merged_at: '2025-05-26T12:30:00Z', author: 'alex_kim', team: 'platform', lines_added: 267, lines_removed: 53, review_time_hours: 19.3 },
  { id: 'pr-086', created_at: '2025-05-28T16:45:00Z', merged_at: '2025-05-29T11:20:00Z', author: 'jordan_smith', team: 'platform', lines_added: 189, lines_removed: 38, review_time_hours: 18.6 },
  
  // Quick fixes and small PRs
  { id: 'pr-087', created_at: '2025-05-18T14:30:00Z', merged_at: '2025-05-18T15:15:00Z', author: 'maya_rodriguez', team: 'platform', lines_added: 12, lines_removed: 3, review_time_hours: 0.8 },
  { id: 'pr-088', created_at: '2025-05-19T13:45:00Z', merged_at: '2025-05-19T14:20:00Z', author: 'david_wilson', team: 'product', lines_added: 8, lines_removed: 2, review_time_hours: 0.6 },
  { id: 'pr-089', created_at: '2025-05-21T15:20:00Z', merged_at: '2025-05-21T16:00:00Z', author: 'sarah_chen', team: 'platform', lines_added: 15, lines_removed: 4, review_time_hours: 0.7 },
  { id: 'pr-090', created_at: '2025-05-23T16:15:00Z', merged_at: '2025-05-23T16:45:00Z', author: 'lisa_taylor', team: 'product', lines_added: 21, lines_removed: 5, review_time_hours: 0.5 },
  
  // Failed/abandoned PRs (not merged)
  { id: 'pr-091', created_at: '2025-05-20T17:30:00Z', merged_at: null, author: 'mike_johnson', team: 'platform', lines_added: 456, lines_removed: 91, review_time_hours: null },
  { id: 'pr-092', created_at: '2025-05-23T18:45:00Z', merged_at: null, author: 'priya_patel', team: 'platform', lines_added: 234, lines_removed: 47, review_time_hours: null },
  { id: 'pr-093', created_at: '2025-05-26T19:20:00Z', merged_at: null, author: 'alex_kim', team: 'platform', lines_added: 378, lines_removed: 76, review_time_hours: null },
  { id: 'pr-094', created_at: '2025-05-28T19:45:00Z', merged_at: null, author: 'jordan_smith', team: 'platform', lines_added: 298, lines_removed: 59, review_time_hours: null },
  { id: 'pr-095', created_at: '2025-05-30T18:30:00Z', merged_at: null, author: 'maya_rodriguez', team: 'platform', lines_added: 189, lines_removed: 38, review_time_hours: null },
  
  // Final 5 PRs to reach exactly 100
  { id: 'pr-096', created_at: '2025-05-24T09:15:00Z', merged_at: '2025-05-24T11:30:00Z', author: 'david_wilson', team: 'product', lines_added: 145, lines_removed: 29, review_time_hours: 2.3 },
  { id: 'pr-097', created_at: '2025-05-25T10:30:00Z', merged_at: '2025-05-25T13:45:00Z', author: 'sarah_chen', team: 'platform', lines_added: 167, lines_removed: 33, review_time_hours: 3.3 },
  { id: 'pr-098', created_at: '2025-05-29T15:45:00Z', merged_at: '2025-05-29T17:30:00Z', author: 'lisa_taylor', team: 'product', lines_added: 89, lines_removed: 18, review_time_hours: 1.8 },
  { id: 'pr-099', created_at: '2025-05-30T16:20:00Z', merged_at: null, author: 'mike_johnson', team: 'platform', lines_added: 434, lines_removed: 87, review_time_hours: null },
  { id: 'pr-100', created_at: '2025-05-31T14:15:00Z', merged_at: '2025-05-31T16:45:00Z', author: 'priya_patel', team: 'platform', lines_added: 123, lines_removed: 25, review_time_hours: 2.5 }
];

// GitHub Actions Data - Individual deployments
export const githubActionsData = [
  // May 18 - Weekend deployment
  { id: 'deploy-001', deployed_at: '2025-05-18T14:30:00Z', status: 'success', duration_minutes: 8.5, tests_run: 1247, author: 'sarah_chen', team: 'platform', repo: 'api-service' },
  
  // May 19 - Monday deployments
  { id: 'deploy-002', deployed_at: '2025-05-19T11:50:00Z', status: 'success', duration_minutes: 12.3, tests_run: 1534, author: 'mike_johnson', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-003', deployed_at: '2025-05-19T16:35:00Z', status: 'failure', duration_minutes: 18.7, tests_run: 1534, author: 'priya_patel', team: 'platform', repo: 'user-auth' },
  { id: 'deploy-004', deployed_at: '2025-05-19T17:45:00Z', status: 'success', duration_minutes: 9.2, tests_run: 1534, author: 'priya_patel', team: 'platform', repo: 'user-auth' },
  
  // May 20 - Tuesday deployments
  { id: 'deploy-005', deployed_at: '2025-05-20T10:15:00Z', status: 'success', duration_minutes: 11.8, tests_run: 1623, author: 'alex_kim', team: 'platform', repo: 'api-service' },
  { id: 'deploy-006', deployed_at: '2025-05-20T13:20:00Z', status: 'success', duration_minutes: 10.4, tests_run: 1623, author: 'david_wilson', team: 'product', repo: 'frontend-app' },
  { id: 'deploy-007', deployed_at: '2025-05-20T16:45:00Z', status: 'success', duration_minutes: 13.7, tests_run: 1623, author: 'jordan_smith', team: 'platform', repo: 'payment-service' },
  
  // May 21 - Wednesday deployments
  { id: 'deploy-008', deployed_at: '2025-05-21T09:30:00Z', status: 'success', duration_minutes: 7.9, tests_run: 1456, author: 'maya_rodriguez', team: 'platform', repo: 'api-service' },
  { id: 'deploy-009', deployed_at: '2025-05-21T14:25:00Z', status: 'success', duration_minutes: 14.2, tests_run: 1456, author: 'lisa_taylor', team: 'product', repo: 'mobile-app' },
  { id: 'deploy-010', deployed_at: '2025-05-21T17:20:00Z', status: 'success', duration_minutes: 11.5, tests_run: 1456, author: 'sarah_chen', team: 'platform', repo: 'data-pipeline' },
  
  // May 22 - Thursday, busy deployment day
  { id: 'deploy-011', deployed_at: '2025-05-22T09:45:00Z', status: 'success', duration_minutes: 15.3, tests_run: 1789, author: 'mike_johnson', team: 'platform', repo: 'user-auth' },
  { id: 'deploy-012', deployed_at: '2025-05-22T12:30:00Z', status: 'failure', duration_minutes: 22.8, tests_run: 1789, author: 'priya_patel', team: 'platform', repo: 'payment-service' },
  { id: 'deploy-013', deployed_at: '2025-05-22T13:15:00Z', status: 'success', duration_minutes: 13.6, tests_run: 1789, author: 'priya_patel', team: 'platform', repo: 'payment-service' },
  { id: 'deploy-014', deployed_at: '2025-05-22T15:40:00Z', status: 'success', duration_minutes: 16.2, tests_run: 1789, author: 'alex_kim', team: 'platform', repo: 'api-service' },
  { id: 'deploy-015', deployed_at: '2025-05-22T18:35:00Z', status: 'failure', duration_minutes: 19.7, tests_run: 1789, author: 'jordan_smith', team: 'platform', repo: 'data-pipeline' },
  
  // May 23 - Friday deployments
  { id: 'deploy-016', deployed_at: '2025-05-23T10:20:00Z', status: 'success', duration_minutes: 12.1, tests_run: 1634, author: 'maya_rodriguez', team: 'platform', repo: 'user-auth' },
  { id: 'deploy-017', deployed_at: '2025-05-23T14:45:00Z', status: 'success', duration_minutes: 14.8, tests_run: 1634, author: 'david_wilson', team: 'product', repo: 'frontend-app' },
  { id: 'deploy-018', deployed_at: '2025-05-23T16:30:00Z', status: 'success', duration_minutes: 11.7, tests_run: 1634, author: 'lisa_taylor', team: 'product', repo: 'mobile-app' },
  
  // May 26 - Monday deployments
  { id: 'deploy-019', deployed_at: '2025-05-26T09:15:00Z', status: 'success', duration_minutes: 13.4, tests_run: 1567, author: 'sarah_chen', team: 'platform', repo: 'api-service' },
  { id: 'deploy-020', deployed_at: '2025-05-26T12:50:00Z', status: 'success', duration_minutes: 10.8, tests_run: 1567, author: 'mike_johnson', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-021', deployed_at: '2025-05-26T15:25:00Z', status: 'success', duration_minutes: 12.9, tests_run: 1567, author: 'priya_patel', team: 'platform', repo: 'user-auth' },
  { id: 'deploy-022', deployed_at: '2025-05-26T17:40:00Z', status: 'success', duration_minutes: 15.2, tests_run: 1567, author: 'alex_kim', team: 'platform', repo: 'payment-service' },
  
  // May 27 - Tuesday deployments
  { id: 'deploy-023', deployed_at: '2025-05-27T08:45:00Z', status: 'success', duration_minutes: 9.7, tests_run: 1698, author: 'jordan_smith', team: 'platform', repo: 'api-service' },
  { id: 'deploy-024', deployed_at: '2025-05-27T13:35:00Z', status: 'failure', duration_minutes: 25.3, tests_run: 1698, author: 'maya_rodriguez', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-025', deployed_at: '2025-05-27T14:20:00Z', status: 'success', duration_minutes: 11.4, tests_run: 1698, author: 'maya_rodriguez', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-026', deployed_at: '2025-05-27T16:55:00Z', status: 'success', duration_minutes: 13.8, tests_run: 1698, author: 'david_wilson', team: 'product', repo: 'frontend-app' },
  
  // May 28 - Wednesday deployments
  { id: 'deploy-027', deployed_at: '2025-05-28T10:30:00Z', status: 'success', duration_minutes: 12.6, tests_run: 1523, author: 'lisa_taylor', team: 'product', repo: 'mobile-app' },
  { id: 'deploy-028', deployed_at: '2025-05-28T13:15:00Z', status: 'success', duration_minutes: 14.1, tests_run: 1523, author: 'sarah_chen', team: 'platform', repo: 'user-auth' },
  { id: 'deploy-029', deployed_at: '2025-05-28T15:50:00Z', status: 'success', duration_minutes: 10.9, tests_run: 1523, author: 'mike_johnson', team: 'platform', repo: 'api-service' },
  
  // May 29 - Thursday deployments
  { id: 'deploy-030', deployed_at: '2025-05-29T09:20:00Z', status: 'success', duration_minutes: 15.7, tests_run: 1745, author: 'priya_patel', team: 'platform', repo: 'payment-service' },
  { id: 'deploy-031', deployed_at: '2025-05-29T12:45:00Z', status: 'success', duration_minutes: 11.3, tests_run: 1745, author: 'alex_kim', team: 'platform', repo: 'api-service' },
  { id: 'deploy-032', deployed_at: '2025-05-29T16:10:00Z', status: 'failure', duration_minutes: 21.4, tests_run: 1745, author: 'jordan_smith', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-033', deployed_at: '2025-05-29T17:05:00Z', status: 'success', duration_minutes: 12.8, tests_run: 1745, author: 'jordan_smith', team: 'platform', repo: 'data-pipeline' },
  { id: 'deploy-034', deployed_at: '2025-05-29T18:25:00Z', status: 'success', duration_minutes: 13.2, tests_run: 1745, author: 'maya_rodriguez', team: 'platform', repo: 'user-auth' },
  
  // May 30 - Friday deployments
  { id: 'deploy-035', deployed_at: '2025-05-30T11:40:00Z', status: 'success', duration_minutes: 9.4, tests_run: 1432, author: 'david_wilson', team: 'product', repo: 'frontend-app' },
  { id: 'deploy-036', deployed_at: '2025-05-30T14:25:00Z', status: 'success', duration_minutes: 16.8, tests_run: 1432, author: 'lisa_taylor', team: 'product', repo: 'mobile-app' },
  { id: 'deploy-037', deployed_at: '2025-05-30T16:50:00Z', status: 'success', duration_minutes: 12.1, tests_run: 1432, author: 'sarah_chen', team: 'platform', repo: 'api-service' },
  
  // May 31 - Saturday, weekend deployment
  { id: 'deploy-038', deployed_at: '2025-05-31T13:30:00Z', status: 'success', duration_minutes: 8.7, tests_run: 1289, author: 'mike_johnson', team: 'platform', repo: 'data-pipeline' }
];

// PagerDuty Data - Individual incidents
export const pagerDutyData = [
  // May 18 - Weekend incident
  { id: 'inc-001', created_at: '2025-05-18T15:45:00Z', resolved_at: '2025-05-18T16:30:00Z', severity: 'low', users_affected: 120, assigned_team: 'platform', service: 'api-service' },
  
  // May 19 - Monday incidents
  { id: 'inc-002', created_at: '2025-05-19T16:40:00Z', resolved_at: '2025-05-19T19:25:00Z', severity: 'high', users_affected: 1200, assigned_team: 'platform', service: 'user-auth' },
  { id: 'inc-003', created_at: '2025-05-19T21:15:00Z', resolved_at: '2025-05-19T21:45:00Z', severity: 'low', users_affected: 45, assigned_team: 'product', service: 'frontend-app' },
  
  // May 20 - Tuesday incident
  { id: 'inc-004', created_at: '2025-05-20T14:20:00Z', resolved_at: '2025-05-20T15:35:00Z', severity: 'medium', users_affected: 340, assigned_team: 'platform', service: 'api-service' },
  
  // May 21 - Wednesday incident
  { id: 'inc-005', created_at: '2025-05-21T11:30:00Z', resolved_at: '2025-05-21T12:15:00Z', severity: 'low', users_affected: 78, assigned_team: 'product', service: 'mobile-app' },
  
  // May 22 - Thursday, multiple incidents correlating with failed deployments
  { id: 'inc-006', created_at: '2025-05-22T12:35:00Z', resolved_at: '2025-05-22T14:20:00Z', severity: 'high', users_affected: 1800, assigned_team: 'platform', service: 'payment-service' },
  { id: 'inc-007', created_at: '2025-05-22T18:40:00Z', resolved_at: '2025-05-22T21:15:00Z', severity: 'critical', users_affected: 3400, assigned_team: 'platform', service: 'data-pipeline' },
  { id: 'inc-008', created_at: '2025-05-22T22:30:00Z', resolved_at: '2025-05-22T23:45:00Z', severity: 'medium', users_affected: 567, assigned_team: 'product', service: 'notification-service' },
  
  // May 23 - Friday incident
  { id: 'inc-009', created_at: '2025-05-23T13:45:00Z', resolved_at: '2025-05-23T14:30:00Z', severity: 'low', users_affected: 189, assigned_team: 'platform', service: 'user-auth' },
  
  // May 26 - Monday incident
  { id: 'inc-010', created_at: '2025-05-26T16:20:00Z', resolved_at: '2025-05-26T17:45:00Z', severity: 'medium', users_affected: 456, assigned_team: 'product', service: 'frontend-app' },
  
  // May 27 - Tuesday, incident correlating with failed deployment
  { id: 'inc-011', created_at: '2025-05-27T13:40:00Z', resolved_at: '2025-05-27T16:25:00Z', severity: 'high', users_affected: 1100, assigned_team: 'platform', service: 'data-pipeline' },
  { id: 'inc-012', created_at: '2025-05-27T19:15:00Z', resolved_at: '2025-05-27T20:30:00Z', severity: 'medium', users_affected: 234, assigned_team: 'platform', service: 'api-service' },
  
  // May 28 - Wednesday incident
  { id: 'inc-013', created_at: '2025-05-28T10:45:00Z', resolved_at: '2025-05-28T11:30:00Z', severity: 'low', users_affected: 123, assigned_team: 'product', service: 'mobile-app' },
  
  // May 29 - Thursday, incident correlating with failed deployment
  { id: 'inc-014', created_at: '2025-05-29T16:15:00Z', resolved_at: '2025-05-29T18:45:00Z', severity: 'high', users_affected: 1340, assigned_team: 'platform', service: 'data-pipeline' },
  { id: 'inc-015', created_at: '2025-05-29T20:30:00Z', resolved_at: '2025-05-29T21:15:00Z', severity: 'medium', users_affected: 290, assigned_team: 'product', service: 'notification-service' },
  
  // May 30 - Friday incident
  { id: 'inc-016', created_at: '2025-05-30T17:20:00Z', resolved_at: '2025-05-30T18:45:00Z', severity: 'medium', users_affected: 456, assigned_team: 'platform', service: 'payment-service' },
  
  // May 31 - Saturday incident
  { id: 'inc-017', created_at: '2025-05-31T14:15:00Z', resolved_at: '2025-05-31T15:00:00Z', severity: 'low', users_affected: 178, assigned_team: 'product', service: 'frontend-app' }
];