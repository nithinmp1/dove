var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;


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

    addToCart: (prodId, userId) => {
        return new Promise(async(reject, resolve) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                    $push: {
                        products: objectId(prodId)
                    }

                }).then((response) => {
                    resolve()
                })
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [objectId(prodId)]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async(reject, resolve) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                    $match: { user: objectId(userId) }

                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { prodList: '$products' },
                        pipeline: [{
                            $match: {
                                $expn: {
                                    $in: ['$_id', '$$prodList']
                                }
                            }
                        }],
                        as: 'cartitems'
                    }
                }

            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    }



}