const admin = require("firebase-admin");
const functions = require("firebase-functions");

const axios = require("axios").default;
const imgur = require("imgur");

const db = admin.firestore();

const headers = require("./config");

exports.handler = async (change, context) => {
  const id = context.params.id;
  const fsdata = change.after.exists ? change.after.data() : null;
  const previousFsData = change.before.exists ? change.before.data() : null;

  //exit if data is null
  if (!fsdata) {
    return null;
  }

  //prevent infinite loop
  if (fsdata?.id === previousFsData?.id) {
    return null;
  }

  imgur.setClientId("1cda4cbf2fc4587");
  imgur.setAPIUrl("https://api.imgur.com/3/");

  //Post//
  let optionsPost = {
    method: "GET",
    url: "https://instagram68.p.rapidapi.com/p/" + id,
    headers: headers("instagram68.p.rapidapi.com")
  };
  // fetch data from a url endpoint
  const response = await axios
    .request(optionsPost)
    .catch(err => console.log(err));
  const data = await response.data;

  const username = data.author.username;
  const image = await imgur.uploadUrl(data.previews.original);
  ////
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
    .catch(err => console.log(err));
  const data2 = await response2.data;

  const image2 = await imgur.uploadUrl(data2.profile_pic_url_hd);
  ////

  const batch = db.batch();

  batch.set(
    db.collection("lures").doc(data.shortcode),
    {
      username: username,
      displayname: data.author.full_name,
      avatar: image2.link,
      image: image.link,
      description: data.caption,
      id: data.shortcode,
      created: data.created_at,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      category: fsdata.category,
      subcategory: fsdata.subcategory,
      key: fsdata.key,
      name: fsdata.name,
      price: fsdata.price
    },
    {merge: true}
  );

  batch.set(
    db.collection("users").doc(username),
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
};
