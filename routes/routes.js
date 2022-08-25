import express from 'express';
import { database } from '../config.js';

import { getDatabase, ref, child, get, push, update, set } from "firebase/database";

const router = express.Router();


const dbRef = ref(database);

router.get("/", async(req, res) => {
    res.send("Server is running"); 
});

router.get("/home", (req, res) => {

    let sos_data = null;
    let dam_data = null;
    var sos_op = []
    var dam_op = [];
    var obj = {}
    get(child(dbRef, `requests`)).then((snapshot) => {
      if (snapshot.exists()) {
        sos_data = (snapshot.val());
       

        //convert to array of objects for better handling in front end
        for (const [key, value] of Object.entries(sos_data)) {
          obj = {}
          obj[key] = value
          sos_op.push(obj)
        }
        get(child(dbRef, `dams`)).then((snapshot) => {
          if (snapshot.exists()) {
            dam_data = (snapshot.val());
          
            for (const [key, value] of Object.entries(dam_data)) {
              obj = {}
              obj[key] = value
              dam_op.push(obj)
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

  get(child(dbRef, `requests/${key}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = (snapshot.val());
      data['status'] = action;

      const updates = {};
      updates[`requests/${key}`] = data;
  
      update(dbRef, updates).then(() => {
        res.send({200: "ok"})
      });
    }
  })

});



router.post("/damAlert_action", (req, res) => {
  var key = req.body.key;
  var status = req.body.status;
  var name = req.body.name;
  var date = req.body.date;
  var time = req.body.time;
  var population = req.body.population;

  get(child(dbRef, `dams/${key}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = (snapshot.val());
      data['status'] = status;

      const updates = {};
      updates[`dams/${key}`] = data;
  
      update(dbRef, updates).then(() => {
        const postData = {
          name: name,
          date: date,
          time: time,
          population: population
        };
      
  
        const newPostKey = push(child(dbRef, 'DamAlertHistory')).key;
  
        const updates2 = {};
      
        updates2['/DamAlertHistory/' + newPostKey] = postData;
        update(dbRef, updates2).then(() => {
          res.status(200).send('ok')
          
        }).catch(err => {
          res.status(400).send('Error: Unable to add to history')
        });
        
      }).catch(err => {
        res.status(400).send("Error: Unable to change status");
      });
    }
  });
})


// router.get("/getAH", (req, res) => {
//   const dbRef = ref(database);
//   get(child(dbRef, 'DamAlertHistory')).then((snapshot) => {
//     if(snapshot.exists())
//   })
// });


router.post("/getUsersNearDams", (req, res) => {
  var name = req.body.name;
  var cord = req.body.cord;

 
  get(child(dbRef, 'users')).then((snapshot) => {
    if(snapshot.exists()) {
      var data = snapshot.val();

     

      for (const [key,value] of Object.entries(data)) {
        if (value.dam === name){
          //update here
          const updates2 = {};
    

          const postData = {
            id: key,
            lat: cord.lat ,
            lng: cord.lng,
          }
      
          updates2['/resNotf/' + key] = postData;
          update(dbRef, updates2).then(() => {
            res.status(200).send('ok')
            console.log('Updated')
            
          }).catch(err => {
            res.status(400).send('Error: Unable to update')
          });

          break;
        }
      }

      res.status(200).send({
        users: data
      })
    }else{
      res.status(400).send("ERR: Unable to retrieve user data")
    }
  }).catch(err => {
    res.status(400).send('ERR: Get error in firebase');
  })
})


router.post("/risky", (req, res) => {
  var cord = req.body.cord;

})


router.post("/test", (req, res) => {
  console.log(req.body.name);
  res.send({"status": "posted"})
})

router.post('/', function(req, res) {    

    // console.log(JSON.stringify()); 
    var alt = req.body.dist_cm;
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

});



//testing routes
router.post("/sample", (req, res) => {
  console.log('yes')
  res.send({200: "0k-posted"})
})


router.get("/sample", (req, res) => {
  console.log('yes')
  var name = "test";
  var date = "12-08-2001";
  var time = "16:31";
  var population = 900000;


    const postData = {
    name: name,
    date: date,
    time: time,
    population: population
  };


  const newPostKey = push(child(dbRef, 'DamAlertHistory')).key;
  console.log(newPostKey);

  const updates = {};

  updates['/DamAlertHistory/' + newPostKey] = postData;
  update(dbRef, updates).then(() => {
    console.log('updated');
  }).catch(err => {
    console.log('error occured');
  });

  // res.send({200: "0k-got"})
})


export default router;

