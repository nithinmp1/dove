var db = require('../config/connection');
var collection = require('../config/collection');
const { response } = require('express');
var objectId = require('mongodb').ObjectId;

module.exports={
    addProduct:(product, callback) => {
        // console.log(product);

        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data)
            console.log(data.insertedId)
            let x = data.insertedId.toString()
            console.log(x);
            callback(x)
        })
    },

    getAllProducts:() => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },


    deleteProduct:(productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then((response) => {
                resolve(response)
            })
        })
    },



    getProductDetails:(productId)  => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product) => {
                resolve(product)
            })
        })
    },


    updateProduct:(productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(productId)}, {
                $set:{
                    Name:productDetails.Name,
                    category:productDetails.category,
                    Price:productDetails.Price,
                    Description:productDetails.Description
                }
            }).then((response) => {
                resolve()
            })
        })
    },

    getAllOrders:() => {
        // return new Promise((resolve, reject) => {
        //     let orders = db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        //     resolve(orders)
        // })

        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $lookup: {
                        from:collection.USER_COLLECTION,
                        localField:'userId',
                        foreignField:'_id',
                        as:'users'
                    }
                },
                {
                    $unwind:'$users'
                }
            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },

    getAllUsers:() => {
        return new Promise((resolve, reject) => {
            let users = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

    changeOrderStatus:(orderId,orderStatus) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                $set:{
                    status: orderStatus
                }
            }).then(async(response) => {
                if(response) {
                    let currentOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)});
                    resolve(currentOrderStatus)
                }
            })
        })
        
    },

    getOrderDetails:(orderId) => {
        return new Promise(async(resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                // {
                //     $unwind:'$products'
                // },
                
                
                {
                    $lookup : {
                        from : collection.USER_COLLECTION,
                        localField : 'userId',
                        foreignField : '_id',
                        as : 'user'
                    }
                },
                {
                    $unwind : '$user'
                },
                
                // {
                //     $unwind:'$products'
                // },
                // {
                //     $project:{
                //         item:'$products.item',
                //         quantity:'$products.quantity'
                //     }
                // },
                
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTION,
                //         localField:'item',
                //         foreignField:'_id',
                //         as:'products'
                //     }
                // },
                // {
                //     $unwind:'$products'
                // },
                // {   
                //     $project : {
                //         productName : '$products.Name',
                //         user : '$user.Name'
                //         // sub_category_id : '$sub_category_id',
                //         // sub_category_name : '$subCategoryDetails.sub_category',
                //         // product_name : '$product_name',
                //         // price : '$price'
                //     }
                // }
               
                
                
            ]).toArray()
            console.log('o',orderDetails.products);
            resolve(orderDetails[0])
        })
    },

    getOrderedItems:(orderId) => {
        return new Promise(async(resolve, reject) => {
            let items = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project: {
                        item : '$products.item',
                        quantity : '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $unwind:'$products'
                }
                
            ]).toArray()
            resolve(items)
        })
    }
}