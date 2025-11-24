import { ConfigService } from '@nestjs/config';

export const connectDB = (configService: ConfigService) => ({
  type: (configService.get<string>('DB_TYPE') || 'postgres') as 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') || '5432'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  synchronize: true, // false in production
  entities: [__dirname + '/./**/*.entity.{ts,js}'],
  autoLoadEntities: true,
});
