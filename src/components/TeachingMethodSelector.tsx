import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  SquareCheck, 
  Square,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  TEACHING_METHODS, 
  TEACHING_TECHNIQUES, 
  getSubjectActivities,
  type TeachingMethodOption,
  type TeachingTechniqueOption
} from '../data/teachingMethodsDB';

interface TeachingMethodSelectorProps {
  selectedMethodIds: string[];
  selectedTechniqueIds: string[];
  selectedActivities: string[];
  onMethodsChange: (ids: string[]) => void;
  onTechniquesChange: (ids: string[]) => void;
  onActivitiesChange: (activities: string[]) => void;
  subjectName?: string;
}

export const TeachingMethodSelector: React.FC<TeachingMethodSelectorProps> = ({
  selectedMethodIds,
  selectedTechniqueIds,
  selectedActivities,
  onMethodsChange,
  onTechniquesChange,
  onActivitiesChange,
  subjectName = '',
}) => {
  const subjectActivities = getSubjectActivities(subjectName);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const toggleMethod = (id: string) => {
    if (selectedMethodIds.includes(id)) {
      onMethodsChange(selectedMethodIds.filter(m => m !== id));
    } else {
      onMethodsChange([...selectedMethodIds, id]);
    }
  };

  const toggleTechnique = (id: string) => {
    if (selectedTechniqueIds.includes(id)) {
      onTechniquesChange(selectedTechniqueIds.filter(t => t !== id));
    } else {
      onTechniquesChange([...selectedTechniqueIds, id]);
    }
  };

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      onActivitiesChange(selectedActivities.filter(a => a !== activity));
    } else {
      onActivitiesChange([...selectedActivities, activity]);
    }
  };

  const totalSelected = selectedMethodIds.length + selectedTechniqueIds.length + selectedActivities.length;

  // Group techniques by group
  const techniqueGroups = TEACHING_TECHNIQUES.reduce<Record<string, TeachingTechniqueOption[]>>((acc, t) => {
    if (!acc[t.groupLabel]) acc[t.groupLabel] = [];
    acc[t.groupLabel].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h4 className="font-bold text-gray-900 dark:text-white">
            Phương pháp & Kĩ thuật dạy học
          </h4>
          {totalSelected > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold">
              {totalSelected} đã chọn
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Info className="w-3 h-3" />
          <span>Tùy chọn, AI sẽ tích hợp vào giáo án</span>
        </div>
      </div>

      {/* Section 1: Phương pháp dạy học */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('methods')}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-sm">Phương pháp dạy học hiện đại</span>
            {selectedMethodIds.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-bold">
                {selectedMethodIds.length}
              </span>
            )}
          </div>
          {expandedSection === 'methods' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === 'methods' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TEACHING_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-left transition-all text-sm",
                    selectedMethodIds.includes(method.id)
                      ? "bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-300 dark:ring-amber-700"
                      : "hover:bg-white dark:hover:bg-gray-900"
                  )}
                >
                  {selectedMethodIds.includes(method.id)
                    ? <SquareCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                  }
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white leading-tight">{method.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Kĩ thuật dạy học */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('techniques')}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-sm">Kĩ thuật dạy học tích cực</span>
            {selectedTechniqueIds.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold">
                {selectedTechniqueIds.length}
              </span>
            )}
          </div>
          {expandedSection === 'techniques' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === 'techniques' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {Object.entries(techniqueGroups).map(([groupLabel, techs]) => (
              <div key={groupLabel}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {groupLabel}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {techs.map(tech => (
                    <button
                      key={tech.id}
                      onClick={() => toggleTechnique(tech.id)}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg text-left transition-all text-sm",
                        selectedTechniqueIds.includes(tech.id)
                          ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700"
                          : "hover:bg-white dark:hover:bg-gray-900"
                      )}
                    >
                      {selectedTechniqueIds.includes(tech.id)
                        ? <SquareCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
                      }
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white leading-tight">{tech.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tech.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Hoạt động đặc thù */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('activities')}
          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-sm">
              Hoạt động đặc thù{subjectName ? ` — ${subjectName}` : ' môn học'}
            </span>
            {selectedActivities.length > 0 && (
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-bold">
                {selectedActivities.length}
              </span>
            )}
          </div>
          {expandedSection === 'activities' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        
        {expandedSection === 'activities' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
            {subjectName && (
              <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-medium">
                📚 Hiện hoạt động gợi ý cho môn: <strong>{subjectName}</strong>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {subjectActivities.map(activity => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-left transition-all text-sm",
                    selectedActivities.includes(activity)
                      ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-300 dark:ring-green-700"
                      : "hover:bg-white dark:hover:bg-gray-900"
                  )}
                >
                  {selectedActivities.includes(activity)
                    ? <SquareCheck className="w-4 h-4 text-green-600 shrink-0" />
                    : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                  }
                  <span className="text-gray-900 dark:text-white">{activity}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
