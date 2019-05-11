require('dotenv').config();
const extract = require('extract-zip')
const path = require('path');
const fs = require('fs');
const csv=require('csvtojson')
const numberPattern = /\d+/g;
async function start(){
 await extract(process.env.DIR, {dir: __dirname+'/data/'}, function (err) { })
 const directoryPath = path.join(__dirname, 'data');
 var fullJSON=[]
 await fs.readdir(directoryPath, function (err, files) {
     if (err) {
         return console.log('Unable to scan directory: ' + err);
     }                    
     files.forEach(function (file) { 
      csv({
        delimiter:'||',
        colParser:{
          'date':function(item, head, resultRow, row , colIdx){
            try{var date=new Date(item).toISOString().substring(0, 10);}catch(err){}
            return date;
          },
          'name':function(item, head, resultRow, row , colIdx){
            return resultRow.last_name+' '+resultRow.first_name;
          },
          'phone':function(item, head, resultRow, row , colIdx){
            return item.match( numberPattern ).join([]) ;
            
          },
          'cc':function(item, head, resultRow, row , colIdx){
            return item.substring(3, item.length)
          },
      },
      ignoreColumns:/(user|email)/,
      })
      .fromFile('./data/'+file)
      .then((jsonObj)=>{
          for (var i=0; i<jsonObj.length; i++){
            jsonObj[i]={
              "name": jsonObj[i].name,
              "phone": jsonObj[i].phone,
              "person": {
                "firstName": jsonObj[i].first_name,
                "lastName":jsonObj[i].last_name
              },
              "amount": jsonObj[i].amount,
              "date": jsonObj[i].date,
              "costCenterNum": jsonObj[i].cc
            }
          }
        fullJSON.push(jsonObj)
        fs.writeFile('./data/myjsonfile.json',fullJSON, function(err){
          console.log(err)
        } )
      })
     });
 })

}

start()