import express from 'express';
import { database } from '../config.js';

import { getDatabase, ref, child, get, push, update, set } from "firebase/database";

const router = express.Router();

router.get("/", async(req, res) => {
    // res.send("Server is running");
    


    // set(ref(database, 'users/1' ), {
    //     altitude: '69',
    //     id: '69',
    //     locaton_lat: 'lat1',
    //     location_long: 'long1'
    //   });

    // const newPostKey = push(child(dbRef, 'posts')).key;
   
});

router.get("/test", (req, res) => {
  res.send({"status": "200"})
})

router.post("/test", (req, res) => {
  console.log(req.body.name);
  res.send({"status": "posted"})
})

router.post('/', function(req, res) {    

    // console.log(JSON.stringify()); 
    var alt = req.body.dist_cm;
    const dbRef = ref(database);
    var data = null;
    get(child(dbRef, `users`)).then((snapshot) => {
      if (snapshot.exists()) {
        data = snapshot.val()['1']
        
        const updates = {};
        data['altitude'] = alt;
        updates['/users/1'] = data;
    
        update(dbRef, updates).then(() => {
            console.log(`Updated altitude to ${alt} cm`)
        });
        // console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

}) 


export default router;

