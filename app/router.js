'use strict';

const Nodal = require('nodal');
const router = new Nodal.Router();

/* Middleware */
/* executed *before* Controller-specific middleware */

const CORSMiddleware = Nodal.require('middleware/cors_middleware.js');
// const CORSAuthorizationMiddleware = Nodal.require('middleware/cors_authorization_middleware.js');
// const ForceWWWMiddleware = Nodal.require('middleware/force_www_middleware.js');
// const ForceHTTPSMiddleware = Nodal.require('middleware/force_https_middleware.js');

router.middleware.use(CORSMiddleware);
// router.middleware.use(CORSAuthorizationMiddleware);
// router.middleware.use(ForceWWWMiddleware);
// router.middleware.use(ForceHTTPSMiddleware);

/* Renderware */
/* executed *after* Controller-specific renderware */

const GzipRenderware = Nodal.require('renderware/gzip_renderware.js')

router.renderware.use(GzipRenderware);

/* Routes */

/* generator: begin imports */

const path = 'app/controllers/v1'
const adminPath = 'app/controllers/v1/admin'

const BillController = Nodal.require(`${path}/bill_controller.js`);
const UsersController = Nodal.require(`${path}/users_controller.js`);
const CardsController = Nodal.require(`${path}/cards_controller.js`);
const OnAirController = Nodal.require(`${path}/on_air_controller.js`);
const OrdersController = Nodal.require(`${path}/orders_controller.js`);
const OffersController = Nodal.require(`${path}/offers_controller.js`);
const DishesController = Nodal.require(`${path}/dishes_controller.js`);
const UploadController = Nodal.require(`${path}/upload_controller.js`);
const CitiesController = Nodal.require(`${path}/cities_controller.js`);
// const Cards3dController = Nodal.require(`${path}/cards3d_controller.js`);
const PaymentController = Nodal.require(`${path}/payment_controller.js`);
const CheckoutController = Nodal.require(`${path}/checkout_controller.js`);
const CheckPinController = Nodal.require(`${path}/check_pin_controller.js`);
const CategoriesController = Nodal.require(`${path}/categories_controller.js`);
const RestaurantsController = Nodal.require(`${path}/restaurants_controller.js`);
const InvolvementController = Nodal.require(`${path}/involvement_controller.js`);
const AccessTokensController = Nodal.require(`${path}/access_tokens_controller.js`);
const AveragePriceController = Nodal.require(`${path}/average_price_controller.js`);
const PaymentResultController = Nodal.require(`${path}/payment_result_controller.js`);
const UpdatePushTokenController = Nodal.require(`${path}/update_push_token_controller.js`);
const RestaurantOffersController = Nodal.require(`${path}/restaurant_offers_controller.js`);
const HealthControllerController = Nodal.require(`${path}/health_controller_controller.js`);

const AdminUsersController = Nodal.require(`${adminPath}/users_controller.js`);
const AdminTelegramTokenController = Nodal.require(`${adminPath}/telegram_token_controller.js`);

/* generator: end imports */

/* generator: begin routes */

router.route('/v1/users/{id}').use(UsersController);
router.route('/v1/onair/{id}').use(OnAirController);
router.route('/v1/orders/{id}').use(OrdersController);
router.route('/v1/offers/{id}').use(OffersController);
router.route('/v1/dishes/{id}').use(DishesController);
router.route('/v1/upload/{id}').use(UploadController);
router.route('/v1/cities/{id}').use(CitiesController);
router.route('/v1/checkout/{id}').use(CheckoutController);
router.route('/v1/health').use(HealthControllerController);
router.route('/v1/check_pin/{id}').use(CheckPinController);
router.route('/v1/categories/{id}').use(CategoriesController);
router.route('/v1/involvement/{id}').use(InvolvementController);
router.route('/v1/restaurants/{id}').use(RestaurantsController);
router.route('/v1/average_price/{id}').use(AveragePriceController);
router.route('/v1/access_tokens/{id}').use(AccessTokensController);
router.route('/v1/update_push_token/{id}').use(UpdatePushTokenController);
router.route('/v1/restaurant_offers/{id}').use(RestaurantOffersController);
router.route('/v1/payment_result/{offerId}/{orderHash}/{result}').use(PaymentResultController);

router.route('/v1/admin/users/{id}').use(AdminUsersController);
router.route('/v1/admin/telegram_token/{id}').use(AdminTelegramTokenController);
router.route('/v1/payment/{secret}/{action}').use(PaymentController);
router.route('/v1/bill/{action}').use(BillController);
router.route('/v1/cards/{result}').use(CardsController);

/* generator: end routes */

module.exports = router;
