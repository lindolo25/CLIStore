var inquirer = require('inquirer');
var tablify = require('tablify').tablify;
var mySQL = require('./dbConnection.js');
require("./commonds");

var store = {
    products: null,
    dept: null,
    conn: null
}

var init = async function () 
{
    await inquirer.prompt([
        {
          type: "list",
          name: "main",
          message: "Please select an action.",
          choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }])
        .then(function(response) 
        {
            switch(response.main)
            {
                case "View Products for Sale":
                    printProducts();
                    break;
                case "View Low Inventory":
                    printLowStock();
                    break;
                case "Add to Inventory":
                    promptForInventory();
                    break;
                case "Add New Product":
                    getDepartments();
                    break;
                default:
                    break;
            }
        });
}

var printProducts = async function () 
{
    queryStr = "SELECT prod.product_id AS id, prod.product_name AS name, dept.department_name AS dept, prod.price AS price,\
        prod.department_id AS deptId, prod.product_sale AS saleTotal, prod.stock_quantity AS stock\
        FROM products AS prod INNER JOIN departments AS dept ON prod.department_id = dept.department_id \
        ORDER BY prod.product_name ASC";
    
    store.conn = mySQL();
    await store.conn.query(queryStr, function(err, res) 
    {
        if (err) throw err;
        store.products = res;
        var print = tablify(res, { keys: ['id', 'name', 'dept', 'price', "saleTotal", "stock"], show_index: false });
        console.log(print);
        store.conn.end();
        init();
    });
}

var printLowStock = async function () 
{
    queryStr = "SELECT prod.product_id AS id, prod.product_name AS name, dept.department_name AS dept, prod.price AS price,\
        prod.department_id AS deptId, prod.product_sale AS saleTotal, prod.stock_quantity AS stock\
        FROM products AS prod INNER JOIN departments AS dept ON prod.department_id = dept.department_id \
        WHERE prod.stock_quantity <= 5 \
        ORDER BY prod.product_name ASC";
    
    store.conn = mySQL();
    await store.conn.query(queryStr, function(err, res) 
    {
        if (err) throw err;
        else if (res.length > 0)
        {
            var print = tablify(res, { keys: ['id', 'name', 'dept', 'price', "saleTotal", "stock"], show_index: false });
            console.log(print);
        }
        else console.logWithBars("All products have sufficient stock.");
        
        store.conn.end();
        init();
    });
}

var promptForInventory = async function () 
{
    await inquirer.prompt([
        {
          type: "input",
          name: "productId",
          default: null,
          message: "Please type in a product ID:"
        },
        {
          type: "input",
          name: "quantity",
          default: 1,
          message: "Enter the quiantity for the selected product:",
        }])
        .then(function(response) 
        {
            var productId = parseInt(response.productId);
            var quantity = parseInt(response.quantity);

            if (productId && quantity)
            {
                findPruduct(productId, quantity);
            }
            else
            {
                console.logWithBars("This order run into a problem, please start again.");
                promptForInventory();
            }
        });
}

var findPruduct = async function(id, quantity)
{
    queryStr = "SELECT product_id AS id, product_name AS name, price AS price,\
        department_id AS deptId, product_sale AS saleTotal, stock_quantity AS stock\
        FROM products WHERE ?";
    store.conn = mySQL();
    await store.conn.query(queryStr, [{ product_id: id }], function(err, res) 
    {
        store.conn.end();
        if (err) throw err;
        else if (res.length > 0)
        {
            updateInventory(res[0], quantity);
        }
        else cancelOperation("This product does not exist, the operation cannot be completed.");
    });
}

var updateInventory = async function (selected, quantity) 
{
    console.log("Completing order ...");
    var newStock = selected.stock + quantity;
    var queryStr = "UPDATE products SET ? WHERE ?";
    
    store.conn = mySQL();
    await store.conn.query(queryStr, [{ stock_quantity: newStock }, { product_id: selected.id } ], function(err, res) 
    {
        if (err) throw err;
        
        var print = [
            ["ID", "Item", "price", "Previous Stock", "Current Stock"],
            [selected.id, selected.name, selected.price, selected.stock, newStock]
        ];
        print = tablify(print, { has_header: true, show_index: false });
        console.logWithBars("Product updated sussefully.");
        console.log(print);
        store.conn.end();
        init();
    });
}

var promptNewProduct = async function(dept)
{
    store.dept = dept;
    deptChoises = []
    dept.forEach(item => deptChoises.push(item.name));

    await inquirer.prompt([
        {
          type: "list",
          name: "dept",
          default: null,
          message: "Select a department:",
          choices: deptChoises
        },
        {
          type: "input",
          name: "name",
          message: "Type in the product name:",
        },
        {
          type: "input",
          name: "price",
          message: "Type in the price:",
        }])
        .then(function(response) 
        {
            var name = response.name.trim();
            var price = parseFloat(response.price);
            var deptIndex = store.dept.indexOfKeyValue("name", response.dept.trim());

            if (name && price && deptIndex > -1)
            {
                completeNewProduct(name, price, deptIndex);
            }
            else
            {
                console.logWithBars("There are errors on the input, please start again.");
                promptNewProduct(dept);
            }
        });
}

var getDepartments = async function()
{
    var queryStr = "SELECT department_id AS id, department_name AS name FROM departments";
    store.conn = mySQL();
    store.conn.query(queryStr, function(err, res) 
    {
        if (err) throw err;
        promptNewProduct(res);
        store.conn.end();
    });
}

var completeNewProduct = async function (name, price, deptIndex) 
{
    console.log("Saving to database ...");
    var queryStr = "INSERT INTO products SET ?, ?, ?";
    
    store.conn = mySQL();
    await store.conn.query(queryStr, [
            { department_id: store.dept[deptIndex].id }, 
            { product_name: name }, 
            { price: price }
        ], function(err, res) 
        {
            if (err) throw err;
            
            var print = [
                ["Id", "Item", "Department", "price"],
                [res.insertId, name, store.dept[deptIndex].name, price]
            ];
            print = tablify(print, { has_header: true, show_index: false });
            console.logWithBars("Product created sussefully.");
            console.log(print);
            store.conn.end();
            init();
        });
}

var cancelOperation = function (message) 
{
    console.logWithBars(message);
    init();
}

init();