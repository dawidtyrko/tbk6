const express = require('express');
const app = express();
const productsRouter = require('./routes/products');
const products = require('./products.json');

app.set('view engine','ejs')
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use('/products', productsRouter);
app.get('/',logger,(req,res)=>{
  res.render('index');
})

app.get('/admin',checkAuth,(req,res)=>{
  res.send('admin area');
})

app.get('/search',(req,res)=>{

  const category = req.query.category ? req.query.category : '';
  let maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  let minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const supplier = req.query.supplier ? req.query.supplier : '';

  if(maxPrice && isNaN(maxPrice)){
    maxPrice = null
  }
  if(minPrice && isNaN(minPrice)){
    minPrice = null
  }
  const filteredProducts = products.filter((product)=>{
    const categoryMatch = category ?
        product.category && product.category.toLowerCase() === category.toLowerCase() : true;

    const priceMaxMatch = maxPrice ? product.unitPrice <= maxPrice : true;
    const priceMinMatch = minPrice ? product.unitPrice >= minPrice : true;

    const supplierMatch = supplier ?
        product.supplier && product.supplier.toLowerCase() === supplier.toLowerCase() : true;
    return categoryMatch && priceMaxMatch && priceMinMatch && supplierMatch;
  })
  res.json(filteredProducts);
})


app.use((req,res)=>{
  res.status(404).render('404',{message:"Not Found"});
})
app.use(errorHandler);
function logger(req,res,next){
  console.log(req.method);
  console.log(req.originalUrl);
  console.log(new Date().toISOString());
  next()
}
function checkAuth(req,res,next){
  const header = req.headers['authorization'];
  if(!header || header !== 'tajny-kod'){
    return res.status(403).send('Not authorized');
  }
  next()
}
function errorHandler(err,req,res,next){
  console.error(err)
  if (err.status === 404) {
    // If error is 404 (Product not found), render the 404 page
    res.status(404).render('404', { message: err.message || 'Product not found' });
  } else {
    // If it's any other error, render a generic 500 server error page
    res.status(500).render('500', { message: 'Server error' });
  }
}
app.listen(3000)
console.log('Server started on port 3000');