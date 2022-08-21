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

router.get("/home", (req, res) => {
    const dbRef = ref(database);
    let sos_data = null;
    let dam_data = null;
    var sos_op = []
    var dam_op = [];
    get(child(dbRef, `requests`)).then((snapshot) => {
      if (snapshot.exists()) {
        sos_data = (snapshot.val());
       

        //convert to array of objects for better handling in front end
        for (const [key, value] of Object.entries(sos_data)) {
          var obj = {}
          obj[key] = value
          sos_op.push(obj)
        }
        get(child(dbRef, `dams`)).then((snapshot) => {
          if (snapshot.exists()) {
            dam_data = (snapshot.val());
          
            for (const [key, value] of Object.entries(dam_data)) {
              var obj = {}
              obj[key] = value
              console.log(obj);
              dam_op.push(obj);
            }
    
            res.send({
              sos: sos_op,
              dam: dam_op
            })
          }
        });
      }
    });
        
})

router.post("/sos_action", (req, res) => {
  var key = req.body.key;
  var action = req.body.action
  const dbRef = ref(database);
  get(child(dbRef, `requests/${key}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = (snapshot.val());
      data['status'] = action;

      const updates = {};
      updates[`requests/${key}`] = data;
  
      update(dbRef, updates).then(() => {
        null
      });
    }
  })

})
router.post("/damAlert_action", (req, res) => {
  var key = req.body.key;
  var status = req.body.status
  const dbRef = ref(database);
  get(child(dbRef, `dams/${key}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = (snapshot.val());
      data['status'] = status;

      const updates = {};
      updates[`dams/${key}`] = data;
  
      update(dbRef, updates).then(() => {
        res.send('done updated the dams')
      });
    }
  })

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

