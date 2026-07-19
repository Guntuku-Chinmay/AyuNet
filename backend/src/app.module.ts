import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { appConfig, dbConfig, redisConfig, throttlerConfig } from './config/app.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { RoomsModule } from './rooms/rooms.module';
import { BedsModule } from './beds/beds.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { DoctorAssignmentsModule } from './doctor-assignments/doctor-assignments.module';
import { PatientsModule } from './patients/patients.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { PatientCaregiversModule } from './patient-caregivers/patient-caregivers.module';
import { TimelineModule } from './timeline/timeline.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TimeSlotsModule } from './time-slots/time-slots.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VisitsModule } from './visits/visits.module';
import { QueueModule } from './queue/queue.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { AllergiesModule } from './allergies/allergies.module';
import { ChronicConditionsModule } from './chronic-conditions/chronic-conditions.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { MedicinesModule } from './medicines/medicines.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PrescriptionItemsModule } from './prescription-items/prescription-items.module';
import { DiagnosticCentersModule } from './diagnostic-centers/diagnostic-centers.module';
import { LabTestsModule } from './lab-tests/lab-tests.module';
import { LabOrdersModule } from './lab-orders/lab-orders.module';
import { LabReportsModule } from './lab-reports/lab-reports.module';







@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, throttlerConfig],
      validate,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttler.ttl', 60) * 1000, // Conversion to milliseconds (standard in Throttler v6)
          limit: config.get<number>('throttler.limit', 10),
        },
      ],
    }),

    // Core Global Modules
    DatabaseModule,
    LoggerModule,
    HealthModule,

    // AyuNet Hospital Organization Modules
    AuthModule,
    AddressesModule,
    HospitalsModule,
    BranchesModule,
    DepartmentsModule,
    RoomsModule,
    BedsModule,
    SpecializationsModule,
    DoctorAssignmentsModule,

    // AyuNet Patient & Caregiver Modules
    PatientsModule,
    CaregiversModule,
    PatientCaregiversModule,
    TimelineModule,

    // AyuNet Appointment & Scheduling Modules
    NotificationsModule,
    TimeSlotsModule,
    AppointmentsModule,
    VisitsModule,
    QueueModule,

    // AyuNet Electronic Medical Records (EMR) Modules
    MedicalRecordsModule,
    DiagnosesModule,
    AllergiesModule,
    ChronicConditionsModule,
    VaccinationsModule,

    // AyuNet Prescription & Medication Modules
    MedicinesModule,
    PrescriptionsModule,
    PrescriptionItemsModule,

    // AyuNet Diagnostics & Lab Management Modules
    DiagnosticCentersModule,
    LabTestsModule,
    LabOrdersModule,
    LabReportsModule,
  ],
  providers: [
    // Global Rate Limit Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware globally to intercept all routes
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
