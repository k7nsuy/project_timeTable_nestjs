export class DayTimetableDto {
	start_of_day: number;
	day_modifier: number;
	is_day_off: boolean;
	timeslots: TimeslotDto[];
   }
   
export class TimeslotDto {
	begin_at: number;
	end_at: number;
}
