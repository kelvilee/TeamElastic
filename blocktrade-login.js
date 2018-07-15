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
        //////////NAVBAR////////////
        ////////////////////////////
            response.write('<nav class="navbar navbar-inverse" style="background-color:darkblue">');
                response.write('<div class="container-fluid">');
                    response.write('<a class="navbar-brand" href="#">BLOCKTRADE</a>');
                    response.write('<div class="navbar-header" style="color:white">');
                        response.write('Your Bitcoin Address:<form style="color:black"><input type="text" size="32" placeholder="10101010101010101010101010101010" readonly></form>');
                        response.write('<button style="color: transparent; background-color: transparent; border-color: transparent;  cursor: default;"></button>');
                    response.write('</div>');
                    response.write('<div class="navbar-header" id="myNavbar" style="color:white">');
                        response.write('<ul class="nav navbar-nav navbar-right">');
                            response.write('Enter/update your Bitcoin Address:<form style="color:black"><input size="32" type="text"></form>');
                            response.write('<button style="color:black; width: 50%; ">Submit</button>');
                            response.write('<form action="/auth/logout" method="post">');
                            response.write('<input type="submit" value="Log Out" class="btn btn-primary"/></form>');
                        response.write('</ul>');
                    response.write('</div>');
                response.write('</div>');
            response.write('</nav>');

        ////////////////////////////
        //////////MODALS////////////
        ////////////////////////////
        response.write('<div class="modal fade" id="modalid">');
            response.write('<div class="modal-dialog modal-dialog-centered">');
                response.write('<div class="modal-content">');
                    response.write('<div class="modal-header mx-auto">');
                        response.write('<h3 id="modalHeaderID">Buy/Sell Item</h3>');
                    response.write('</div>');
                    response.write('<div class="modal-body col-6 mx-auto">');
                        response.write('Modal test');
                    response.write('</div>');
                response.write('</div>');
            response.write('</div>');
        response.write('</div>');

        ////////////////////////////
        ///////START OF BODY////////
        ////////////////////////////

        //response.write(request.session.passport && JSON.stringify(request.user) || 'None');
        // not really sure what this does
        JSON.stringify(request.user);
        //var user = "76561198056352118"
        //console.log("userSteamID in html is: " + userSteamId);
        var user = userSteamId;
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
            
            //response.write("your first item in your csgo inventory is: " + values[0]['name']);
            //console.log('image link: ' + '<img class="img-thumbnail" src=\"' + values[0]['image'] + '\">')
            response.write('<div class="container-fluid text-center">');  
                response.write('<div class="row content">');
                    response.write('<div class="col-sm-6 sidenav">');
                        response.write('<div class="well">');
                            response.write('<p>Your Items</p>');
                        response.write('</div>');
                        response.write('<div class="well">');
                            response.write('<p>Div holding all item divs</p>');
                                response.write('<div class="row">');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="0" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[0]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[0]['name'] + '\"</span></div></a></div>');
                                    const listen0 = new listen0();
                                    listen0.once('newListener', (event, listener) => {
                                        if (event === 'event') {
                                            listen0.on('event', () => {
                                                console.log("test")
                                            })
                                        }
                                        });
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="1" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[1]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[1]['name'] + '\"</span></div></a></div>');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="2" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[2]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[2]['name'] + '\"</span></div></a></div>');
                                response.write('</div>');
                                response.write('<div class="row">');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="3" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[3]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[3]['name'] + '\"</span></div></a></div>');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="4" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[4]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[4]['name'] + '\"</span></div></a></div>');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="5" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[5]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[5]['name'] + '\"</span></div></a></div>');
                                response.write('</div>');
                                response.write('<div class="row">');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="6" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[6]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[6]['name'] + '\"</span></div></a></div>');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="7" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[7]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[7]['name'] + '\"</span></div></a></div>');
                                    response.write('<div class="col-sm-4 cell modalButton"><a id="8" onClick="updateModal(this.id)" href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[8]['image'] + '\" class="img-thumbnail"><span id="span3" style="display: none;">\"' + values[8]['name'] + '\"</span></div></a></div>');
                                response.write('</div>');
                            response.write('</div>');
                        response.write('</div>');
                        response.write('<div class="col-sm-6 sidenav">');
                            response.write('<div class="well">');
                                response.write('<p>Available Items</p>');
                            response.write('</div>');
                            response.write('<div class="well">');
                                response.write('<p>Div holding all item divs</p>');
                            response.write('<div class="row">');
                                response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[9]['image'] + '\" class="img-thumbnail"></div></a></div>');
                                response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[10]['image'] + '\" class="img-thumbnail"></div></a></div>');
                                response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[11]['image'] + '\" class="img-thumbnail"></div></a></div>');
                            response.write('</div>');
            response.write('<div class="row">');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[12]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[13]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[14]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('</div>');
            response.write('<div class="row">');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[15]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[16]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('<div class="col-sm-4 cell modalButton"><a href="#" data-toggle="modal" data-target="#modalid"><div><img src=\"' + values[17]['image'] + '\" class="img-thumbnail"></div></a></div>');
            response.write('</div>');
            response.write('</div>');
            response.write('</div>');
            response.write('</div>');
            response.write('</div>');
        response.write('</div>');
        })
        response.write('<script src="https://code.jquery.com/jquery-3.3.1.js" integrity="sha256-2Kok7MbOyxpgUVvAk/HJ2jigOSYS2auK4Pfzbm7uH60=" crossorigin="anonymous"></script>');
        response.write('<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>');
        response.write('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>');
        
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


