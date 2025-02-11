import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  TYPEORM_HOST,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE,
  TYPEORM_PORT,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_LOGGING,
  TYPEORM_DRIVER_EXTRA,
  TYPEORM_MIGRATIONS_RUN,
} from './constants';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres' as const,
        host: configService.get<string>(TYPEORM_HOST),
        port: configService.get<number>(TYPEORM_PORT),
        username: configService.get<string>(TYPEORM_USERNAME),
        password: configService.get<string>(TYPEORM_PASSWORD),
        database: configService.get<string>(TYPEORM_DATABASE),
        autoLoadEntities: true,
        synchronize: configService.get<string>(TYPEORM_SYNCHRONIZE) == 'true',
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun:
          configService.get<string>(TYPEORM_MIGRATIONS_RUN) == 'true',
        logging: configService.get<string>(TYPEORM_LOGGING) == 'true',
        extra: JSON.parse(
          configService.get<string>(TYPEORM_DRIVER_EXTRA, '{}'),
        ),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
