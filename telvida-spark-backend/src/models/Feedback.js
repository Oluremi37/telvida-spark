 const { DataTypes } = require("sequelize");
 const sequelize = require("../config/database");

 const Feedback = sequelize.define(
   "Feedback",
   {
     id: {
       type: DataTypes.UUID,
       defaultValue: DataTypes.UUIDV4,
       primaryKey: true,
     },
     organizationId: {
       type: DataTypes.UUID,
       allowNull: false,
     },
     // FK to Device.id (the row's UUID) — the screen this feedback came from
     deviceRecordId: {
       type: DataTypes.UUID,
       allowNull: false,
     },
     type: {
       type: DataTypes.ENUM(
         "rating",
         "survey",
         "lead",
         "complaint",
         "qr",
         "product_rating",
       ),
       allowNull: false,
     },
     // Flexible container for type-specific data:
     // rating -> { stars: 5 }
     // survey -> { answers: [...] }
     // lead -> { name, email, phone }
     // complaint -> { text }
     // qr -> { scannedUrl }
     // product_rating -> { productId, stars }
     payload: {
       type: DataTypes.JSONB,
       defaultValue: {},
     },
   },
   {
     tableName: "feedback",
     timestamps: true,
   },
 );

 module.exports = Feedback;       