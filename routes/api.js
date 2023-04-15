const app = require("express");
const router = app.Router();
const { 
  authController, 
  articleController, 
  puskesmasController, 
  posyanduController,
  measurementController,
  growthController,
  measurementsController,
  toddlersController,
  parentController
} = require("../controllers/api")
const { authMiddleware } = require("../middlewares/api")

// router.post('/user/store', userMiddleware.validateUserStore, userController.userStore)

router.post("/login", authController.login)
router.post("/register", authMiddleware.validateRegister, authController.register)

router.get("/article", articleController.getAllArticle);
router.get("/article/:uuid", articleController.getSpesificArticle);
router.get("/calculator", measurementsController.calculator);

// Growth
router.get("/growth/:uuid", growthController.growthDetail);

// measurement
router.get("/measurement-report", measurementController.measurementReport);
router.get("/accumulation-report", measurementController.accumulationReport);

router.use(authMiddleware.isLoggedIn)

router.get('/me', authController.me)

router.get("/puskesmas", puskesmasController.getAllPuskesmas);
router.get("/puskesmas/:uuid", puskesmasController.getSpesificPuskesmas);

router.get("/posyandu", posyanduController.getAllPosyandu);
router.get("/posyandu/:uuid", posyanduController.getSpesificPosyandu);
router.get("/posyandu/:uuid", posyanduController.getSpesificPosyandu);

// toddlers
router.get("/toddlers", toddlersController.getAllToddlers);
router.get("/toddlers/:uuid", toddlersController.getSpesicificToddler);
router.post("/toddlers/", toddlersController.storeToddler);
router.put("/toddlers/:uuid", toddlersController.editToddler);

// measurement
router.get("/measurement", measurementsController.getAllMeasurements);
router.get("/measurement/:uuid", measurementsController.getDetailMeasurements);
router.post("/measurement", measurementsController.storeMeasurement);

// parents
router.get("/parents", parentController.getAll)

module.exports = router;
