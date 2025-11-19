import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DepartmentsModule } from './modules/departments/departments.module';
import { NotificationModule } from './modules/notification/notification.module';
import { LeaveRequestModule } from './modules/leave-request/leave-request.module';
import { BuildingModule } from './modules/buildings/buildings.module';
import { RoomModule } from './modules/rooms/room.module';
import { ProfileModule } from './modules/profiles/profile.module';
import { SubjectModule } from './modules/subjects/subject.module';
import { SubjectAssignmentModule } from './modules/subjectAssignment/subjectAssignment.module';
import { AttendancesModule } from './modules/attendances/attendances.module';
import { connectDB } from './config/db.connect';
import { RecordsModule } from './modules/records/records.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: connectDB,
    }),
    UsersModule,
    AuthModule,
    DepartmentsModule,
    NotificationModule,
    LeaveRequestModule,
    BuildingModule,
    RoomModule,
    ProfileModule,
    SubjectModule,
    SubjectAssignmentModule,
    AttendancesModule,
    RecordsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
