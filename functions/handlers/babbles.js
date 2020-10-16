const { db } = require('./../util/admin');

const config = require('./../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.getAllBabbles = (req, res) => {
  admin
    .firestore()
    .collection("babbles")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let babbles = [];
      data.forEach((doc) => {
        babbles.push({
          babbleId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(babbles);
    })
    .catch((err) => console.log(err));
};

exports.postOneBabble = (req, res) => {
  const newBabble = {
    body: req.body.body,
    // userHandle: req.body.userHandle,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("babbles")
    .add(newBabble)
    .then((doc) => {
      return res.json({ message: `document ${doc.id} created successfully.` });
    })
    .catch((err) => {
      res.status(500).json({ error: `Something went wrong` });
      console.log(err);
    });
};