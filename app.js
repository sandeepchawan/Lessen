var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var winston = require('winston');
var fileUpload = require('express-fileupload');
var cloudinary = require('cloudinary');

var session = require('client-sessions');

var mongo = require("./routes/mongo");

var mongoURL = "mongodb://localhost:27017/lessen";
//var mongoURL = "mongodb://admin:admin@ds119768.mlab.com:19768/lessen";

var routes = require('./routes');
var user = require('./routes/user');
var login = require('./routes/login');
var product = require('./routes/product');
var cart = require('./routes/cart');

var app = express();

app.use(session({
        cookieName: 'session',
        secret: 'lessen_secret',
        duration: 30 * 60 * 1000,    //setting the time for active session
        activeDuration: 10 * 60 * 1000,
    })
); // setting time for the session to be active when the window is open // 10 minutes set currently

cloudinary.config({
    cloud_name: 'sandeepchawan',
    api_key: '425614399789695',
    api_secret: 'TU7K6_zZrF50hQ-r233hgZwlBOc'
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get('/', login.login);
app.get('/login', login.login);
app.get('/logout', login.logout);


app.post('/validateuser', login.validateUser);

app.get('/homepage',login.redirectToHomepage);
app.get('/listproducts/:cid', product.listproducts);
app.get('/showproduct/:pid', product.showProduct);
app.get('/sell', product.sell);
app.post('/register', login.register);
app.post('/directsell', product.directSell);
app.post('/auctionsell', product.auctionSell);
app.post('/search', product.search);
app.get('/myaccount', user.account);
app.get('/user/:id', user.show);
app.get('/purchasehistory', user.purchaseHistory);
app.get('/sellhistory', user.sellHistory);
app.get('/bidhistory', user.bidHistory);
app.get('/cart', cart.cart);
app.post('/cart/remove/:pid', cart.remove);
app.get('/cart/remove', cart.cart);
app.get('/cart/remove/:pid', cart.cart);
app.post('/cart', cart.addToCart);
app.get('/payment', cart.payment);
app.get('/thankyou', cart.thankyou);
app.post('/checkout', cart.checkout);
app.post('/product/bid/:id', product.bid);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

mongo.connect(mongoURL, function(){
    console.log('Connected to mongo at: ' + mongoURL);
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ', app.get('port'));
    });
 });

module.exports = app;
