module.exports = {


  friendlyName: 'Generate SQL',


  description: 'Generates a SQL string from an expression',


  cacheable: true,


  sync: true,


  inputs: {

    dialect: {
      description: 'The SQL dialect to generate a query for.',
      example: 'postgresql'
    },

    query: {
      description: 'The query to parse.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The generated SQL statement.',
      example: 'select * from "books"'
    },

  },


  fn: function(inputs, exits) {

    var Pack = require('../index');

    // Tokenize the values
    var tokens = Pack.tokenizer({
      expression: inputs.query
    }).execSync();

    // Analyze the tokens
    var tree = Pack.analyzer({
      tokens: tokens
    }).execSync();

    // Generate the SQL
    var sql = Pack.sequelizer({
      dialect: inputs.dialect,
      tree: tree
    }).execSync();

    return exits.success(sql);
  },



};
