// Incorporate package node js
let inquirer = require("inquirer");
let mysql = require('mysql');
let cTable = require('console.table');
let colors = require('colors');
let fs = require('fs')

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
    runSupervisor();
  });

 // ==========================================Function==========================================

 function runSupervisor(){

    inquirer.prompt([
        {
            name:"action",
            type:"rawlist",
            message: "What do you like to do?",
            choices:["View Product Sales by Department","Create New Department"]
        }
    ]).then(function(answer){
        console.log(answer.action)
        // switch 

        switch(answer.action){
            case "View Product Sales by Department":
            viewProduct();
            break;

            case "Create New Department":
            createDepartment();
            break;
        };
       
    });
 };
 
//  total_profit
 // View Product by department
 function viewProduct(){

     let query = "SELECT departments.department_id,departments.department_name,departments.over_head_costs,SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM products LEFT JOIN departments ON departments.department_name = products.department_name GROUP BY departments.department_name"
     connection.query(query, function(err, profit){
         if(err) throw err;
        // console.log(profit)

        // Create a Table 
        const table = cTable.getTable(profit);

        // console logging the table created
        console.log("\nSupervisor Net Profit Sheet\n".bold.blue)
        console.log(table);
        continueWithBamazon()
     })
 }


 // Creating New Department
 function createDepartment(){

    inquirer.prompt([
        {
            name:"id",
            type:"input",
            message:"what is the department id?"
        },
        {
            name:"name",
            type:"input",
            message:"what is the new department name?"
        },
        {
            name:"ohCost",
            type:"input",
            message:"what is the over head cost for the department?"
        }
    ]).then(function(insert){

        // used to trim the  values to be appended
        let id = insert.id.trim();
        let name = insert.name.trim()
        let ohCost =insert.ohCost.trim()

        // Append input to the department.csv
        fs.appendFile("department.csv", `\n${id},${name},${ohCost}`, function(err){
            if(err) throw err;
            console.log("Appended Succesfully!")
        })
        
        // Update the product table
            let query = connection.query(
                "INSERT INTO departments SET ?", 
                [{
                    department_id:id,
                    department_name:name,
                    over_head_costs:ohCost
                }],
                function(err,addNewProduct){
                    // console.log(addNewProduct)
                    console.log(addNewProduct.affectedRows + " product inserted!\n");
                    continueWithBamazon()
                }
            );
            console.log(query.sql)
    })
 }

 // Continue Prompt
 function continueWithBamazon(){
    inquirer.prompt([
        {
            name:"confirm",
            type:"confirm",
            message:"Would You like to continue?"
        }
    ]).then(function(response){
        if (response.confirm){
            runSupervisor();
        }else{
            console.log("You are signed out of BamazonSupervisor")
            
        }
    });
}