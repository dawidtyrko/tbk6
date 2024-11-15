const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const products = require('../products.json');
const filePath = path.join(__dirname, '../products.json');
router.use(logger)
const loadProducts = () => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const saveProducts = (products) => fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');

router.get('/', (req, res) => {
  //res.json(products);
    const products = loadProducts();
    res.json(products);
})
router.route('/:id').get((req, res,next) => {
  try{
      const products = loadProducts();
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
router.post('/', (req, res) => {
    const product = req.body;
    console.log(product)
    if (!product || Object.keys(product).length === 0) {
        return res.status(400).json({ error: 'Product data is required' });
    }
    const productsList = loadProducts();

    const id = productsList.length ? productsList[productsList.length - 1].id+1 : 1

    const newProduct = {id, ...product};
    console.log(newProduct);
    productsList.push(newProduct);
    saveProducts(productsList);
    res.status(201).send(newProduct);
})

router.put('/:id', (req, res) => {
    const products = loadProducts();
    const id = parseInt(req.params.id);
    const updatedProduct = req.body;

    // Find the index of the product
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product Not Found' });
    }

    // Replace the product
    products[productIndex] = { id, ...updatedProduct };

    // Save back to the JSON file
    saveProducts(products);

    res.status(201).json(products[productIndex]);
});

router.patch('/:id', (req, res) => {
    const products = loadProducts();
    const id = parseInt(req.params.id);
    const updates = req.body;

    // Find the product
    const product = products.find((product) => product.id === id);

    if (!product) {
        return res.status(404).json({ error: 'Product Not Found' });
    }

    // Apply updates
    Object.assign(product, updates);

    // Save back to the JSON file
    saveProducts(products);

    res.status(201).json(product);
});

router.delete('/:id', (req, res) => {
    const products = loadProducts();
    const id = parseInt(req.params.id);

    // Filter out the product to delete
    const newProducts = products.filter((product) => product.id !== id);

    if (newProducts.length === products.length) {
        return res.status(404).json({ error: 'Product Not Found' });
    }

    // Save the updated list back to the JSON file
    saveProducts(newProducts);

    res.status(204).json({message: 'Product deleted'}); // No content
});

function logger(req,res,next){
  console.log(req.method);
  console.log(req.originalUrl);
  console.log(new Date().toISOString());
  next()
}
module.exports = router;
