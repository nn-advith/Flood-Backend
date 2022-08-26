import express from 'express';
import { database } from '../config.js';

import { getDatabase, ref, child, get, push, update, set } from "firebase/database";

const router = express.Router();


const dbRef = ref(database);






function get_locations(centre, radius){
  var x = centre.lat - (0.008*radius/1000)
  var y = centre.lng - (0.008*radius/1000)

  var limitx = centre.lat + (0.008*radius/1000)
  var limity = centre.lng + (0.008*radius/1000)

  var cord = []

  for (let i = x; i< limitx; i = i+0.060 ){
      for(let j = y; j< limity; j = j+0.060){
          var loc1 = {
              position:{
                  lat: centre.lat,
                  lng: centre.lng
              }
          }
          var dist = haversine_distance(loc1, {position: {lat: i, lng: j}});
          if( dist < radius/1000 && dist > radius/1000-(radius/1000)*0.5 ){
          
              cord.push({
              lat: i,
              lng: j
          })
          } 
      }
  }

  return cord
}




function haversine_distance(mk1, mk2) {
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = mk1.position.lat * (Math.PI/180); // Convert degrees to radians
  var rlat2 = mk2.position.lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (mk2.position.lng-mk1.position.lng) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d*1.6;
}




 
const provider = (arr,  cEval) =>
{
  var randomdepth = []

    arr.forEach(i => {
        let somerandom = Math.random();

        somerandom < 0.5 ? 
        randomdepth.push(cEval + Math.floor(Math.random() * (cEval/10))):
        randomdepth.push(cEval - Math.floor(Math.random() * (cEval/10)));
        // setRandomdepth(arr)
        
    })

    return randomdepth

}



function arrayMin(arr) {
  var min = arr[0]
  for(let i = 0; i<arr.length; i++){
      if (arr[i] < min){
          min = arr[i]
      }
  }

  return min
}



const getRisky = (eleList, possible) => {
  var cord = null;
  var maxCord = null;
  possible = [...possible, new Set()]
  cord = possible[eleList.indexOf(arrayMin(eleList))]
  maxCord = cord
  
  return maxCord
}










// ---------------------------------------------------------------------------


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
        
});



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


router.get("/getAH", (req, res) => {
  const dbRef = ref(database);
  var ah_op = []
  var obj={}
  get(child(dbRef, 'DamAlertHistory')).then((snapshot) => {
    if(snapshot.exists()){
      var data = (snapshot.val())
      for (const [key, value] of Object.entries(data)) {
        obj = {}
        obj[key] = value
        ah_op.push(obj)
      }
    }
    res.send({
        history: ah_op
      })
  })
});


router.post("/getUsersNearDams", (req, res) => {
  var lat = req.body.lat;
  var lng = req.body.lng;
  var radius = req.body.radius;
  var elevation = req.body.elevation;
  var name = req.body.name;

  // console.log(lat, radius, name)

  var locations = get_locations({lat: lat, lng: lng}, radius);
  var randomdepth = provider(locations, elevation)
  var cord = getRisky(randomdepth, locations)

  var radii = []
  locations.forEach((i) => {
    radii.push(1/( haversine_distance({position: i }, {position: {lat: lat, lng: lng}})*1000/ radius + Math.abs(randomdepth[locations.indexOf(i)]-elevation)/radius)*10000/4)})
  
  get(child(dbRef, 'users')).then((snapshot) => {
    if(snapshot.exists()) {
      var data = (snapshot.val());
      var key = null;
      Object.values(data).forEach((i) => {
        if(i.dam === name){
          key = Object.keys(data)[Object.values(data).indexOf(i)];
          
        }
        
        const postData = {
          id: key,
          lat: cord.lat ,
          lng: cord.lng,
        }
        var updates = {};

        updates[`/resNotf/${key}`] = postData;
        update(dbRef, updates).then(() => {
          // res.send({
          //   locations: locations
          // })
        })

      })
      
    }
    res.send({
      locations: locations,
      radii: radii
      
    })
  }).catch(err => {
    // res.send('ERR: Get error in firebase');
    console.log(err)
  })
});




router.post("/risky", (req, res) => {
  var cord = req.body.cord;

})


// router.post('/levelforecast' (req, res) => {
//   //params
// })

// router.post('/inflowforecast' (req, res) => {
//   //params
// })

// router.post('/rainforecast' (req, res) => {
//   //params
// })


router.post("/getLevel", (req, res) => {
  var dam = req.body.dam;
  var clevel = null;
  var cwc = null;
  var imd = null;
  var maxT = null;
  var deltaY = 0;
  var key = null;
  var damdata = null;
  get(child(dbRef, 'dams')).then((snapshot) => {
    if(snapshot.exists()){
      var data = (snapshot.val());
      Object.values(data).forEach(i => {
        if(i.name === dam){
          damdata = i
          key = Object.keys(data)[Object.values(data).indexOf(i)]
          clevel = i.current;
          cwc = i.cwc;
          imd = i.imd;
          maxT = i.max_threshold;
  
          var volume = cwc*0.02831687*8640  //multiply by volume in m^3 times number of seconds
          //average area of sardar sarovar
          var inflow = volume/(214*1.77*1000000);
          //assume unflwo factor 1

          deltaY = inflow+imd/1000

          clevel = clevel+deltaY


        }
      })
    }

    var updates = {}

    damdata['current'] = clevel

    updates[`/dams/${key}`] = damdata
    update(dbRef, updates).then(() => {
      
    })

    res.send({
      clevel: clevel,
      maxT: maxT,
      perc: (clevel/maxT)*100
    })
  })
})



//level = clevel + x*inflow+y*rainfall
//if level > threshold:
//  show alert
//else:
// yay!

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
  console.log(req.body)
  res.send({200: "0k-posted"})
})


router.get("/sample", (req, res) => {

  res.send({200: "0k-got"})
})


export default router;

