const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getBabbles = functions.https.onRequest((req, res) => {
    admin
    .firestore()
    .collection('babbles')
    .get()
    .then(data => {
        let babbles = [];
        data.forEach((doc) => {
            babbles.push(doc.data());
        });
        return res.json(babbles);
    })
    .catch(err => console.log(err));
});

exports.createBabbles = functions.https.onRequest((req, res) => {
    const newBabble = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection('babbles')
        .add(newBabble)
        .then(doc => {
            return res.json({message: `document ${doc.id} created successfully.`});
        })
        .catch(err => {
            res.status(500).json({error: `Something went wrong`});
            console.log(err);
        });
});
