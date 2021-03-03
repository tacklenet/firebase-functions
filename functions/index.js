const functions = require("firebase-functions");

const config = require("./config");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

var axios = require("axios").default;
var imgur = require("imgur");

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Running...");

  async function asyncFunc() {
    imgur.setClientId("1cda4cbf2fc4587");
    imgur.setAPIUrl("https://api.imgur.com/3/");

    const id = "CL6zkBeLHRB";

    //Post//
    const key = config.config.rapidkey;
    let optionsPost = {
      method: "GET",
      url: "https://instagram68.p.rapidapi.com/p/" + id,
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "instagram68.p.rapidapi.com"
      }
    };
    // fetch data from a url endpoint
    const response = await axios.request(optionsPost);
    const data = await response.data;

    const username = data.author.username;
    const image = await imgur.uploadUrl(data.previews.original);
    ////
    //User//
    var optionsUser = {
      method: "GET",
      url: "https://instagram40.p.rapidapi.com/account-info",
      params: {username: username},
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "instagram40.p.rapidapi.com"
      }
    };
    // fetch data from a url endpoint
    const response2 = await axios.request(optionsUser);
    const data2 = await response2.data;

    const image2 = await imgur.uploadUrl(data2.profile_pic_url_hd);
    ////

    const batch = admin.firestore().batch();
    batch.set(
      admin
        .firestore()
        .collection("lures")
        .doc(data.shortcode),
      {
        username: username,
        displayname: data.author.full_name,
        avatar: image2.link,
        image: image.link,
        description: data.caption,
        id: data.shortcode,
        created: data.created_at,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      {merge: true}
    );

    batch.set(
      admin
        .firestore()
        .collection("users")
        .doc(username),
      {
        bio: data.author.biography,
        externalurl: data.author.external_url,
        displayname: data.author.display_name,
        avatar: image2.link,
        username: username,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      {merge: true}
    );

    return batch.commit();
  }

  const batch = asyncFunc();

  return batch;
});
