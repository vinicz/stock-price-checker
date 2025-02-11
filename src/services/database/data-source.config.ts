import { DataSource, DataSourceOptions } from 'typeorm';

// This config is only used to generate migration files in local environment
function getConfig() {
  return {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
    synchronize: false,
    entities: ['dist/**/*.entity.js'],
    migrations: [__dirname + '/services/database/migrations/**/*{.ts,.js}'],
  } as DataSourceOptions;
}

const migrationGenerationDatasource = new DataSource(getConfig());
migrationGenerationDatasource.initialize();
export default migrationGenerationDatasource;
