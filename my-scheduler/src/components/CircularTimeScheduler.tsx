"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Activity {
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

const CircularTimeScheduler = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempActivityName, setTempActivityName] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const radius = 180;
  const viewSize = radius * 2.5;
  const center = viewSize / 2;

  const angleToTime = (angle: number): string => {
    // Convert angle to 24-hour time
    // Normalize angle to 0-360 range
    const normalizedAngle = (angle + 90 + 360) % 360;
    const hours = (normalizedAngle / 360) * 24;
    const hoursFloor = Math.floor(hours);
    const minutes = Math.floor((hours - hoursFloor) * 60);
    return `${hoursFloor.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAngleFromPoint = (x: number, y: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + center;
    const centerY = rect.top + center;
    
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    return (angle + 360) % 360;
  };

  const createSectorPath = (startAngle: number, endAngle: number): string => {
    // Ensure angles are in the correct range
    startAngle = (startAngle + 90) % 360;
    endAngle = (endAngle + 90) % 360;
    
    // If end angle is less than start angle, add 360 to end angle
    if (endAngle < startAngle) endAngle += 360;
    
    const start = {
      x: center + radius * Math.cos(startAngle * Math.PI / 180),
      y: center + radius * Math.sin(startAngle * Math.PI / 180)
    };
    
    const end = {
      x: center + radius * Math.cos(endAngle * Math.PI / 180),
      y: center + radius * Math.sin(endAngle * Math.PI / 180)
    };

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${center} ${center}
            L ${start.x} ${start.y}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
            Z`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const angle = getAngleFromPoint(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart(angle);
    setDragEnd(angle);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart !== null) {
      const angle = getAngleFromPoint(e.clientX, e.clientY);
      setDragEnd(angle);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      setShowNameInput(true);
    }
    setIsDragging(false);
  };

  const handleActivityNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dragStart !== null && dragEnd !== null && tempActivityName) {
      const startTime = angleToTime(dragStart);
      const endTime = angleToTime(dragEnd);
      
      setActivities([...activities, {
        name: tempActivityName,
        startTime,
        endTime,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }]);
      
      setTempActivityName('');
      setShowNameInput(false);
      setDragStart(null);
      setDragEnd(null);
    }
  };

  // Generate hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360 - 90;
    const angleRad = angle * (Math.PI / 180);
    const outerX = center + (radius + 10) * Math.cos(angleRad);
    const outerY = center + (radius + 10) * Math.sin(angleRad);
    const innerX = center + (radius - 10) * Math.cos(angleRad);
    const innerY = center + (radius - 10) * Math.sin(angleRad);
    const textX = center + (radius + 25) * Math.cos(angleRad);
    const textY = center + (radius + 25) * Math.sin(angleRad);

    return (
      <g key={i}>
        <line 
          x1={innerX} 
          y1={innerY} 
          x2={outerX} 
          y2={outerY} 
          stroke="gray" 
          strokeWidth="2"
        />
        <text 
          x={textX} 
          y={textY} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="text-xs"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
        >
          {i}:00
        </text>
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {showNameInput && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-10">
          <form onSubmit={handleActivityNameSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-2">Activity Name</label>
              <Input
                type="text"
                value={tempActivityName}
                onChange={(e) => setTempActivityName(e.target.value)}
                placeholder="Enter activity name"
                className="w-64"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowNameInput(false);
                  setTempActivityName('');
                  setDragStart(null);
                  setDragEnd(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <svg 
        ref={svgRef}
        width={viewSize} 
        height={viewSize} 
        className="bg-white cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Base circle */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius} 
          fill="none" 
          stroke="gray" 
          strokeWidth="2"
        />
        
        {/* Hour markers */}
        {hourMarkers}

        {/* Activity sectors */}
        {activities.map((activity, index) => {
          const startAngle = timeToAngle(activity.startTime);
          const endAngle = timeToAngle(activity.endTime);
          return (
            <path
              key={index}
              d={createSectorPath(startAngle, endAngle)}
              fill={activity.color}
              opacity={0.7}
            />
          );
        })}

        {/* Current drag selection */}
        {isDragging && dragStart !== null && dragEnd !== null && (
          <path
            d={createSectorPath(dragStart, dragEnd)}
            fill="rgba(0, 0, 255, 0.3)"
          />
        )}
      </svg>

      {/* Activity legend */}
      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: activity.color }}
            />
            <span className="text-black">{activity.name} ({activity.startTime} - {activity.endTime})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const timeToAngle = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return ((hours + minutes / 60) / 24) * 360 - 90;
};

export default CircularTimeScheduler;