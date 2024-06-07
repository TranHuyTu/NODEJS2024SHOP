'use strict';

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');
const { SuccessResponse } = require('../core/success.response');
const {incr,expire,ttl} = require('../models/repositories/limiter.repo');
const { newSpu } = require('../services/spu.service');
const { searchProductsSimilar } = require('../models/repositories/product.repo');


class ProductController {

    // SPU, SKU //
    createSpu = async (req, res, next)=>{
        try {
            // const spu = await newSpu({
            //     ...req.body,
            //     product_shop: req.user.userId
            // })

            new SuccessResponse({
                message: 'Product created successfully',
                metadata: await newSpu({
                    ...req.body,
                    product_shop: req.user.userId
                })
            }).send(res);
        } catch (error) {
            next(error);
        }
    };
    // END SPU, SKU //

    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product success !',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId,
            } )
        }).send( res );
    };   

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success !',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId,
            })
        }).send( res );
    };   

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product SHOP success !',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            } )
        }).send( res );
    }; 

    draftProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product SHOP success !',
            metadata: await ProductServiceV2.draftProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            } )
        }).send( res );
    };
    
    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish product SHOP success !',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            } )
        }).send( res );
    }; 

    //QUERY
    getAllDraftForShop= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft SHOP success !',
            metadata: await ProductServiceV2.findAllDraftForShop({
                page: req.query.page,
                product_shop: req.user.userId,
            })
        }).send( res );
    };

    getAllDraftForShopByType= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft SHOP success !',
            metadata: await ProductServiceV2.findAllDraftForShopByType({
                page: req.query.page,
                type: req.query.type,
                product_shop: req.user.userId,
            })
        }).send( res );
    };

    getAllPublishForShop= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish SHOP success !',
            metadata: await ProductServiceV2.findAllPublishForShop({
                page: req.query.page,
                product_shop: req.user.userId,
            })
        }).send( res );
    };

    getAllPublishUserForShop= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish SHOP success !',
            metadata: await ProductServiceV2.findAllPublishForShop({
                page: req.query.page,
                product_shop: req.query.shopId,
            })
        }).send( res );
    };

    getAllPublishForShopByType= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish SHOP success !',
            metadata: await ProductServiceV2.findAllPublishForShopByType({
                page: req.query.page,
                type: req.query.type,
                product_shop: req.user.userId,
            })
        }).send( res );
    };

    getAllPublishUserForShopByType= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish SHOP success !',
            metadata: await ProductServiceV2.findAllPublishForShopByType({
                page: req.query.page,
                type: req.query.type,
                product_shop: req.query.shopId,
            })
        }).send( res );
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list getListSearchProduct success !',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send( res );
    };

    findAllProduct = async (req, res, next) => {
        try {
            const getIPUser = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const numRequest = await incr(getIPUser);
            let _ttl;
            if(numRequest == 1){
                await expire(getIPUser, 60);
                _ttl = 60;
            }else{
                _ttl = await ttl(getIPUser);
            }

            if(numRequest >= 2000 ){
                 new SuccessResponse({
                    message: 'Server not found!',
                    metadata: {
                        ttl: _ttl,
                        numRequest: numRequest
                    }
                }).send( res ); 
            }else{
                new SuccessResponse({
                    message: 'Get list findAllProduct success !',
                    metadata: await ProductServiceV2.findAllProducts(req.query)
                }).send( res );
            }
        } catch (error) {
            console.error(error);
        }
        // new SuccessResponse({
        //     message: 'Get list findAllProduct success !',
        //     metadata: await ProductServiceV2.findAllProducts(req.query)
        // }).send( res );
    };

    findAllProductByType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list findAllProduct success !',
            metadata: await ProductServiceV2.findAllProductsByType(req.query)
        }).send( res );
    };

    findProduct = async (req, res, next) => {
        new SuccessResponse({
                message: 'Get list findProduct success !',
                metadata: await ProductServiceV2.findProduct({product_id: req.params.product_id})
            }).send( res );
    };

    findProductByProductId = async (req, res, next) => {
        new SuccessResponse({
                message: 'Get list findProductByProductId success !',
                metadata: await ProductServiceV2.findProductByProductId({product_id: req.params.product_id})
            }).send( res );
    };

    findProductByProductType = async (req, res, next) => {
        new SuccessResponse({
                message: 'Get list findProductByProductId success !',
                metadata: await ProductServiceV2.findProductByProductType(req.body)
            }).send( res );
    };

    findProductByProductTypeAndShop = async (req, res, next) => {
        new SuccessResponse({
                message: 'Get list findProductByProductId success !',
                metadata: await ProductServiceV2.findProductByProductTypeAndShop(req.body)
            }).send( res );
    };

    // searchProductsSimilar = async (req, res, next) => {
    //     new SuccessResponse({
    //             message: 'Get list findProductByProductId success !',
    //             metadata: await searchProductsSimilar(req.body)
    //         }).send( res );
    // };
    //END QUERY
}

module.exports = new ProductController();