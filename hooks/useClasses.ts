'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export interface ClassPeriod {
  classId: string;
  className: string;
  subject: string;
  startTime: string;
  endTime: string;
  color?: string;
}

export type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export const DAYS: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const DAY_LABELS: Record<DayKey, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

function parseTimeToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) hours = 0;
  if (modifier === 'PM') hours += 12;
  return hours * 60 + minutes;
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

export function useClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<Record<DayKey, ClassPeriod[]>>({
    MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/classes');
      if (res.data.success) {
        const data = res.data.data || [];
        setClasses(data);
        setScheduleData(processSchedule(data));
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const refresh = useCallback(() => fetchClasses(), [fetchClasses]);

  return { classes, scheduleData, loading, refresh };
}
