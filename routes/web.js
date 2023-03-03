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

router.use(verifyUser.isLogin)

// --general
router.get('/', adminController.dashboard)

// ---master
router.get("/users", verifyUser.isSuperAdmin, masterController.users);
router.get("/toddlers", masterController.toddlers);
router.get("/toddler/edit/:uuid", masterController.editToddlerPage);
router.post("/toddler/edit/:uuid", masterMiddleware.getProvKabKec, masterController.editToddler);
router.get("/toddlers/delete/:uuid", masterController.deleteToddlerPage);
router.post("/toddler/store", masterMiddleware.getProvKabKec, masterController.storeToddler);
router.get("/categories", verifyUser.isSuperAdmin, masterController.categories);
router.get("/puskesmas", verifyUser.isSuperAdmin, puskesmasController.getPuskesmas);
router.get("/posyandu", verifyUser.isSuperAdmin, posyanduController.getPosyandu);

router.get('/growth', adminController.growth)
router.get('/growth/:uuid', adminController.growthDetail)

router.get('/measurement', adminController.measurement)
router.post("/measurement/store", adminController.storeMeasurement);
router.get('/measurement/:uuid', adminController.measurementDetail)
router.get('/measurement/edit/:uuid', adminController.measurementEditPage)
router.post('/measurement/edit/:uuid', adminController.measurementEdit)

// ---algorithm
router.get("/importdataset", verifyUser.isSuperAdmin, adminController.importdataset);
router.get("/dataprocessing", verifyUser.isSuperAdmin, adminController.dataprocessing);
router.get("/performance", verifyUser.isSuperAdmin, adminController.performance);
router.get("/dataprediction", verifyUser.isSuperAdmin, adminController.dataprediction);
// router.get('/resultprediction', verifyUser.isSuperAdmin, adminController.resultprediction)
router.get("/testpredict", verifyUser.isSuperAdmin, adminController.datapredictiontest);

// process
router.get("/logout", authController.logout);
router.post("/uploaddataset", multipartMiddleware, uploadController.dataset);
router.post("/processperformance", verifyUser.isSuperAdmin, adminController.processperformance);
router.post("/processprediction", verifyUser.isSuperAdmin, adminController.processprediction);

router.post("/training", adminController.training);
router.post("/predict", adminController.predict);
router.post("/predicttest", adminController.predicttest);

router.post("/category/store", masterController.storecategory);
router.post("/categories/update/:uuid", masterController.updateCategory);
router.get("/categories/delete/:uuid", masterController.deleteCategory);

router.post("/users/store", masterController.storeUsers);
router.post("/users/update/:uuid", masterController.updateUser);
router.get("/users/editstatus/:uuid", masterController.editStatusUser);
router.get("/users/delete/:uuid", masterController.deleteUser);

router.post("/puskesmas/store", puskesmasController.storePuskesmas);
router.post("/puskesmas/:id", puskesmasController.getPuskesmasById);
router.post("/puskesmas/update/:uuid", puskesmasController.updatePuskesmas);
router.get("/puskesmas/delete/:uuid", puskesmasController.deletePuskesmas);

router.post("/posyandu/store", posyanduController.storePosyandu);
router.post("/posyandu/update/:uuid", posyanduController.updatePosyandu);
router.get("/posyandu/delete/:uuid", posyanduController.deletePosyandu);

router.post("/insertarticle", userMiddleware.validateImages, articleController.insertarticle);
router.get("/getarticle/delete/:uuid", articleController.deleteArticle);
router.get("/getarticle", articleController.getarticle);
router.get("/getarticle/:slug", articleController.getDetailArticle);
router.get("/insertarticle", articleController.article);
router.get("/editarticle/:slug", articleController.editArticle);
router.post("/editarticle/:slug", articleController.editArticlePut);

router.get("/report/measurement/:year", reportController.measurement);
router.get("/report/accumulation/:month/:year", reportController.accumulation);

module.exports = router;
