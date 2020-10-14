const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');

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
admin.initializeApp();
const app = express();

exports.api = functions.https.onRequest(app);
const db = admin.firestore();

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

const isEmpty = string => {
    if(string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    // const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // return re.test(String(email).toLowerCase());

    if(email.match(regEx)) return true;
    else return false;
}

// Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    let errors = {};

    // validate email
    if(isEmpty(newUser.email)){
        errors.email = 'Email must not be empty'
    } else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }

    // validate password
    if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    // To-do validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'This handle is already taken'})
            } else {
                return firebase
                  .auth()
                  .createUserWithEmailAndPassword(
                    newUser.email,
                    newUser.password
                  );
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken()
        })
        .then(idToken => {
            token = idToken;
            // return res.status(201).json({ token });
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                // userId: userId
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);    
            if(err.code === "auth/email-already-in-use"){
                return res.status(400).json({ email: "Email already in use"});
            } else {
                return res.status(500).json({ error: err.code });
            }
        })

    // firebase
    //     .auth()
    //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data => {
    //         return res.status(201)
    //                 .json({message: `user ${data.user.uid} signed up successfully`});
    //     })
    //     .catch(err => {
    //         console.error(err);
    //         return res.status(500).json({error: err.code});
    //     });
});
