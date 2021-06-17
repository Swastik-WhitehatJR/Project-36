var dog, sadDog, happyDog, database;
var foodS, foodStock;
var addFood;
var foodObj;
var fedTime, lastFed;
var canvas;
var MoneyREF;
var p;



function preload() {
  sadDog = loadAnimation("IMAGES/Dog.png");
  happyDog = loadAnimation("IMAGES/happy dog.png");
}

function setup() {
  database = firebase.database();
  canvas = createCanvas(1000, 400);

  background(46, 139, 87);

  foodObj = new Food();

  foodStock = database.ref('Project36/Number_of_Food/Food');
  foodStock.on("value", readStock);

  dog = createSprite(800, 200, 150, 150);
  dog.addAnimation("sadDog", sadDog);
  dog.addAnimation("happyDog", happyDog);
  dog.scale = 0.15;

  changeBG = createButton("Change Background Colour");
  changeBG.position(1050, 270);
  changeBG.mousePressed(change_background);
  changeBG.addClass("button")

  deductFood = createButton("Feed the Dog");
  deductFood.position(960, 270);
  deductFood.mousePressed(feedDog);
  deductFood.addClass("button")

  addFood = createButton("Add Food");
  addFood.position(890, 270);
  addFood.mousePressed(addFoods);
  addFood.addClass("button");

  getMoney = createButton("Get Money");
  getMoney.position(800, 270);
  getMoney.mousePressed(getMoneyFunc);
  getMoney.addClass("button")


  MoneyREF = database.ref('Project36/Money/Amount');
  MoneyREF.on("value", function (data) {
    money = data.val();

    p = createP("Money : $" + money);
    p.style('font-size', '20px');
    p.position(300, 280);
  });
}

function draw() {
  foodObj.display();

  var fedTime = database.ref('Project36/FeedTime/Time');
  fedTime.on("value", function (data) {
    lastFed = data.val();
  });

  fill(255, 255, 254);
  textSize(20);
  stroke("black")
  if (lastFed) {
    if (lastFed > 12){
      text("Last Feed : " + lastFed % 12 + " PM", 350, 50);
    }
    else if (lastFed == 0) {
      text("Last Feed : 12 AM", 350, 50);
    }
    else if (lastFed == 12) {
      text("Last Feed : 12 PM", 350, 50);
    }
    else {
      text("Last Feed : " + lastFed + " AM", 350, 50);
    }
  }

  drawSprites();
}

//function to read food Stock
function readStock(data) {
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}


function feedDog() {
  Swal.fire({
    title: 'Are you sure you want to feed your dog?',
    text: "You will lose one food.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      //dog.addImage(happyDog);
      dog.changeAnimation("happyDog", happyDog);

      foodObj.updateFoodStock(foodObj.getFoodStock() - 1);
      database.ref('Project36/Number_of_Food').update({
        Food: foodObj.getFoodStock(),
      })
      database.ref('Project36/FeedTime').update({
        Time: new Date().getHours(),
        Date: new Date().getDay + "/" + new Date().getMonth + "/" + new Date().getFullYear,
      })
      Swal.fire({
        icon: 'success',
        title: 'Dog had ate',
        text: 'Your dog has ate the food.',
      }).then((result) => {
        window.location.reload();
      })
    }
  })

}

//function to add food in stock
function addFoods() {
  Swal.fire({
    title: 'Are you sure you want to buy a food?',
    text: "You will lose $30 from your account.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed && money - 30 >= 0) {
      foodS++;
      money = money - 30;
      database.ref('Project36/Money').update({
        Amount: money
      })
      database.ref('Project36/Number_of_Food').update({
        Food: foodS
      })
      Swal.fire({
        icon: 'success',
        title: 'Food Added',
        text: 'A new Food was added for your dog. Money Left: $' + money,
      }).then((result) => {
        window.location.reload();
      })
    }

    else if (money - 30 <= 0) {
      Swal.fire({
        title: 'You cannot buy a food!',
        text: "You do not have enough money to buy the food. Try increasing the money clicking on the 'GET MONEY' button",
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK'
      })
    }
  })
}


function change_background() {

  // Pick a random number for r value
  r = Math.round(random(255));
  br = Math.round(random(255));

  // Pick a random number for g value
  g = Math.round(random(255));
  bg = Math.round(random(255));

  // Pick a random number for b value
  b = Math.round(random(255));
  bb = Math.round(random(255));

  var bcl = "rgb(" + r + ", " + g + ", " + b + ")"

  if (r !== br && g !== bg && b !== bb) {

    changeBG.background = bcl;
    //document.querySelectorAll('button').style.backgroundColor = bcl;
  }

  // Set a random background-color
  background(r, g, b);

  Swal.fire({
    icon: 'success',
    title: 'Colour Changed',
    text: "Colour Changed to RGB(" + r + ", " + g + ", " + b + ")",
  })
}

function getMoneyFunc() {

  if (money < 50) {

    var rand = Math.round(random(0, 50))

    if (rand !== 0) {

      money = money + rand;
      database.ref('Project36/Money').update({
        Amount: money
      })

      Swal.fire({
        icon: 'success',
        title: 'You got some money',
        text: "$" + rand + " was added to your account.",
      }).then((result) => {
        window.location.reload();
      })
    }
  }
  else {
    Swal.fire({
      icon: 'info',
      title: 'You have enough money',
      text: "You can use 'GET MONEY' only when you have less than $50",
    })
  }
}
