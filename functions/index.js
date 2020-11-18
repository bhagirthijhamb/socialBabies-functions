const functions = require('firebase-functions');
const express = require('express');
const userRouter = require('./routes/userRoutes');
const babbleRouter = require('./routes/babbleRoutes');
const { db } = require('./util/admin');


// const FBAuth = require('./util/fbAuth');

// const { getAllBabbles, postOneBabble } = require('./handlers/babbles')
// const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users')

const app = express();

app.use('/users', userRouter);
app.use('/babbles', babbleRouter);


// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// Firebase Could Functions
// There are several different types of cloud functions that can be created and they are trigerred in different ways
// database events, auth event, storage events, analytics events - Background Triggers because these these are events that occur in the background of your app.
// We can also call function directly via an https endpoint mush like an api end point or programmatic call directly from our code
// these are both known as http triggers. These ar e both used to direclty invoke a cloud function.

// In this tutorail we will se how to set up an http function which we can trigger via an end point directly in the browser.. Then we will see callable function from the code.

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
// app.get('/babbles', getAllBabbles);
// app.post('/babble', FBAuth, postOneBabble);


// Users Route
// app.post('/signup', signup);
// app.post(`/login`, login);
// app.post('/user/image', FBAuth, uploadImage);
// app.post('/user', FBAuth, addUserDetails);
// app.get('./user', FBAuth, getAuthenticatedUser)

// exports.api = functions.region('us-central1).https.onRequest(app);
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate(snapshot => {
        return db.doc(`/babbles/${snapshot.data().babbleId}`)
            .get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                    return db.doc(`/notifications/${snapshot.id}`)
                        .set({
                            babbleId: doc.id,
                            createdAt: new Date().toISOString(),
                            recipient: doc.data().userHandle,
                            sender: snapshot.data().userHandle,
                            type: 'like',
                            read: false,
                        })
                } else {
                    return res.status(400).json({ message: "babble doesn't exist" })
                }
            })
            // .then(() => {
            //     return;
            // })
            .catch(err => console.log(err))
    })

exports.deleteNotificationOnUnlike = functions.firestore.document('likes/{id}')
    .onDelete(snapshot => {
        return  db.doc(`/notifications/${snapshot.id}`)
            .delete()
            // .then(() => {
            //     return;
            // })
            .catch(err => {
                console.error(err);
                return;
            })
    })

exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
.onCreate(snapshot => {
    return db.doc(`/babbles/${snapshot.data().babbleId}`)
    .get()
    .then(doc => {
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                babbleId: doc.id,
                createdAt: new Date().toISOString(),
                sender: snapshot.data().userHandle,
                recipient: doc.data().userHandle,
                type: 'comment',
                read: false,
            })
        } else {
            return res.status(400).json({ message: "babble doesn't exist" })
        }
    })
    // .then(() => {
        //     return;
        // })
        .catch(err => {
            console.log(err);
            return;
        })
    })
    
// if the user updates his profile pics, this db trigger will change the user image of all the babbles by this user
exports.onImageChange = functions.firestore.document('/users/{id}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().imageUrl !== change.after.data().imageUrl){
            console.log('Image has changed')
            const batch = db.batch();
            return db.collection('babbles').where('userHandle', '==', change.before.data().handle).get()
                .then(data => {
                    data.forEach(doc => {
                        const babble = db.doc(`/babbles/${doc.id}`);
                        batch.update(babble, { userImage: change.after.data().imageUrl })
                    })
                    return batch.commit();
                })
        } else return true;
    })
    
    
// if a user deletes a babble, delete all the likes, comments and notification documents related to that babble.
exports.onBabbleDelete = functions.firestore.document('babbles/{babbleId}')
    .onDelete((snapshot, context) => {
        const babbleId = context.params.babbleId;
        const batch = db.batch();
        return db.collection('comments').where('babbleId', '==', babbleId).get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`))
                })
                return db.collection('likes').where('babbleId', '==', babbleId).get()
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`))
                })
                return db.collection('notifications').where('babbleId', '==', babbleId).get()
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`))
                })
                return batch.commit();
            })
            .catch(err => console.error(err));
            
    })
    
    
