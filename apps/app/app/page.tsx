"use client";

import { MarketsGrid } from "@/components/market/MarketsGrid";

export default function Home() {
  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-[30px] mb-4">El futuro tiene precio</h1>

        {/* Market Grid Section */}
        <MarketsGrid />
      </div>
    </div>
  );
}
