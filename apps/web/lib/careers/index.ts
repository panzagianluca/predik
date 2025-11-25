// Re-export all types and data
export * from "./types";

import { engineeringJobs } from "./engineering";
import { marketingJobs } from "./marketing";
import { designJobs } from "./design";
import { operationsJobs } from "./operations";
import type { JobPosition, JobCategory } from "./types";

// Combine all job positions
export const jobPositions: JobPosition[] = [
  ...engineeringJobs,
  ...marketingJobs,
  ...designJobs,
  ...operationsJobs,
];

/**
 * Get job by slug
 */
export function getJobBySlug(slug: string): JobPosition | undefined {
  return jobPositions.find((job) => job.slug === slug);
}

/**
 * Get jobs by category
 */
export function getJobsByCategory(category: JobCategory): JobPosition[] {
  return jobPositions.filter((job) => job.category === category);
}

/**
 * Get all leadership positions
 */
export function getLeadershipJobs(): JobPosition[] {
  return jobPositions.filter((job) => job.isLeadership);
}

/**
 * Get all non-leadership positions
 */
export function getRegularJobs(): JobPosition[] {
  return jobPositions.filter((job) => !job.isLeadership);
}
