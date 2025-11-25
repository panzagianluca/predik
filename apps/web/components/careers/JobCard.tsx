"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { motion } from "motion/react";
import { type JobPosition, jobCategories, jobTypes } from "@/lib/careers";

interface JobCardProps {
  job: JobPosition;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const Icon = job.icon;
  const category = jobCategories[job.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Link
        href={`/carreras/${job.slug}`}
        className="group block p-6 bg-card border border-border rounded-xl hover:border-electric-purple/30 hover:shadow-lg hover:shadow-electric-purple/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-electric-purple/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-electric-purple" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-electric-purple transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {job.shortDescription}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-electric-purple group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full bg-muted ${category.color}`}
              >
                {category.label}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {jobTypes[job.type]}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Remoto
              </span>
              {job.isLeadership && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">
                  Equity
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
