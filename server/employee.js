const express = require('express');

const app = express();

app.use(express.static(__dirname+'/../employee'))


(function () {
    var employee = __dirname+'/employee.js';


    module.exports.getEmployee = function (){
        return employee();
    }
}());


