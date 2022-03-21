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



module.exports = router;
