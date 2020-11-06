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
    useImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  admin
    .firestore()
    .collection("babbles")
    .add(newBabble)
    .then((doc) => {
      const resBabble = newBabble;
      resBabble.babbleId = doc.id;
      // return res.json({ message: `document ${doc.id} created successfully.` });
      return res.json(resBabble);
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

router.get('/:babbleId/like', FBAuth, (req, res) => {
  const babbleDocument = db.doc(`/babbles/${req.params.babbleId}`);
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle).where('babbleId', '==', req.params.babbleId).limit(1);
  let babbleData;
  babbleDocument.get()
    .then(doc => {
      if(doc.exists){
        babbleData = doc.data();
        babbleData.babbleId = doc.id;
        return likeDocument.get();
      }
      else{
        return res.status(404).json({ error: 'Babble not found.'});
      }
    })
    .then(data => {
      if(data.empty){
        return db.collection('likes').add({
          babbleId: req.params.babbleId,
          userHandle: req.user.handle
        })
        .then(() => {
          babbleData.likeCount++;
          return babbleDocument.update({ likeCount: babbleData.likeCount})
        })
        .then(() => {
          return res.json(babbleData);
        })
      }
      else {
        return res.status(400).json({ error: 'Babble already liked.' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    })
})

router.get('/:babbleId/unlike', FBAuth, (req, res) => {
  const babbleDocument = db.doc(`/babbles/${req.params.babbleId}`);
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.userHandle).where('babbleId', '==', req.params.babbleId).limit(1);
  let babbleData;
  babbleDocument.get()
    .then(doc => {
      if(doc.exists){
        babbleData = doc.data();
        babbleData.babbleId = doc.id;
        return likeDocument.get();
      }
      else{
        return res.status(404).json({ error: 'Babble not found.'});
      }
    })
    .then(data => {
      if(data.empty){
        return res.status(400).json({ error: 'Babble not liked.' });
      }
      else {
        return db.doc(`/likes/${data.docs[0].data().id}`).delete()
          .then(() => {
            babbleData.likeCount--;
            return babbleDocument.update({ likeCount: babbleData.likeCount });
          })
          .then(() => {
            return res.json(babbleData);
          })
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    })
})

module.exports = router;