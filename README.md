Useful commands

## Running the app

```bash
$ docker compose up
```

## Executing e2e tests

```bash
$ npm run test:e2e:docker
```

## Generating a new migration file using TypeORM based on the difference between your TS entities and the schema of the DB you are connecting to (check ./src/database/datasource.config.ts)

You need to fill <MigrationName> (the convention is to use PascalCase naming). No need to add a timestamp to the name, typeorm does that for you.

```bash
$ npx typeorm-ts-node-commonjs migration:generate ./src/database/migrations/<MigrationName> -d ./src/database/data-source.config.ts
```

## Connecting to the docker container running Postgres DB locally

Get the IP address of your local machine (OSX):

```bash
$ ifconfig -u | grep 'inet ' | grep -v 127.0.0.1 | cut -d\  -f2 | head -1
```

Then you can use that IP address to connect to the local Postgres DB by using Adminer or the psql command line tool
