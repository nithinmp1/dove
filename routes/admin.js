const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {

  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  })
    
    
  });

router.get('/add-products', (req, res) => {
  res.render('admin/add-products')
})

router.post('/add-products', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);

  productHelper.addProduct(req.body, (id) => {
    console.log('ffff'+id);
    let image = req.files.image;
    image.mv('./public/product-images/'+id+'.jpg', (err, done) => {
      if(!err) {
        res.render("admin/add-products");
      } else {
        console.log(err);
        
      }
    })
    
  })
})


router.get('/delete-product/:id', (req, res) => {
  let productId = req.params.id;
  console.log(productId);
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect('/admin/');
  })
})


router.get('/edit-product/:id', async(req, res) => {
  let products = await productHelper.getProductDetails(req.params.id);
  console.log(products);
  res.render('admin/edit-products', {products});
})

router.post('/edit-products/:id', (req, res) => {
  console.log('ddddddddddddddddddd');
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/')
    if(req.files.image) {
      let image = req.files.image;
      image.mv('./public/product-images/'+req.params.id+'.jpg');
      
    }
  })
})

router.get('/all-orders', async(req, res) => {
  let orders = await productHelper.getAllOrders();
  res.render('admin/all-orders', {admin: true,orders});
})

router.get('/all-users', async(req, res) => {
  let users = await productHelper.getAllUsers();
  console.log(users);
  res.render('admin/all-users', {admin: true,users});
})



module.exports = router;
