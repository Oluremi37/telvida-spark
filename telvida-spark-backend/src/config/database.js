const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

let sequelize;

// Production / Neon: single connection URL (prefer pooled on Vercel)
if (process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED) {
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

  sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Local development (your current setup)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    },
  );
}

module.exports = sequelize;
