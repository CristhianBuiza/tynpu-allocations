import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProd = configService.get('NODE_ENV') === 'production';
  const url = configService.get<string>('POSTGRES_URL') || configService.get<string>('DATABASE_URL');
  const forceSync = configService.get('DB_SYNCHRONIZE') === 'true';

  const common: Partial<TypeOrmModuleOptions> = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: forceSync ? true : !isProd,
    logging: !isProd,
  };

  if (url) {
    return {
      ...common,
      url,
      ssl: { rejectUnauthorized: false },
    } as TypeOrmModuleOptions;
  }

  return {
    ...common,
    host: configService.get('DB_HOST', '127.0.0.1'),
    port: Number(configService.get('DB_PORT', 5432)),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'tynpu_allocations'),
    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  } as TypeOrmModuleOptions;
};
