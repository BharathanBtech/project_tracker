import React from 'react';
import { FiChevronRight, FiFlag, FiCheckCircle } from 'react-icons/fi';

interface ProjectStatus {
  id?: number;
  status_name: string;
  status_color: string;
  status_order: number;
  description?: string;
  is_start_status: boolean;
  is_end_status: boolean;
}

interface ProjectStatusFlowProps {
  statuses: ProjectStatus[];
  currentStatus?: string;
  showDescription?: boolean;
}

const ProjectStatusFlow: React.FC<ProjectStatusFlowProps> = ({ 
  statuses, 
  currentStatus,
  showDescription = false 
}) => {
  // Sort statuses by order
  const sortedStatuses = [...statuses].sort((a, b) => a.status_order - b.status_order);

  const getCurrentStatusIndex = () => {
    if (!currentStatus) return -1;
    return sortedStatuses.findIndex(s => s.status_name === currentStatus);
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <div className="w-full">
      {/* Flow Visualization */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {sortedStatuses.map((status, index) => {
          const isActive = index === currentIndex;
          const isPast = currentIndex >= 0 && index < currentIndex;
          const isFuture = currentIndex >= 0 && index > currentIndex;

          return (
            <React.Fragment key={index}>
              {/* Status Node */}
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="relative flex flex-col items-center">
                  {/* Icon/Badge */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive ? 'border-4 scale-110 shadow-lg' : 'border-2'}
                      ${isPast ? 'bg-green-500 border-green-600' : ''}
                      ${isActive ? 'border-current' : ''}
                      ${isFuture ? 'bg-gray-200 border-gray-300' : ''}
                    `}
                    style={{
                      backgroundColor: isActive || isPast ? status.status_color : undefined,
                      borderColor: isActive ? status.status_color : undefined,
                    }}
                  >
                    {status.is_start_status && (
                      <FiFlag 
                        size={20} 
                        className={isPast || isActive ? 'text-white' : 'text-gray-400'} 
                      />
                    )}
                    {status.is_end_status && (
                      <FiCheckCircle 
                        size={20} 
                        className={isPast || isActive ? 'text-white' : 'text-gray-400'} 
                      />
                    )}
                    {!status.is_start_status && !status.is_end_status && (
                      <span 
                        className={`text-sm font-bold ${
                          isPast || isActive ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Status Name */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? 'text-gray-900' : isPast ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {status.status_name}
                    </p>
                    {showDescription && status.description && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[120px]">
                        {status.description}
                      </p>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"
                        style={{ backgroundColor: status.status_color }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Arrow */}
              {index < sortedStatuses.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0 mb-8">
                  <FiChevronRight
                    size={24}
                    className={`
                      ${isPast ? 'text-green-500' : 'text-gray-300'}
                      transition-colors
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend (if current status is shown) */}
      {currentStatus && (
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-current" 
              style={{ borderColor: sortedStatuses[currentIndex]?.status_color }}
            ></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span>Upcoming</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusFlow;
