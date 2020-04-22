const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

admin.initializeApp();
const app = express();

const config = {
    apiKey: "AIzaSyA52n7t4kupgX240-9_1qepWrtyUf7ofB8",
    authDomain: "socialbabies.firebaseapp.com",
    databaseURL: "https://socialbabies.firebaseio.com",
    projectId: "socialbabies",
    storageBucket: "socialbabies.appspot.com",
    messagingSenderId: "1050529246750",
    appId: "1:1050529246750:web:2c65cd2386cf6f74e9c80f"
};
firebase.initializeApp(config);


exports.api = functions.https.onRequest(app);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

app.get('/babbles', (req, res) => {
    admin
        .firestore()
        .collection('babbles')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let babbles = [];
            data.forEach((doc) => {
                babbles.push({
                    babbleId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(babbles);
        })
        .catch(err => console.log(err));
});

app.post('/babble', (req, res) => {
    const newBabble = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
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

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    console.log(newUser);

    // To-do validate data

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return res.status(201)
                    .json({message: `user ${data.user.uid} signed up successfully`});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        });
});
