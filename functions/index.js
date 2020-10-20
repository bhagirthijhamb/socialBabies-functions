const functions = require('firebase-functions');
const express = require('express');

const FBAuth = require('./util/fbAuth');

const { getAllBabbles, postOneBabble } = require('./handlers/babbles')
const { signup, login, uploadImage, addUserDetails } = require('./handlers/users')

const app = express();



// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
    //  response.send("Hello from Firebase!");
// });

// exports.getBabbles = functions.https.onRequest((req, res) => {
//     admin
//     .firestore()
//     .collection('babbles')
//     .get()
//     .then(data => {
//         let babbles = [];
//         data.forEach(doc => {
//             babbles.push(doc.data());
//         });
//         return res.json(babbles);
//     })
//     .catch(err => console.error(err));
// })

// exports.createBabble = functions.https.onRequest((req, res) => {
//     if(req.method !== 'POST'){
    //         return res.status(400).json({ error: 'This method is not allowed'})
    //     }
//     const newBabble = {
    //         body : req.body.body,
//         userHandle: req.body.userHandle,
//         createdAt: admin.firestore.Timestamp.fromDate(new Date())
//     };

//     admin
//         .firestore()
//         .collection('babbles')
//         .add(newBabble)
//         .then(doc => {
    //             return res.json({message: `document ${doc.id} created successfully. Yuhoo...`})
    //         })
    //         .catch(err => {
        //             res.status(500).json({error: `Oops... Something went wrong.`});
//             console.error(err);
//         })
// })


// Babble Routes
app.get('/babbles', getAllBabbles);
app.post('/babble', FBAuth, postOneBabble);

// Users Route
app.post('/signup', signup);
app.post(`/login`, login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);

// exports.api = functions.region('us-central1).https.onRequest(app);
exports.api = functions.https.onRequest(app);





