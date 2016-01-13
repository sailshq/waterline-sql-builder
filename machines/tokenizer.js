module.exports = {


  friendlyName: 'Tokenizer',


  description: 'Tokenizes the query',


  cacheable: true,


  sync: true,


  inputs: {

    expression: {
      description: 'The description to tokenize.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The tokenized expression',
      example: [{
        type: 'IDENTIFIER',
        value: '*'
      }]
    },

  },


  fn: function(inputs, exits) {

    var _ = require('lodash');
    var expression = inputs.expression;
    var results = [];

    var identifiers = {
      'select': 'SELECT',
      'from': 'FROM',
      'or': 'OR',
      'not': 'NOT',
      'in': 'IN',
      'distinct': 'DISTINCT',
      '>': 'OPERATOR',
      '<': 'OPERATOR',
      '<>': 'OPERATOR',
    };


    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔╦╗╔═╗╦═╗╔═╗
    //  ║ ║╠═╝║╣ ╠╦╝╠═╣ ║ ║ ║╠╦╝╚═╗
    //  ╚═╝╩  ╚═╝╩╚═╩ ╩ ╩ ╚═╝╩╚═╚═╝
    function processOperator(operator, value) {
      // Add the operator to the results
      results.push({
        type: 'OPERATOR',
        value: key
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: obj[key]
      });
    }


    //  ╔═╗╔═╗╦  ╔═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╚═╗║╣ ║  ║╣ ║   ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩═╝╚═╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processSelect(value) {

      // Check if a distinct or other key is being used
      if(_.isObject(value) && !_.isArray(value)) {
        if(value.distinct) {

          // Add the distinct to the results
          results.push({
            type: 'IDENTIFIER',
            value: 'DISTINCT'
          });

          // Add the value to the results
          results.push({
            type: 'VALUE',
            value: value.distinct
          });

          return;
        }
      }

      // Add the select to the results
      results.push({
        type: 'IDENTIFIER',
        value: 'SELECT'
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: value
      });
    }


    //  ╔═╗╦═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠╣ ╠╦╝║ ║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚  ╩╚═╚═╝╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processFrom(value) {

      // Check if a schema is being used
      if(_.isObject(value)) {
        if(value.schema) {
          results.push({
            type: 'IDENTIFIER',
            value: 'SCHEMA'
          });

          results.push({
            type: 'VALUE',
            value: value.schema
          });
        }

        if(value.table) {
          results.push({
            type: 'IDENTIFIER',
            value: 'FROM'
          });

          results.push({
            type: 'VALUE',
            value: value.table
          });
        }

        return;
      }

      // Otherwise just add the FROM value
      results.push({
        type: 'IDENTIFIER',
        value: 'FROM'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

    }


    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║███████╗███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    function tokenizeObject(obj, level) {

      // Add a new level to the results if needed
      if(level) {
        results.push({
          type: 'LEVEL'
        });
      }

      _.each(_.keys(obj), function(key) {

        // Check if the key is a known identifier
        var isIdentitifier = identifiers[key];

        // If so, look ahead at it's value to determine what to do next.
        if(isIdentitifier) {

          // If the identifier is an OPERATOR, add it's tokens
          if(identifiers[key] === 'OPERATOR') {
            processOperator(key, obj[key]);
            return;
          }

          // If the identifier is a SELECT, add it's token
          if(identifiers[key] === 'SELECT') {
            processSelect(obj[key]);
            return;
          }

          // If the identifier is a FROM, add it's token
          if(identifiers[key] === 'FROM') {
            processFrom(obj[key]);
            return;
          }

          // Add the identifier
          results.push({
            type: identifiers[key],
            value: key
          });

          // If the identifier is an array, loop through each item and tokenize
          if(_.isArray(obj[key])) {
            _.each(obj[key], function(expr) {
              tokenizeObject(expr);
            });

            return;
          }

          // If the identifier is an object, continue tokenizing it
          if(_.isPlainObject(obj[key])) {
            tokenizeObject(obj[key]);
            return;
          }

          // Otherwise WTF?
          return;
        }

        // Otherwise add the token for the key
        results.push({
          type: 'KEY',
          value: key
        });

        // If the value is an object, recursively parse it
        if(_.isPlainObject(obj[key])) {
          tokenizeObject(obj[key]);
          return;
        }

        // If the value is a primitive add it's token
        results.push({
          type: 'VALUE',
          value: obj[key]
        });
      });
    }

    tokenizeObject(expression);

    return exits.success(results);
  },



};
