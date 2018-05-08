// Incorporate package node js
let mysql = require('mysql');
let cTable = require('console.table');
let colors = require('colors');
let inquirer = require('inquirer');

//Authentication and Connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your user
    user     : "root",
  
    // Your Password
    password : '***********',
    database:"bamazon_db"
  });

// Creating conection
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    displayItem();
  });


//==================================================== Function===================================================

//function Used to display item-id, product-name and price of the availabale product in a table format
function displayItem(){
    connection.query("SELECT item_id, product_name, price FROM products",function(err, display) {
          
        // throws error
        if (err) throw err;
       
        // Create a Table 
        const table = cTable.getTable(display);

        // console logging the table created
        console.log("\nHere are the items available for sale\n".bold.blue)
        console.log(table);
        selectProduct()
      });//End of read connection query
  }//End of diplayitem() function


// Function used to update the inventory and diplay total cost of purchase
function updateProducts(productUnits,productId,updatedStock_quantity,productPrice,totalProfit){

    // Calculate the total amount
    let totalCost = productUnits * productPrice
    // console.log(totalCost);
    // console.log(totalProfit);
    let query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity:updatedStock_quantity,
                product_sales: (totalProfit)+totalCost

            },
            {
                item_id:productId
            }
        ],
        function (err,update){
            // console.log(update.affectedRows + " products updated!\n");

            // logs out the total cost
            console.log(`\n The total cost for ${productUnits} items is ${totalCost} dollars`)
            continueCustomer();
        }
    );//End of updateProducts() function

    // logs the actual query being run
    console.log(query.sql)
  }//End of update function

  // function that selects product the user selected 
  // and calls the update function by passing the price stock quantity, price and unit as an argument 
  function selectProduct(){
      inquirer.prompt([
          {
              name:"id",
              message:"Please input the ID of the product you would like to buy"
          },
          {
            name:"units",
            message:"How many units of the product you would like to buy"
          }

      ]).then(function(product){
        //   console.log(product.id,product.quantity)
          let query = "SELECT stock_quantity,price,product_sales FROM products WHERE ?"
          connection.query(query,{item_id:product.id}, function(err, quantity) {
            //   console.log(quantity)
              // used to store the available product
              let productAvailable = quantity[0].stock_quantity;
              let updatedStock_quantity = productAvailable - parseInt(product.units);

              // check if there is enough inventory
              if (productAvailable > parseInt(product.units)){
                //   console.log("\n" + product.units)
                  //call updateProduct Function

                  updateProducts(parseInt(product.units),product.id,updatedStock_quantity,quantity[0].price,quantity[0].product_sales);
              }else{
                  
                  console.log(`\nInsufficient quantity! We got ${productAvailable} products available\n`);
                  
              }//End of else condition
          })//End of query connection
      })//End of product inquirer promise
  }//End of choseProduct() function

  // Function that let customers an option to continue
  function continueCustomer(){
    inquirer.prompt([
        {
            name:"confirm",
            type:"confirm",
            message:"Would you like to buy other product?"
        }
    ]).then(function(chooseOther){
        if (chooseOther.confirm){
          selectProduct();
        }else{
          console.log('Thank you for Using bAmazon!')
        }
    })//End of chooseOther inquirer promise
  }