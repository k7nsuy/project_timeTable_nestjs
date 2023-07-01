import { Injectable } from '@nestjs/common';
import { DayTimetableDto, TimeslotDto } from './dto/day-timetable.dto';

import * as workhoursData from './data/workhours.json';
import * as eventData from './data/events.json';

@Injectable()
export class TimeSlotsService {
  getTimeSlots(requestBody): DayTimetableDto[] {
    const {
      start_day_identifier,
      service_duration,
      days,
      timeslot_interval,
      is_ignore_schedule,
      is_ignore_workhour,
    } = requestBody;

    // start_day_identifier를 Unix timestamp로 변환
    const startDate = new Date(`${start_day_identifier.slice(0, 4)}-${start_day_identifier.slice(4, 6)}-${start_day_identifier.slice(6, 8)}`);
    const startOfDay = Math.floor(startDate.getTime() / 1000); // Unix timestamp 초 단위

    // 끝나는 날짜
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    // DayTimetableDto 리스트 생성
    const dayTimetables: DayTimetableDto[] = [];

    // startDate부터 endDate까지의 날짜에 대해 처리
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      const dayModifier = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      ); // 시작일로부터 경과한 일수

      console.log(dayModifier);

      // workhours.json에서 해당 요일의 작업 시간 정보 가져오기
      const weekday = currentDate.getDay();
      
      // workhours.json에서 weekday에 해당하는 데이터만 추출
      const workhour = workhoursData.find((wh) => wh.weekday === weekday);
      
      // is_day_of 값 추출
      const dayOff = workhour.is_day_off
      
      const dayTimetable: DayTimetableDto = {
        start_of_day: startOfDay,
        day_modifier: dayModifier,
        is_day_off: dayOff,
        timeslots: [],
      };

      if (workhour) {
        const openInterval = workhour.open_interval;
        const closeInterval = workhour.close_interval;

        // Timeslot 생성
        let startTime = startOfDay + openInterval;
        
        while (startTime + service_duration <= startOfDay + closeInterval) {
          const endTime = startTime + service_duration;
          const timeslot: TimeslotDto = {
            begin_at: startTime,
            end_at: endTime,
          };
          dayTimetable.timeslots.push(timeslot);
          startTime += timeslot_interval;
        }
      } else {
        dayTimetable.is_day_off = true; // 휴무일 설정
      }

      dayTimetables.push(dayTimetable);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (!is_ignore_schedule) {
      // event.json에서 기간에 겹치는 이벤트 시간 제거
      eventData.forEach((event) => {
        const eventStartTime = event.begin_at;
        const eventEndTime = event.end_at;

        dayTimetables.forEach((dayTimetable) => {
          dayTimetable.timeslots = dayTimetable.timeslots.filter(
            (timeslot) =>
              timeslot.begin_at >= eventEndTime || timeslot.end_at <= eventStartTime
          );
        });
      });
    }

    if (!is_ignore_workhour) {
      // workhours.json에서 기간에 겹치는 작업 시간 제거
      dayTimetables.forEach((dayTimetable) => {
        if (!dayTimetable.is_day_off) {
          const workhour = workhoursData.find((wh) => wh.weekday === currentDate.getDay());

          if (workhour) {
            const openInterval = workhour.open_interval;
            const closeInterval = workhour.close_interval;

            dayTimetable.timeslots = dayTimetable.timeslots.filter(
              (timeslot) =>
                timeslot.begin_at >= dayTimetable.start_of_day + openInterval ||
                timeslot.end_at <= dayTimetable.start_of_day + closeInterval
            );
          }
        }
      });
    }

    return dayTimetables;
  }
}
