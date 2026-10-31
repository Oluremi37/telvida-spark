const { Sequelize } = require("sequelize");
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

let sequelize;

const commonOptions = {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
};

if (process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED) {
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

  sequelize = new Sequelize(connectionString, {
    ...commonOptions,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...commonOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
    },
  );
}

module.exports = sequelize;
