'use strict';

const Nodal = require('nodal');
const scheduler = new Nodal.Scheduler();

/* generator: begin imports */

const ExpireNoOffers = Nodal.require('tasks/expire_no_offers.js');
const RemoveOldTokens = Nodal.require('tasks/remove_old_tokens.js');
const ExpiredOldOrders = Nodal.require('tasks/expire_old_orders.js');
const RemindUsersWithOffers = Nodal.require('tasks/remind_users_with_offers.js');
const WithdrawCommission = Nodal.require('tasks/withdraw_commission.js');
const TimeoutPayment = Nodal.require('tasks/timeout_payment.js');

/* generator: end imports */

/* generator: begin tasks */

scheduler.minutely(0).perform(ExpireNoOffers);
scheduler.minutely(30).perform(RemoveOldTokens);
scheduler.minutely(30).perform(ExpiredOldOrders);
scheduler.minutely(0).perform(RemindUsersWithOffers);
scheduler.minutely(0).perform(WithdrawCommission);
scheduler.minutely(0).perform(TimeoutPayment);

/* generator: end tasks */


module.exports = scheduler;
