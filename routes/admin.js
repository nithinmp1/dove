const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var crypto = require('crypto');

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  })


});

router.get('/add-products', (req, res) => {
  res.render('admin/add-products', { admin: true })
})

router.post('/add-products', (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-products");
      } else {
        console.log(err);
      }
    })

  })
})


router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id;
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect('/admin/');
  })
})


router.get('/edit-product/:id', async (req, res) => {
  let products = await productHelper.getProductDetails(req.params.id);
  res.render('admin/edit-products', { products });
})


router.post('/edit-products/:id', (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/')
    if (req.files.image) {
      let image = req.files.image;
      image.mv('./public/product-images/' + req.params.id + '.jpg');
    }
  })
})

router.get('/all-orders', async (req, res) => {
  let orders = await productHelper.getAllOrders();
  res.render('admin/all-orders', { admin: true, orders });
})

router.get('/all-users', async (req, res) => {
  let users = await productHelper.getAllUsers();
  res.render('admin/all-users', { admin: true, users });
})


router.get('/view-order-details/:id', async (req, res) => {
  let orderDetails = await productHelper.getOrderDetails(req.params.id);
  let orderedItems = await productHelper.getOrderedItems(req.params.id);
  res.render('admin/order-details',
    {
      admin: true,
      orderId: req.params.id,
      order: orderDetails,
      userDetails: orderDetails.user,
      items: orderedItems
    });
})


router.post('/change-order-status', (req, res) => {
  productHelper.changeOrderStatus(req.body.orderId, req.body.orderStatus).then((response) => {
    res.send({ 'currentOrderStatus': response.status });
  })
})



module.exports = router;
