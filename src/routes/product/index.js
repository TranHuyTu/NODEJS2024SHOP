'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct));
router.get('', asyncHandler(productController.findAllProduct));
router.get('/type', asyncHandler(productController.findAllProductByType));
router.get('/:product_id', asyncHandler(productController.findProduct));
router.get('/num/:product_id', asyncHandler(productController.findProductByProductId));

// authentication //
router.use(authenticationV2);

/////////////////
router.post('', asyncHandler(productController.createProduct));
router.post('/spu/new', asyncHandler(productController.createSpu));
router.patch('/:productId', asyncHandler(productController.updateProduct));
router.post('/publish/:id', asyncHandler(productController.publishProductByShop));
router.post('/draft/:id', asyncHandler(productController.draftProductByShop));
router.post('/unPublish/:id', asyncHandler(productController.unPublishProductByShop));

//QUERY
router.get('/draft/all', asyncHandler(productController.getAllDraftForShop));
router.get('/draft/all/type', asyncHandler(productController.getAllDraftForShopByType));
router.get('/published/all', asyncHandler(productController.getAllPublishForShop));
router.get('/published/user/all', asyncHandler(productController.getAllPublishUserForShop));
router.get('/published/all/type', asyncHandler(productController.getAllPublishForShopByType));
router.get('/published/user/all/type', asyncHandler(productController.getAllPublishUserForShopByType));
router.post('/productType/all', asyncHandler(productController.findProductByProductType));
router.post('/productTypeAndShop/all', asyncHandler(productController.findProductByProductTypeAndShop));


module.exports = router