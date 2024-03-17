'use strict';

const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');
const { SuccessResponse } = require('../core/success.response');
const {incr,expire,ttl} = require('../models/repositories/limiter.repo');


class ProductController {

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
                product_shop: req.user.userId,
            })
        }).send( res );
    };

    getAllPublishForShop= async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish SHOP success !',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
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
            const getIPUser = 'IP-CLIENT'; //req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(req.connection.remoteAddress );
            const numRequest = await incr(getIPUser);

            let _ttl;
            if(numRequest == 1){
                await expire(getIPUser, 60);
                _ttl = 60;
            }else{
                _ttl = await ttl(getIPUser);
            }

            if(numRequest >= 20 ){
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

    findProduct = async (req, res, next) => {
        new SuccessResponse({
                message: 'Get list findProduct success !',
                metadata: await ProductServiceV2.findProduct({product_id: req.params.product_id})
            }).send( res );
    };
    //END QUERY
}

module.exports = new ProductController();