import { Module } from '@nestjs/common';
import { TimeSlotsController } from './app.controller';
import { TimeSlotsService } from './app.service';

@Module({
  imports: [],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
})
export class AppModule {}
