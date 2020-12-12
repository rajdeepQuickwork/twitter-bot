// https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
const axios = require("axios");

const oAuthConfig = {
  consumer_key: "b29azRNSVJKQbMsvIdHg98aZp",
  consumer_secret: "YrgIT4w46cKijJ0JMn0IMR4YeMrH7lBYpXRN4x0Dd1ukq8sBLC",
  token: "1322442153260298241-uTRxcZKPwhX602nZCU5O09v6IcJN3b",
  token_secret: "1mSKtJqOKGy9fANizvTzu2nY66FQYbZLiryZJxu2ZwFpE",
};

const getUser = async (userId) => {
  // user tweets
  const baseUrl = "https://api.twitter.com/2/tweets";
  const params = {
    ids: userId,
    include_entities: true,
    headers: {
      Authorization:
        "Bearer AAAAAAAAAAAAAAAAAAAAAFPnJgEAAAAAXNNCdF3infsKllQ%2FKXcus6IiDVQ%3DB9pYMfGTUebpzMd6Y3sG4ruvMp5ptPyqL2K5vrvh1fL7lrULrm",
    },
  };
  const response = await axios.get(baseUrl, params);
  return response.data;
};

const getFollowerList = async (userName) => {
  const baseUrl = "https://api.twitter.com/1.1/followers/ids.json";
  const params = {
    cursor: -1,
    screen_name: userName,
    skip_status: true,
    include_user_entities: false,
  };

  const response = await axios.get(baseUrl, params);
  return response.data;
};

//array of ids
const getTweetHistoryOfIds = async (
  listOfIds,
  userData,
  updateDBWithUserInfo,
  userName,
  db
) => {
  var Twitter = require("twitter-node-client").Twitter;
  var error = function (err, response, body) {
    console.log("ERROR [%s]", err);
  };

  var config = {
    consumerKey: "b29azRNSVJKQbMsvIdHg98aZp",
    consumerSecret: "YrgIT4w46cKijJ0JMn0IMR4YeMrH7lBYpXRN4x0Dd1ukq8sBLC",
    accessToken: "1322442153260298241-uTRxcZKPwhX602nZCU5O09v6IcJN3b",
    accessTokenSecret: "1mSKtJqOKGy9fANizvTzu2nY66FQYbZLiryZJxu2ZwFpE",
  };
  var twitter = new Twitter(config);
  const response = twitter.getUserTimeline(
    { user_id: listOfIds, count: "10" },
    error,
    (res) => {
      const resp = JSON.parse(res).map((val) => {
        let str = val.text;
        str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
        return {
          tweet_id: val.id,
          tweet_text: str,
          like_count: val.favorite_count,
          retweet_count: val.retweet_count,
          created_at: val.created_at,
          is_retweeted: Boolean(val.retweeted_status),
          retweet_author: val.retweeted_status
            ? val.retweeted_status.user.screen_name
            : "original",
          entities: {
            hashtags: val.entities.hashtags,
            symbols: val.entities.symbols,
            user_mentions: val.entities.user_mentions,
            urls: val.entities.urls,
          },
        };
      });

      let output = {};
      resp.forEach((val, idx) => {
        output[idx] = val;
      });
      output.additionalInfo = userData;
      output.userCategory = null;
      output.mood = "Satisfied";
      output["happiest-tweet"] = null;
      output["saddest-tweet"] = null;

      updateDBWithUserInfo(userName, output, db);
    }
  );
  return response;
};

module.exports = {
  getFollowerList,
  getTweetHistoryOfIds,
  getUser,
};
