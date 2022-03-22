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
    }
}