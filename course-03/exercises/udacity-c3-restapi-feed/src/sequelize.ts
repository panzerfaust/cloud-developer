import {Sequelize} from 'sequelize-typescript';
import { config } from './config/config';


const c = config.dev;

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  //"username": c.username,
  //"password": c.password,
  //"database": c.database,
  //"host":     c.host,
  "username": "database1",
  "password": "database1",
  "database": "database1",
  "host":     "udagramklazdev2.ceet8facd36c.eu-west-1.rds.amazonaws.com",

  dialect: 'postgres',
  storage: ':memory:',
});

