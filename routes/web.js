const express = require("express");
const router = express.Router();
const { 
  authController,
  uploadController,
  adminController,
  masterController,
  articleController,
  puskesmasController,
  posyanduController,
  reportController 
} = require("../controllers");
const verifyUser = require("../middlewares/verify");
const masterMiddleware = require("../middlewares/master.middleware.js");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const userMiddleware = require("../middlewares/user.middleware");

// --auth
router.get("/login", verifyUser.loggedIn, authController.loginPage);
router.get("/register", verifyUser.loggedIn, authController.registerPage);
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);

// --general
router.get('/', [verifyUser.isLogin], adminController.dashboard)

// ---master
router.get("/users", [verifyUser.isLogin, verifyUser.isSuperAdmin], masterController.users);
router.get("/toddlers", [verifyUser.isLogin], masterController.toddlers);
router.get("/toddler/edit/:uuid", [verifyUser.isLogin], masterController.editToddlerPage);
router.post("/toddler/edit/:uuid", [verifyUser.isLogin, masterMiddleware.getProvKabKec], masterController.editToddler);
router.get("/toddlers/delete/:uuid", [verifyUser.isLogin], masterController.deleteToddlerPage);
router.post("/toddler/store", [verifyUser.isLogin, masterMiddleware.getProvKabKec], masterController.storeToddler);
router.get("/categories", [verifyUser.isLogin, verifyUser.isSuperAdmin], masterController.categories);
router.get("/puskesmas", [verifyUser.isLogin, verifyUser.isSuperAdmin], puskesmasController.getPuskesmas);
router.get("/posyandu", [verifyUser.isLogin, verifyUser.isSuperAdmin], posyanduController.getPosyandu);

router.get('/growth', [verifyUser.isLogin], adminController.growth)
router.get('/growth/:uuid', [verifyUser.isLogin], adminController.growthDetail)

router.get('/measurement', [verifyUser.isLogin], adminController.measurement)
router.post("/measurement/store", adminController.storeMeasurement);
router.get('/measurement/:uuid', [verifyUser.isLogin], adminController.measurementDetail)
router.get('/measurement/edit/:uuid', [verifyUser.isLogin], adminController.measurementEditPage)
router.post('/measurement/edit/:uuid', [verifyUser.isLogin], adminController.measurementEdit)

// ---algorithm
router.get("/importdataset", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.importdataset);
router.get("/dataprocessing", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.dataprocessing);
router.get("/performance", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.performance);
router.get("/dataprediction", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.dataprediction);
// router.get('/resultprediction', verifyUser.isSuperAdmin, adminController.resultprediction)
router.get("/testpredict", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.datapredictiontest);

// process
router.get("/logout", [verifyUser.isLogin], authController.logout);
router.post("/uploaddataset", [verifyUser.isLogin], multipartMiddleware, uploadController.dataset);
router.post("/processperformance", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.processperformance);
router.post("/processprediction", [verifyUser.isLogin, verifyUser.isSuperAdmin], adminController.processprediction);

router.post("/training", [verifyUser.isLogin], adminController.training);
router.post("/predict", [verifyUser.isLogin], adminController.predict);
router.post("/predicttest", [verifyUser.isLogin], adminController.predicttest);

router.post("/category/store", [verifyUser.isLogin], masterController.storecategory);
router.post("/categories/update/:uuid", [verifyUser.isLogin], masterController.updateCategory);
router.get("/categories/delete/:uuid", [verifyUser.isLogin], masterController.deleteCategory);

router.post("/users/store", [verifyUser.isLogin], masterController.storeUsers);
router.post("/users/update/:uuid", [verifyUser.isLogin], masterController.updateUser);
router.get("/users/editstatus/:uuid", [verifyUser.isLogin], masterController.editStatusUser);
router.get("/users/delete/:uuid", [verifyUser.isLogin], masterController.deleteUser);

router.post("/puskesmas/store", [verifyUser.isLogin], puskesmasController.storePuskesmas);
router.post("/puskesmas/:id", [verifyUser.isLogin], puskesmasController.getPuskesmasById);
router.post("/puskesmas/update/:uuid", [verifyUser.isLogin], puskesmasController.updatePuskesmas);
router.get("/puskesmas/delete/:uuid", [verifyUser.isLogin], puskesmasController.deletePuskesmas);

router.post("/posyandu/store", [verifyUser.isLogin], posyanduController.storePosyandu);
router.post("/posyandu/update/:uuid", [verifyUser.isLogin], posyanduController.updatePosyandu);
router.get("/posyandu/delete/:uuid", [verifyUser.isLogin], posyanduController.deletePosyandu);

router.post("/insertarticle", [verifyUser.isLogin, userMiddleware.validateImages], articleController.insertarticle);
router.get("/getarticle/delete/:uuid", [verifyUser.isLogin], articleController.deleteArticle);
router.get("/getarticle", [verifyUser.isLogin], articleController.getarticle);
router.get("/getarticle/:slug", [verifyUser.isLogin], articleController.getDetailArticle);
router.get("/insertarticle", [verifyUser.isLogin], articleController.article);
router.get("/editarticle/:slug", [verifyUser.isLogin], articleController.editArticle);
router.post("/editarticle/:slug", [verifyUser.isLogin], articleController.editArticlePut);

router.get("/report/measurement/:year", [verifyUser.isLogin], reportController.measurement);
router.get("/report/accumulation/:month/:year", [verifyUser.isLogin], reportController.accumulation);

module.exports = router;
