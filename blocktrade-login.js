////////////////Steam inventory api
var steamUserInventory = require('steam-user-inventory');
steamUserInventory('awtt').then(data => {
	// console.log(data);
});

///////////Steam Web Api Wrapper for node.js
const SteamAPI = require('steamapi');
const steam = new SteamAPI('11E3AA160F6F8CC916342CC0AA61C161');

/*Using firebase express for session handling, https://github.com/expressjs/session 
This package handles the fundamentals of getting and setting cookies and routing
session data in and out of your database backend.
*/ 

var app = require("express")()

//Session code
var session = require('express-session');
var FirebaseStore = require('connect-firebase')(session);

// Now we've got a session manager that can use Firebase databases.
// We need to configure this manager to speak to a particular Firebase
// database that we control
var firebaseStoreOptions = {
    host: 'blocktrade-ab849.firebaseio.com',
    token: 'AIzaSyC6nUoITJlvJvAw-d26WKG30Uwh_KBrKZs',
    // How often expired sessions should be cleaned up
    //reapInterval: 600000,  
  };
  
  app.use(session({
    store: new FirebaseStore(firebaseStoreOptions),
    secret: 'PERRY12345', // Change this to anything else
    resave: false,
    saveUninitialized: true
  }));

/* OPENID for steam login*/

var userSteamId;
var OpenIDStrategy = require('passport-openid').Strategy;
var SteamStrategy = new OpenIDStrategy({
        // OpenID provider configuration
        providerURL: 'http://steamcommunity.com/openid',
        stateless: true,
        // How the OpenID provider should return the client to us
        returnURL: 'http://localhost:4000/auth/openid/return',
        realm: 'http://localhost:4000/',
    },

    function(identifier, done) {

        console.log("inside steam strategy");
        process.nextTick(function () {
            // Retrieve user from Firebase and return it via done().
            var user = {
                identifier: identifier,
                // Extract the Steam ID from the Claimed ID ("identifier")
                steamId: identifier.match(/\d+$/)[0]
            };
            userSteamId = identifier.match(/\d+$/)[0];
            console.log("userSteamId: " + identifier.match(/\d+$/)[0]);

            return done(null, user);
        });
    });

var passport = require('passport');
passport.use(SteamStrategy);


passport.serializeUser(function(user, done) {
    done(null, user.identifier);
});


passport.deserializeUser(function(identifier, done) {

    //can also fetch from database
    done(null, {
        identifier: identifier,
        steamId: identifier.match(/\d+$/)[0]
    });
});


app.use(passport.initialize());
app.use(passport.session());


//set up routes
app.post('/auth/openid', passport.authenticate('openid'));

app.get('/auth/openid/return', passport.authenticate('openid', {
    'successRedirect': '/',
    'failureRedirect': '/auth/failure'
}));

//logout feature
app.post('/auth/logout', function(request, response) {
    request.logout();
    // After logging out, redirect the user to root site
    response.redirect(request.get('Referer') || '/')
   // response.end("something");
});

//raw html to display the html page
app.get('/', function(request, response) {

    response.write('<!DOCTYPE html>');
    response.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css" integrity="sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B" crossorigin="anonymous">');
    //response.writeHead(200, {"Content-Type":"text/plain"})
   // response.write("hello world")
    if (request.user) {
        ////////////////////////////
        ///////START OF HTML BODY///
        ////////////////////////////
        response.write('<div class="container">');

        ////////////////////////////
        //////////NAVBAR////////////
        ////////////////////////////
            response.write('<nav class="navbar navbar-dark bg-dark">')
                response.write('<a class="navbar-brand" href="#">BlockTrade</a>')
            response.write('</nav>')

        ////////////////////////////
        //////////LOGOUT BUTTON/////
        ////////////////////////////
        response.write(request.session.passport && JSON.stringify(request.user) || 'None');
        response.write('<form action="/auth/logout" method="post">');
        response.write('<input type="submit" value="Log Out" class="btn btn-primary"/></form>');
        var user = "76561198056352118"
        console.log("userSteamID in html is: " + userSteamId);
        //var user = userSteamId;
        var game = "730/2/"
        //console.log("console" + steamUserInventory(user, game)[0]);
        var promise = steamUserInventory(user, game);
        promise.then(function(values) {
            console.log("bai" + values[0]['id']);
            console.log(values[0]['name']);
            console.log(values[0]['image']);
            steam.getUserSummary(userSteamId).then(summary => {
                response.write('<img src=\"' + summary["avatar"]["small"] + '\">');
                response.write(summary["nickname"]);
                
                console.log(summary["nickname"]);
                
            });
            response.write("your first item in your csgo inventory is: " + values[0]['name']);
            console.log('image link: ' + '<img class="img-thumbnail" src=\"' + values[0]['image'] + '\">')
            response.write('<img src=\"' + values[0]['image'] + '\" class="img-thumbnail">');
            response.write('<img src=\"' + values[1]['image'] + '\" class="img-thumbnail">');
            response.write('<img src=\"' + values[2]['image'] + '\" class="img-thumbnail">');
            response.write('<img src=\"' + values[3]['image'] + '\" class="img-thumbnail">');
            response.write('<img src=\"' + values[4]['image'] + '\" class="img-thumbnail">');
            response.write('<img src=\"' + values[5]['image'] + '\" class="img-thumbnail">');
        response.write('</div>');
        })

  
       // response.write("hello" + JSON.stringify(steamUserInventory(user, game)));
        //console.log("console" + steamUserInventory(user, game));
        
    } else {
        if (request.query.steamid) {
            response.write('Not logged in.');
        }
        response.write('<form action="/auth/openid" method="post">');
        response.write(
            '<input name="submit" type="image" src="http://steamcommunity-a.' +
            'akamaihd.net/public/images/signinthroughsteam/sits_small.png" ' +
            'alt="Sign in through Steam"/></form>');
    } 
    //response.send();
    //response.end("something");
});


//start server at port 4000
var port = 4000;
var server = app.listen(port);
console.log('Listening on port ' + port);


