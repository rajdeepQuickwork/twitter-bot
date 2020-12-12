const { Autohook } = require("twitter-autohook");
const axios = require("axios");
const { config } = require("./config");
const { sayHi, respondFollower } = require("./message-response");
const { privateKey } = require("./privateKey");
const { updateDBWithUserInfo } = require("./db-methods");
const {
  getFollowerList,
  getTweetHistoryOfIds,
  getUser,
} = require("./follower-search");
const { getMotivationRecs, getFriendRecs } = require("./get-analytics-data");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(privateKey),
  databaseURL: "https://noti-9884e.firebaseio.com/",
});
const db = admin.firestore();

const lookUp = async (user, event) => {
  // Need a way to get the user's actual username rather than the screen name :/
  // We will use this method to parse through the new follower's relevant tweets
  // We will add it into our userData object and put it into our database.

  // const userData = {
  //   handle: '@Hello',
  //   screen_name: user,
  //   followers: '10',
  //   tweetList: [{
  //     tweetId: "10",
  //     tweetContent: "Hi with desktop publions of Lorem Ipsum. ",
  //     likes: '2',
  //     retweets: "3",
  //     comments: "4",
  //     creation: "date/time",
  //     tweetOwner: "@Hello",
  //     owner: "true"
  //   }],
  // }

  console.log(event.follow_events[0].source);

  console.log("user data:", event.follow_events[0].source);
  const userName = event.follow_events[0].source.screen_name;
  const userId = event.follow_events[0].source.id;
  const userData = event.follow_events[0].source;

  getTweetHistoryOfIds(userId, userData, updateDBWithUserInfo, userName, db);
};

// Test endpoint, we pass in the userId to our Axios get requests.
//getMotivationRecs('test');

//lookUp();
//console.log(getFollowerList('mrbenc88'))

const onFollow = (webhook) => {
  webhook.on("event", async (event) => {
    if (event.follow_events) {
      //console.log("Something happened:", event);
      // console.log(event.follow_events[0].target, event.follow_events[0].source);
      let user = event.follow_events[0].source.name;

      lookUp(user, event); // we call this method in order to parse through that user's tweets.
      // one api call here
      await respondFollower(event);
    }
    if (event.direct_message_events) {
      console.log("Person said hi");
      await sayHi(event);
    }
  });
};

(async (ƛ) => {
  // const webhook = new Autohook({ ...config });
  const webhook = new Autohook({
    consumer_key: "b29azRNSVJKQbMsvIdHg98aZp",
    consumer_secret: "YrgIT4w46cKijJ0JMn0IMR4YeMrH7lBYpXRN4x0Dd1ukq8sBLC",
    token: "1322442153260298241-uTRxcZKPwhX602nZCU5O09v6IcJN3b",
    token_secret: "1mSKtJqOKGy9fANizvTzu2nY66FQYbZLiryZJxu2ZwFpE",
    env: "env",
    port: 1337,
  });

  try {
    // Removes existing webhooks
    await webhook.removeWebhooks();

    // Listens to incoming activity
    await onFollow(webhook);

    // Starts a server and adds a new webhook
    await webhook.start();

    // Subscribes to a user's activity
    await webhook.subscribe({
      oauth_token: "1322442153260298241-uTRxcZKPwhX602nZCU5O09v6IcJN3b",
      oauth_token_secret: "1mSKtJqOKGy9fANizvTzu2nY66FQYbZLiryZJxu2ZwFpE",
    });
  } catch (e) {
    console.log(e);
  }
})();
