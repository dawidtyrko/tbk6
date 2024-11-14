const express = require('express');
const app = express();
const productsRouter = require('./routes/users');
const products = require('./products.json');

app.set('view engine','ejs')
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
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : null;
  if(!isNaN(maxPrice)){
    maxPrice = null
  }
  const filteredProducts = products.filter((product)=>{
    const categoryMatch = category ? product.category.toLowerCase() === category.toLowerCase() : true;
    const priceMatch = maxPrice ? product.unitPrice <= maxPrice : true;
    return categoryMatch && priceMatch;
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