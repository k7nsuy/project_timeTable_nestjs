import { Body, Controller, Post } from '@nestjs/common';
import { TimeSlotsService } from './app.service';
import { DayTimetableDto } from './dto/day-timetable.dto';

@Controller('timeslots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Post('/get')
  getTimeSlot(@Body() requestBody): DayTimetableDto[] {
    return this.timeSlotsService.getTimeSlots(requestBody)
  }
}
