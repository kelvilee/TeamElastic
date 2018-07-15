const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const config = require('./config.json');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community: community,
    language: 'en'
});

const logOnOptions = {
    accountName: config.username,
    password: config.password,
    twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('Successfully logged on.')
});

client.on('webSession', (sessionid, cookies) => {
    manager.setCookies(cookies);
    community.setCookies(cookies);
    community.startConfirmationChecker(10000, config.identitySecret);
});

function acceptOffer(offer) {
    console.log("Offer Accepted!");
    offer.accept((err, status) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Accepted offer. Status: ${status}.');
        }
    });
}

function declineOffer(offer) {
    console.log("Offer Declined");
    offer.decline((err) => {
        if (err) {
            console.log("There was an error declining the offer")
        }
    });
}

client.setOption("promptSteamGuardCode", false);

manager.on('newOffer', (offer) => {
    if (offer.partner.getSteamID64() === config.ownerID) {
        acceptOffer(offer);
    } else {
        declineOffer(offer);
    }
});
