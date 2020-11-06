const express = require('express');
const router = express.Router();
const { admin, db } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const FBAuth = require('./../util/fbAuth');
const { region } = require('firebase-functions');

// exports.getAllBabbles = (req, res) => {
router.get('/', (req, res) => {
  admin
    .firestore()
    .collection("babbles")
    .orderBy("createdAt", "desc")
    .get()
    .then((babblesData) => {
      let babbles = [];
      babblesData.forEach((doc) => {
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
});

// exports.postOneBabble = (req, res) => {
router.post('/babble', FBAuth, (req, res) => {
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
});

router.get('/:babbleId', (req, res) => {
  let babbleData = {};
  db.doc(`/babbles/${ req.params.babbleId }`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({ error: 'Babble not found' })
      }
      babbleData = doc.data();
      babbleData.babbleId = doc.id;
      // return db.collection('comments').orderBy('createdAt', 'desc').where('babbleId', '==', req.params.babbleId).get()
      return db.collection('comments').where('babbleId', '==', req.params.babbleId).get()
    })
    .then(data => {
      babbleData.comments = [];
      // console.log('inside comments section...')
      data.forEach(doc => {
        babbleData.comments.push(doc.data());
      });
      return res.json(babbleData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.code });
    })
})

router.post('/:babbleId/comment', FBAuth, (req, res) => {
  if(req.body.body.trim() === '') return res.status(400).json({ error: 'Must not be empty'});

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.babbleId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  }

  db.doc(`babbles/${req.params.babbleId}`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({ error: 'Scream not found' });
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    })
})

module.exports = router;