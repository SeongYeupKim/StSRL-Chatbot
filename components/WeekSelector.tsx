'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  onWeekSelect: (week: number) => void;
}

export default function WeekSelector({ onWeekSelect }: WeekSelectorProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const totalWeeks = 12;

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const handleConfirm = () => {
    onWeekSelect(selectedWeek);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Current Week</h3>
        <p className="text-sm text-gray-600">
          Choose which week of the semester you're currently in to receive relevant learning prompts.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleWeekChange(Math.max(1, selectedWeek - 1))}
          disabled={selectedWeek === 1}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            Week {selectedWeek}
          </div>
          <div className="text-sm text-gray-500">
            {selectedWeek === 1 && "Introduction to SRL"}
            {selectedWeek === 2 && "Metacognition Focus"}
            {selectedWeek === 3 && "Strategy Development"}
            {selectedWeek === 4 && "Motivation & Engagement"}
            {selectedWeek === 5 && "Deep Learning"}
            {selectedWeek === 6 && "Assessment Preparation"}
            {selectedWeek === 7 && "Mid-semester Reflection"}
            {selectedWeek === 8 && "Adaptation & Growth"}
            {selectedWeek === 9 && "Advanced Strategies"}
            {selectedWeek === 10 && "Self-Efficacy"}
            {selectedWeek === 11 && "Final Preparation"}
            {selectedWeek === 12 && "Course Reflection"}
          </div>
        </div>

        <button
          onClick={() => handleWeekChange(Math.min(totalWeeks, selectedWeek + 1))}
          disabled={selectedWeek === totalWeeks}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex justify-center">
        <div className="flex space-x-1">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={`w-3 h-3 rounded-full transition-colors ${
                week === selectedWeek 
                  ? 'bg-primary-500' 
                  : week < selectedWeek 
                    ? 'bg-primary-200' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Start Week {selectedWeek} Prompts
        </button>
      </div>
    </div>
  );
}
