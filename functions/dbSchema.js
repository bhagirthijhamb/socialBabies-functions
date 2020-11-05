let db = {
    babbles: [
        {
            userHandle: 'baby1',
            body: 'this is the babble body',
            createdAt: '2020-04-21T23:14:29.112Z',
            likeCount: 5,
            commentCount: 2
        },
        {
            userHandle: 'baby2',
            body: 'this is again babble body',
            createdAt: '2020-04-21T23:14:29.112Z',
            likeCount: 2,
            commentCount: 3
        }
    ],

    users: [
       {
            userId:  'Sm7LZQoFhyQPa9uaFOzdfc9py9w1',
            email: 'baby1email.com',
            handle: 'baby1',
            createdAt: '2020-10-19T13:39:07.900Z',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/socialbabies.appspot.com/o/no-img.png?alt=media',
            bio: 'Hello, my name is baby1, nice to meet you.',
            website: 'https://baby1.com',
            location: 'Toronto, Ontario'
       }
    ]
}

const useDetails = {
    // Redux data
    credentials: {
        userId: 'Mfkdl46jksdfjlkgsk4glskdgl4',
        email: 'baby12email.com',
        handle: 'user',
        createdAt: '2020-10-19T15:02:13.709Z',
        imageUrl: 'image/hdjsdkfjsdkjfslkfjslkfjdskfkd',
        bio: 'Hello, my name is baby1, nice to meet you',
        website: 'https://user.com',
        location: 'Toronto, ON'
    },
    likes: [
        {
            useHandle: 'baby2',
            screamId: 'gdfgfgs84u4oij348guij4'
        },
        {
            useHandle: 'baby7',
            screamId: 'gdfgfgs84u4oij348guij4'
        }
    ]
}