const express = require('express');
const router = express.Router();
const products = require('../products.json');
router.use(logger)

router.get('/', (req, res) => {
  res.json(products);
})
router.route('/:id').get((req, res,next) => {
  try{
    let product = products.find((product) => product.id === parseInt(req.params.id));
    if (!product) {
      const error = new Error('Product Not Found');
      error.status = 404;
      return next(error)
    }
    res.render('products/product.ejs',{product:product});

  }catch(err){
    next(err)
  }
})

function logger(req,res,next){
  console.log(req.method);
  console.log(req.originalUrl);
  console.log(new Date().toISOString());
  next()
}
module.exports = router;
