var express = require('express');
var router = express.Router();
const fs = require('fs')
const path = require('path')

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/gachaOnce', function(req, res, next) {
  res.send(JSON.stringify(gachaOnce()));
});

router.get('/getUserdata', function(req, res, next) {
  res.send(JSON.stringify(getUserData()));
});

router.get('/getConfig', function(req, res, next) {
  res.send(JSON.stringify(getConfig()));
});

router.post('/addGold', function (req, res, next) {
  addGold(req.body.gold)
  res.send("success")
})

router.post('/setConfig', function (req, res, next) {
  setConfig(req.body.config)
  res.send('success')
})

function randomNum(minNum, maxNum){9
  switch(arguments.length){
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}

function gachaOnce(){
  //每次都要读取一遍，因为配置可能改变
  delete require.cache[require.resolve('../public/config/config.json')]
  let config = require('../public/config/config.json')
  delete require.cache[require.resolve('../public/config/userdata.json')]
  let userdata = require('../public/config/userdata.json')
  let probabilityList = [];
  let sum = 0;
  config.giftList.forEach(function (gift, index) {
    probabilityList.push(gift.probability)
    sum += gift.probability
  })
  let rand = randomNum(0, sum - 1)
  let result = {success: true, gift: 0, msg: ""}
  if (userdata.users[0].gold < config.gold){
    result.success = false
    result.msg = "No enough gold."
    return result
  }
  let userdataFile = path.resolve(__dirname, '../public/config/userdata.json')
  userdata.users[0].gold -= config.gold
  fs.writeFile(userdataFile, JSON.stringify(userdata), () => {})
  while(rand > probabilityList[result.gift]){
    rand -= probabilityList[result.gift]
    result.gift += 1
  }
  console.log("Got: " + JSON.stringify(result))
  return result
}

function getUserData(){
  delete require.cache[require.resolve('../public/config/userdata.json')]
  let userdata = require('../public/config/userdata.json')
  return userdata
}

function getConfig(){
  delete require.cache[require.resolve('../public/config/config.json')]
  let config = require('../public/config/config.json')
  return config
}

function addGold(count){
  delete require.cache[require.resolve('../public/config/userdata.json')]
  let userdata = require('../public/config/userdata.json')
  let userdataFile = path.resolve(__dirname, '../public/config/userdata.json')
  userdata.users[0].gold += count
  fs.writeFile(userdataFile, JSON.stringify(userdata), () => {})
  console.log('add' + count)
}

function setConfig(config){
  let configFile = path.resolve(__dirname, '../public/config/config.json')
  fs.writeFile(configFile, JSON.stringify(config), () => {})
}

module.exports = router;
