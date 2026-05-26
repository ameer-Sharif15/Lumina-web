'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { ScheduleItem } from '@/hooks/useSchedule';
import { ClassPeriod, DayKey, DAYS, DAY_LABELS } from '@/hooks/useClasses';

interface DashboardDataContextType {
  schedule: ScheduleItem[];
  loadingSchedule: boolean;
  isTomorrow: boolean;
  classes: any[];
  scheduleData: Record<DayKey, ClassPeriod[]>;
  loadingClasses: boolean;
  plans: any[];
  assessments: any[];
  loadingPlans: boolean;
  loadingAssessments: boolean;
  planCount: number;
  assessmentCount: number;
  refreshAll: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) hours = 0;
  if (modifier === 'PM') hours += 12;
  return hours * 60 + minutes;
}

function parseTimeToMinutes(timeStr: string): number {
  return parseToMinutes(timeStr);
}

function enrichSchedule(data: any[], isTomorrow = false): ScheduleItem[] {
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  const enriched: ScheduleItem[] = data.map((p: any) => {
    const endMin = parseToMinutes(p.endTime);
    const startMin = parseToMinutes(p.startTime);
    let status: ScheduleItem['status'] = 'upcoming';
    
    if (!isTomorrow) {
      if (currentTime >= startMin && currentTime <= endMin) status = 'ongoing';
      else if (currentTime > endMin) status = 'completed';
    }

    const formatTime = (t: string) => {
      const [hm, mod] = t.split(' ');
      const [h, m] = hm.split(':');
      return `${h}:${m} ${mod}`;
    };

    return {
      id: p._id || `${p.classId}-${p.startTime}`,
      subject: p.subject,
      class: p.className || p.class || '',
      classId: p.classId,
      time: `${formatTime(p.startTime)} - ${formatTime(p.endTime)}`,
      startTime: p.startTime,
      endTime: p.endTime,
      students: p.students || p.studentCount || 0,
      status,
    };
  });

  // Mark the first non-completed, non-ongoing as "next"
  let nextFound = false;
  enriched.forEach((p) => {
    if (p.status === 'upcoming' && !nextFound) {
      p.status = 'next';
      nextFound = true;
    }
  });

  return enriched;
}

function processSchedule(classesData: any[]): Record<DayKey, ClassPeriod[]> {
  const processed: Record<DayKey, ClassPeriod[]> = {
    MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [],
  };

  classesData.forEach((cls: any) => {
    (cls.schedule || []).forEach((p: any) => {
      const day = p.day as DayKey;
      if (processed[day]) {
        processed[day].push({
          classId: cls._id,
          className: cls.name,
          subject: p.subject,
          startTime: p.startTime,
          endTime: p.endTime,
          color: cls.color || '#006D4E',
        });
      }
    });
  });

  // Sort each day by startTime
  DAYS.forEach((day) => {
    processed[day].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  });

  return processed;
}

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [isTomorrow, setIsTomorrow] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<Record<DayKey, ClassPeriod[]>>({
    MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [],
  });
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [plans, setPlans] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  const [planCount, setPlanCount] = useState<number>(0);
  const [assessmentCount, setAssessmentCount] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const todayIndex = new Date().getDay();
      const today = DAY_NAMES[todayIndex];

      const res = await apiClient.get('/classes/schedule', { params: { day: today } });
      if (res.data.success) {
        let rawData = res.data.data || [];
        let data: ScheduleItem[] = enrichSchedule(rawData, false);
        let tomorrow = false;

        const allCompleted = data.length > 0 && data.every((p) => p.status === 'completed');
        const isEmptyToday = data.length === 0;

        if (allCompleted || isEmptyToday) {
          const tomorrowDay = DAY_NAMES[(todayIndex + 1) % 7];
          const tRes = await apiClient.get('/classes/schedule', { params: { day: tomorrowDay } });
          if (tRes.data.success) {
            const tomorrowData = tRes.data.data || [];
            data = enrichSchedule(tomorrowData, true);
            tomorrow = true;
          }
        }

        setSchedule(data);
        setIsTomorrow(tomorrow);
      }
    } catch (err) {
      console.error('Error fetching schedule in Context:', err);
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const res = await apiClient.get('/classes');
      if (res.data.success) {
        const data = res.data.data || [];
        setClasses(data);
        setScheduleData(processSchedule(data));
      }
    } catch (err) {
      console.error('Error fetching classes in Context:', err);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchPlansAndAssessments = useCallback(async () => {
    setLoadingPlans(true);
    setLoadingAssessments(true);
    
    apiClient.get('/plans').then(r => { 
      if (r.data.success) {
        const data = r.data.data || [];
        setPlans(data);
        setPlanCount(data.length);
      }
    }).catch(() => {}).finally(() => setLoadingPlans(false));

    apiClient.get('/assessments').then(r => { 
      if (r.data && r.data.success !== false) {
        const data = Array.isArray(r.data) ? r.data : r.data.data || [];
        setAssessments(data);
        setAssessmentCount(data.length);
      }
    }).catch(() => {}).finally(() => setLoadingAssessments(false));
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSchedule(), fetchClasses(), fetchPlansAndAssessments()]);
  }, [fetchSchedule, fetchClasses, fetchPlansAndAssessments]);

  // Initial fetch once on layout mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Status updater 60s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSchedule((prev) => {
        if (prev.length === 0 || isTomorrow) return prev;
        return enrichSchedule(prev);
      });
    }, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTomorrow]);

  return (
    <DashboardDataContext.Provider
      value={{
        schedule,
        loadingSchedule,
        isTomorrow,
        classes,
        scheduleData,
        loadingClasses,
        plans,
        assessments,
        loadingPlans,
        loadingAssessments,
        planCount,
        assessmentCount,
        refreshAll,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}
