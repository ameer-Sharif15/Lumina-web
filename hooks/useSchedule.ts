'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';

export interface ScheduleItem {
  id: string;
  subject: string;
  class: string;
  classId: string;
  time: string;
  startTime: string;
  endTime: string;
  students: number;
  status: 'ongoing' | 'next' | 'upcoming' | 'completed';
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) hours = 0;
  if (modifier === 'PM') hours += 12;
  return hours * 60 + minutes;
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

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recalculate = useCallback((current: ScheduleItem[], isTom: boolean) => {
    if (current.length === 0 || isTom) return;
    const enriched = enrichSchedule(current);
    setSchedule(enriched);
    // If all completed, trigger full re-fetch
    if (enriched.every((p) => p.status === 'completed')) {
      fetchSchedule(true);
    }
  }, []); // eslint-disable-line

  const fetchSchedule = useCallback(async (force = false) => {
    setLoading(true);
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

        // All completed OR empty today → fetch tomorrow
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
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  // Initial fetch
  useEffect(() => {
    fetchSchedule(true);
  }, [fetchSchedule]);

  // Recalculate statuses every 60s
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

  const refresh = useCallback(() => fetchSchedule(true), [fetchSchedule]);

  return { schedule, loading, isTomorrow, refresh };
}
