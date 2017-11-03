'use strict';

const Nodal = require('nodal');

class SetDefaultValuesToAllColumns extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017071809440452;
  }

  up() {

    return [
      `UPDATE offers SET canceled = false`,

      `ALTER TABLE "public"."offers"
        ALTER COLUMN "approved" SET DEFAULT 'false',
        ALTER COLUMN "restaurant_id" SET NOT NULL,
        ALTER COLUMN "order_id" SET NOT NULL,
        ALTER COLUMN "amount" SET NOT NULL,
        ALTER COLUMN "delivery_time" SET NOT NULL,
        ALTER COLUMN "approved" SET NOT NULL,
        ALTER COLUMN "canceled" SET NOT NULL;
      `,

      `UPDATE orders SET city_id = 1 WHERE city_id IS NULL`,

      `
      ALTER TABLE "orders"
        ALTER COLUMN "expired" SET DEFAULT 'false',
        ALTER COLUMN "client_order" SET NOT NULL,
        ALTER COLUMN "date" SET NOT NULL,
        ALTER COLUMN "city_id" SET NOT NULL;
      `,

      `ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL`,
      `ALTER TABLE "cities" ALTER COLUMN "name" SET NOT NULL`,

      `ALTER TABLE "dishes"
        ALTER COLUMN "name" SET NOT NULL,
        ALTER COLUMN "category_id" SET NOT NULL;
      `
    ];

  }

  down() {

    return [];

  }

}

module.exports = SetDefaultValuesToAllColumns;
