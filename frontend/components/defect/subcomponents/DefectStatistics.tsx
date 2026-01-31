'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface DefectStatistics {
  total: number;
  byStatus: Array<{ status: string; _count: number }>;
  bySeverity: Array<{ severity: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
}

interface DefectStatisticsProps {
  projectId: string;
  refreshTrigger?: number; // Optional trigger to refresh statistics
}

export function DefectStatistics({ projectId, refreshTrigger }: DefectStatisticsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statistics, setStatistics] = useState<DefectStatistics | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { options: statusOptions } = useDropdownOptions('Defect', 'status');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/defects/statistics`);
      
      if (!response.ok) {
        console.error(
          'Error fetching defect statistics: HTTP error',
          response.status,
          response.statusText
        );
        return;
      }
      
      const data = await response.json();
      if (data && data.data) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching defect statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics, refreshTrigger]);

  // Component commented out - return null to hide the card

  // if (loading) {
  //   return (
  //     <DetailCard title="Defect Status Statistics" contentClassName="space-y-3" className="mb-4">
  //       <div className="animate-pulse space-y-3">
  //         <div className="h-4 bg-white/10 rounded w-1/3"></div>
  //         <div className="h-20 bg-white/10 rounded"></div>
  //       </div>
  //     </DetailCard>
  //   );
  // }

  // if (!statistics || statistics.total === 0) { 
    return null;
    // }

// Convert byStatus array to object for easier access
// const statusData = statistics.byStatus.reduce((acc, item) => {
//   acc[item.status] = item._count;
//   return acc;
// }, {} as Record<string, number>);

// // Get all statuses and calculate percentages
// const statusEntries = Object.entries(statusData).filter(([, count]) => count > 0);

// // Helper function to extract solid color from dropdown options for progress bar
// const getStatusColorForBar = (status: string): string => {
//   const statusOption = statusOptions.find(opt => opt.value === status);
  
//   // If dropdown option has a color, use it directly (it's a hex color)
//   if (statusOption?.color) {
//     return statusOption.color;
//   }
  
//   // Fallback: use badge props to extract color from className
//   const badgeProps = getDynamicBadgeProps(status, statusOptions);
  
//   // Extract color from className (e.g., "bg-blue-500/10 text-blue-400")
//   const colorMatch = badgeProps.className.match(/(?:bg|text|border)-(red|orange|yellow|green|blue|purple|gray|indigo|violet|pink|rose|amber|lime|emerald|teal|cyan|sky|fuchsia)-(\d+)/);
//   if (colorMatch) {
//     const [, colorName] = colorMatch;
//     // Map Tailwind color names to hex values (500 shade for progress bar)
//     const colorMap: Record<string, string> = {
//       red: '#ef4444',
//       orange: '#f97316',
//       yellow: '#eab308',
//       green: '#22c55e',
//       blue: '#3b82f6',
//       purple: '#a855f7',
//       gray: '#6b7280',
//       indigo: '#6366f1',
//       violet: '#8b5cf6',
//       pink: '#ec4899',
//       rose: '#f43f5e',
//       amber: '#f59e0b',
//       lime: '#84cc16',
//       emerald: '#10b981',
//       teal: '#14b8a6',
//       cyan: '#06b6d4',
//       sky: '#0ea5e9',
//       fuchsia: '#d946ef',
//     };
//     return colorMap[colorName] || '#6b7280';
//   }
  
//   // Ultimate fallback
//   return '#6b7280'; // gray-500
// };

// // Calculate cumulative positions for stacked bar
// let cumulativePercentage = 0;
// const segments = statusEntries.map(([status, count]) => {
//   const percentage = statistics.total > 0 ? (count / statistics.total) * 100 : 0;
//   const left = cumulativePercentage;
//   cumulativePercentage += percentage;
//   const badgeProps = getDynamicBadgeProps(status, statusOptions);
//   const statusOption = statusOptions.find(opt => opt.value === status);
//   const label = statusOption?.label || status.replace('_', ' ');
  
//   return {
//     status,
//     count,
//     percentage,
//     left,
//     width: percentage,
//     color: getStatusColorForBar(status),
//     label,
//     badgeProps,
//   };
// });

// // Calculate number of columns based on number of statuses (max 5 per column)
// // Responsive: on mobile (sm), show fewer columns; on larger screens, show more
// const itemsPerColumn = 5;
// const totalItems = segments.length;
// const columnsCount = Math.ceil(totalItems / itemsPerColumn);

// // Responsive column calculation
// // Mobile: max 1 column, Small: max 2 columns, Medium+: allow more columns
// const getResponsiveColumns = () => {
//   if (totalItems <= 5) return 1;
//   if (totalItems <= 10) return 2;
//   if (totalItems <= 15) return 3;
//   return Math.min(columnsCount, 4); // Max 4 columns
// };

// const responsiveColumns = getResponsiveColumns();

// // Split segments into columns
// const columns: typeof segments[] = [];
// for (let i = 0; i < responsiveColumns; i++) {
//   const start = i * itemsPerColumn;
//   const end = start + itemsPerColumn;
//   columns.push(segments.slice(start, end));
// }

// return (
//   <DetailCard 
//     title="Defect Status Statistics"
//     headerAction={
//       <BarChart3 className="w-4 h-4 text-primary" />
//     }
//     contentClassName="space-y-3"
//     className="mb-4"
//   >
//     {/* Stacked Progress Bar */}
//     <div>
//       <div className="flex items-center justify-between mb-1.5">
//         <span className="text-xs text-white/60">By Status</span>
//         <span className="text-xs text-white/60">Total: {statistics.total}</span>
//       </div>
      
//       {/* Single Stacked Progress Bar */}
//       <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden relative mb-1.5">
//         {segments.map((segment) => (
//           <div
//             key={segment.status}
//             className="absolute top-0 h-full transition-all duration-500"
//             style={{
//               left: `${segment.left}%`,
//               width: `${segment.width}%`,
//               backgroundColor: segment.color,
//             }}
//             title={`${segment.label}: ${segment.count} (${Math.round(segment.percentage)}%)`}
//           />
//         ))}
//       </div>

//       {/* Legend - Vertical layout with responsive multi-column support */}
//       <div className={`grid gap-2 text-xs ${
//         responsiveColumns === 1 ? 'grid-cols-1' :
//         responsiveColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
//         responsiveColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
//         'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//       }`}>
//         {columns.map((column, columnIndex) => (
//           <div key={columnIndex} className="flex flex-col gap-2">
//             {column.map((segment) => (
//               <div key={segment.status} className="flex items-center gap-1.5">
//                 <div
//                   className="w-2 h-2 rounded flex-shrink-0"
//                   style={{ backgroundColor: segment.color }}
//                 />
//                 <span className="text-white/90 text-xs whitespace-nowrap">
//                   {segment.label}
//                 </span>
//                 <span className="text-white/60 text-xs whitespace-nowrap">
//                   {segment.count} ({Math.round(segment.percentage)}%)
//                 </span>
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   </DetailCard>
// );
  }

