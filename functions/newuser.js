const admin = require("firebase-admin");
const db = admin.firestore();

const axios = require("axios").default;
const imgur = require("imgur");
const headers = require("./config-rapidapi");

exports.handler = async (snap, context) => {
  const username = snap.data().username;

  imgur.setClientId("1cda4cbf2fc4587");
  imgur.setAPIUrl("https://api.imgur.com/3/");

  // User//
  const optionsUser = {
    method: "GET",
    url: "https://instagram40.p.rapidapi.com/account-info",
    params: {username: username},
    headers: headers("instagram40.p.rapidapi.com"),
  };
  // fetch data from a url endpoint
  const response2 = await axios
      .request(optionsUser)
      .catch((err) => console.log(err.response));
  const data2 = await response2.data;

  const image2 = await imgur.uploadUrl(data2.profile_pic_url_hd);
  const bio = data2.biography;
  const externalurl = data2.external_url;
  const following = data2.edge_follow.count;
  const followers = data2.edge_followed_by.count;
  const displayname = data2.full_name;
  // //

  const batch = db.batch();

  batch.set(
      db.collection("makers").doc(username),
      {
        bio: bio,
        externalurl: externalurl,
        displayname: displayname,
        avatar: image2.link,
        username: username,
        following: following,
        followers: followers,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
  );

  return batch.commit();
};
