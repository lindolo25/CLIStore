var inquirer = require('inquirer');
var tablify = require('tablify').tablify;
var mySQL = require('./dbConnection.js');
require("./commonds");

var store = {
    products: null,
    conn: null
}

var init = function () 
{
    printProducts();
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
        var print = tablify(res, { keys: ['id', 'name', 'dept', 'price'], show_index: false });
        console.log(print);
        store.conn.end();
        promptForOrder();
    });
}

var promptForOrder = async function () 
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
                verifyOrder(productId, quantity);
            }
            else
            {
                console.logWithBars("This order run into a problem, please start again");
                promptForOrder();
            }
        });
}

var verifyOrder = function (productId, quantity) 
{
    var i = store.products.indexOfKeyValue("id", productId);
    if(i)
    {
        var selected = store.products[i];

        if(quantity <= selected.stock)
        {
            completeOrder(selected, quantity);
        }
        else
        {
            cancelOrder("Sorry but our stock is to short to fulfill your demand! This order cannot be completed.");
        }
    }
    else cancelOrder("This product does not exist, the order cannot be completed.");    
}

var completeOrder = async function (selected, quantity) 
{
    console.log("Completing order ...");
    selected.stock = selected.stock - quantity;
    var queryStr = "UPDATE products SET ?, ? WHERE ?";
    var total = selected.price * quantity;
    selected.saleTotal = selected.saleTotal + total;
    
    store.conn = mySQL();
    await store.conn.query(queryStr, [{ stock_quantity: selected.stock }, { product_sale: selected.saleTotal }, { product_id: selected.id } ], function(err, res) 
    {
        if (err) throw err;
        
        var print = [
            ["ID", "Item", "price", "Quantity", "Total"],
            [selected.id, selected.name, selected.price, quantity, total]
        ];
        print = tablify(print, { has_header: true, show_index: false });
        console.logWithBars("Order Details.");
        console.log(print);
        store.conn.end();
        endOrStartAgain();
    });
}

var cancelOrder = function (message) 
{
    console.logWithBars(message);
    endOrStartAgain();
}

var endOrStartAgain = async function () 
{
    await inquirer.prompt([
        {
          type: "list",
          name: "continue",
          default: null,
          message: "",
          choices: ["Continue Shopping", "Exit"]
        }])
        .then(function(response) 
        {
            switch(response.continue)
            {
                case "Continue Shopping":
                    init();
                    break;
                default:
                    break;
            }
        });
}

init();