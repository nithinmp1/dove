var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;
const { response } = require('express');
var crypto = require('crypto');


module.exports = {
    doSignup: (userData) => {
        return new Promise(async(resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                let x = data.insertedId.toString()
                resolve(x)
            })

        })
    },

    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },

    

    addToCart:(proId, userId) => {
        let proObj = {
            item:objectId(proId),
            quantity : 1
        }
        return new Promise(async(resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})

            if (userCart) {
                let proExist = userCart.products.findIndex(product=> product.item == proId)
                console.log(proExist);
                if(proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                        {
                            $inc:{'products.$.quantity':1}
                        }
                    )
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $push:{products:proObj}
                    }
                    ).then((response) => {
                        resolve()
                    })
                }
               

            } else {
                let cartObj = {
                    user:objectId(userId),
                    products:[proObj]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },


    getCartProducts:(userId) => {
        return new Promise(async(resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
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
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products', 0]}
                    }
                }
                
            ]).toArray()
            // console.log(cartItems[0].products);
            resolve(cartItems)
        })
    },


    getCartCount:(userId) => {
        return new Promise(async(resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },

    changeProductQuantity:(details) => {
        console.log('gg', details);
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        console.log('ccc->', count);
        console.log('qqq->', quantity);
        return new Promise((resolve, reject) => {
            if(count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response) => {
                    resolve({removeProduct:true})
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart), 'products.item':objectId(details.product)},
                {
                    $inc:{'products.$.quantity':count}
                }).then((response) => {
                    resolve({status:true})
                })
            }








            
        })
    },


    removeItemFromCart:(cartId, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne(
                {_id:objectId(cartId)},
                {"$pull":{
                    "products":{"item":objectId(prodId)}
                }}
                ).then((response) => {
                    resolve(response)
                })
        })
    },

    getTotalAmount:(userId) => {
        return new Promise(async(resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
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
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products', 0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:[{$toInt:'$quantity'},{ $toInt: '$products.Price'}]}}
                    }
                }
            ]).toArray()

            if (Array.isArray(total) && total.length > 0) {
                resolve(total[0].total ?? 0); // Default to 0 if total[0].total is null or undefined
            }
            resolve(0);
        })
    },



    placeOrder:(order,products,total) => {
        return new Promise((resolve, reject) => {
            console.log(order,products,total);
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails : {
                    mobile : order.mobile,
                    address : order.address,
                    pincode : order.pincode
                },
                userId : objectId(order.userId),
                paymentMethod : order['payment-method'],
                products : products,
                totalAmount : total,
                status : status,
                date : new Date(), 
                orderNumber : crypto.randomInt(111111,999999)
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
            .then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve()
            })
        })
    },
    


    getCartProductList:(userId) => {
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION)
            .findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    },


    getUserOrders:(userId) => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)})
            .toArray()
            resolve(orders)
        })
    },


    getOrderProducts:(orderId) => {
        console.log('ffffffffff',orderId);
        return new Promise(async(resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products', 0]}
                    }
                }
            ]).toArray()
            console.log('o',orderItems);
            resolve(orderItems)
        })
    }

   



}