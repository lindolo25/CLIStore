var inquirer = require('inquirer');
var tablify = require('tablify').tablify;
var conn = require('./dbConnection.js');

var store = {
    products: null
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
    
    await conn.query(queryStr, function(err, res) 
    {
        if (err) throw err;
        store.products = res;
        var print = tablify(res, { keys: ['id', 'name', 'dept', 'price'], show_index: false });
        console.log(print);
        conn.end();
    });
}

var promptForOrder = function () 
{
    
}

var verifyOrder = function () 
{
    
}

var completeOrder = function () 
{
    
}

var cancelOrder = function () 
{
    
}

var endOrStartAgain = function () 
{
    
}

init();