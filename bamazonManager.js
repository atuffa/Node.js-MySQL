// Incorporate package node js
let inquirer = require("inquirer");
let mysql = require('mysql');
let cTable = require('console.table');
let colors = require('colors');
let fs = require('fs');

//Authentication and Connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your user
    user     : "root",
  
    // Your Password
    password : 'Koji@191991',
    database:"bamazon_db"
  });

  // Creating conection
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    runManager();
  });

//===========================================Function============================================

//create inquirer
function runManager(){
    inquirer.prompt([
        {
            name: "action",
            type:"rawlist",
            message: "What do you like to do?",
            choices:[
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        }
    ]).then(function(answer){

        console.log(answer.action);
    
        switch(answer.action){
            case "View Products for Sale":
                viewProduct();
                break;
    
            case "View Low Inventory":
                viewLowInventory();
                break;    
    
            case "Add to Inventory":
                addInventory();
                break;
    
            case "Add New Product":
                addNewProduct();
                break;
        }//End of switch
    })//End of option Inquirer
}//End of runManager() function

// list every available item: the item IDs, names, prices, and quantities.
function viewProduct(){

    let query = "SELECT item_id,product_name,price,stock_quantity FROM products"

    connection.query(query,function(err,stock){
        // console.log(stock);

        // Create a Table 
        const table = cTable.getTable(stock);

        // console logging the table created
        console.log("\nHere are the all the items\n".bold.blue)
        console.log(table);
        continueWithBamazon()
    }); 
}//End of viewProduct function

// list all items with an inventory count lower than five
function viewLowInventory(){

    let query = "SELECT item_id,product_name,stock_quantity FROM products"
    let lowInventoryList = []
    connection.query(query,function(err,lowInverntory){
        // console.log(lowInverntory);
        lowInverntory.map(elem => {
            if (elem.stock_quantity < 6){
                lowInventoryList.push(elem)
            }
    });

    console.log(lowInventoryList)
    // Create a Table 
    const table = cTable.getTable(lowInventoryList);

    // console logging the table created
    console.log("\nHere are the items with lowInventory\n".bold.red)
    console.log(table);
    continueWithBamazon()
    })
}

//used to add inventory for stocks that have less than 5 items available
function addInventory(){

    inquirer.prompt([
        {
            name:"addInventory",
            type:"input",
            message:"Please input the item id which you like to add an invetory for?"
        }
    ]).then(function(item){
        // console.log(item.addInventory)

        let itemNumber = item.addInventory;

        let query = "SELECT stock_quantity,product_name FROM products WHERE ?"
        connection.query(query,
            {
                item_id:itemNumber
            },
            function(err,availableStock){
                let stockAvailable = availableStock[0].stock_quantity
                let productName = availableStock[0].product_name;
            
                //Prompt for amount of inventory to add
                inquirer.prompt([
                    {
                        name:"inventoryAmount",
                        type:"input",
                        message:`How many ${productName} would you like to add ?`
                    }
                ]).then(function(inventoryToAdd){

                    // Manger Inventory Input 
                    let amountOfinventoryToAdd = parseInt(inventoryToAdd.inventoryAmount);

                    //Sum of available stock and added Input
                    let inventoryUpdated = stockAvailable + amountOfinventoryToAdd;
                    
                    // console.log(inventoryUpdated);
                    // console.log(itemNumber);

                    let query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity:inventoryUpdated
                            },
                            {
                                item_id:itemNumber
                            }
                        ],
                        function (err,update){
                            // console.log(update);
                            console.log(update.affectedRows + " products updated!\n");
                        }
                    );
                    console.log(query.sql)
                    continueWithBamazon()
                });
            }
        );
    });
}

// Adding new product
function addNewProduct(){

    // query for select all departmet for choices 
    // (inorder to control addition of departments)
    let query = "SELECT department_name FROM departments"
    connection.query(query,function(err,dep){
        
        // An Array to store different departments from department table 
        let depArray =[];
        dep.map(elem => {

           // push every elemnt of the array into depArray array.
            depArray.push(elem.department_name)
        })
        
        // Inquiry for adding new product
        inquirer.prompt([
            {
                name:"id",
                type:"input",
                message:"What's the id Number?"
            },
            {
                name:"productName",
                type:"input",
                message:"What's the product name?"
            },
            {
                name:"department",
                type:"rawlist",
                message:"What's the department the product belongs to?",
                choices:depArray
            },
            {
                name:"price",
                type:"input",
                message:"What's the price of the product?"
            },
            {
                name:"stockAmount",
                type:"input",
                message:"How many Stock is available"
            }
        ]).then(function(insert){

           let id = insert.id.trim()
           let name = insert.productName.trim()
           let dep = insert.department.trim()
           let price = insert.price.trim()
           let stock = insert.stockAmount.trim()
           
            
            // Append input to the department.csv
            fs.appendFile("data.csv", `\n${id},${name},${dep},${price},${stock},0`, function(err){
                if(err) throw err;
                console.log("Appended Succesfully!")
            })
            
            // Update the product table
            let query = connection.query(
                "INSERT INTO products SET ?", 
                [{
                    item_id:id,
                    product_name:name,
                    department_name:dep,
                    price:price,
                    stock_quantity:stock,
                    product_sales:0
                }],
                function(err,addNewProduct){
                    console.log(addNewProduct.affectedRows + " product inserted!\n");
                }
            );
            // console.log(query.sql)

            // Update the department table if the department doesn't exist    
            // call the function viewProduct
            viewProduct();
        });
    })
};

// Continue with the rest of the Menu
function continueWithBamazon(){
    inquirer.prompt([
        {
            name:"confirm",
            type:"confirm",
            message:"Would You like to continue?"
        }
    ]).then(function(response){
        if (response.confirm){
            runManager();
        }else{
            console.log("You are signed out of BamazonManager")
            
        }
    });
}

