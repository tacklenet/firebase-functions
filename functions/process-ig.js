const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true
});

const axios = require("axios").default;
const imgur = require("imgur");

const headers = require("./config");

exports.handler = async (change, context) => {
  const fsdata = change.after.exists ? change.after.data() : null;
  const previousFsData = change.before.exists ? change.before.data() : null;

  //exit if data is null
  if (!fsdata) {
    return null;
  }

  //prevent infinite loop
  if (fsdata === previousFsData) {
    return null;
  }

  //set id from after data
  const id = fsdata.id;

  imgur.setClientId("1cda4cbf2fc4587");
  imgur.setAPIUrl("https://api.imgur.com/3/");

  //Post//
  let optionsPost = {
    method: "GET",
    url: "https://instagram40.p.rapidapi.com/media-info",
    params: {code: id},
    headers: headers("instagram40.p.rapidapi.com")
  };

  // fetch data from a url endpoint
  const response = await axios
    .request(optionsPost)
    .catch(err => console.log(err.response));
  const data = await response.data;

  const username = data.owner.username;
  const displayname = data.owner.full_name;
  const image = await imgur.uploadUrl(data.display_url);
  const created = data.taken_at_timestamp;
  const caption = data.accessibility_caption;
  const shortcode = data.shortcode;

  //User//
  var optionsUser = {
    method: "GET",
    url: "https://instagram40.p.rapidapi.com/account-info",
    params: {username: username},
    headers: headers("instagram40.p.rapidapi.com")
  };
  // fetch data from a url endpoint
  const response2 = await axios
    .request(optionsUser)
    .catch(err => console.log(err.response));
  const data2 = await response2.data;

  const image2 = await imgur.uploadUrl(data2.profile_pic_url_hd);
  const bio = data2.biography;
  const externalurl = data2.external_url;
  const following = data2.edge_follow.count;
  const followers = data2.edge_followed_by.count;
  ////

  const batch = db.batch();

  batch.set(
    db.collection("lures").doc(data.shortcode),
    {
      username: username,
      displayname: displayname,
      caption: caption,
      avatar: image2.link,
      image: image.link,
      id: shortcode,
      created: created,
      description: fsdata?.description,
      category: fsdata?.category,
      subcategory: fsdata?.subcategory,
      key: fsdata?.key,
      name: fsdata?.name,
      price: fsdata?.price,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {merge: true}
  );

  batch.set(
    db.collection("users").doc(username),
    {
      bio: bio,
      externalurl: externalurl,
      displayname: displayname,
      avatar: image2.link,
      username: username,
      following: following,
      followers: followers,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {merge: true}
  );

  return batch.commit();
};
