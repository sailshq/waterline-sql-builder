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
      'where': 'WHERE',
      'insert': 'INSERT',
      'into': 'INTO',
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
        value: operator
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: value
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

    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processInsert(value) {

      // Add the insert statment
      results.push({
        type: 'IDENTIFIER',
        value: 'INSERT'
      });

      // Check if a value is being used
      if(_.isObject(value)) {

        _.each(_.keys(value), function(key) {
          results.push({
            type: 'KEY',
            value: key
          });

          results.push({
            type: 'VALUE',
            value: value[key]
          });
        });

        return;
      }
    }

    //  ╦╔╗╔╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║ ║ ║ ║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processInto(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'INTO'
      });

      results.push({
        type: 'VALUE',
        value: value
      });
    }

    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    function processWhere(value) {

      // Tokenize the where and then call the tokenizer on the where values
      results.push({
        type: 'IDENTIFIER',
        value: 'WHERE'
      });

      tokenizeObject(value);
    }

    //  ╔═╗╦═╗  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
    //  ║ ║╠╦╝  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
    //  ╚═╝╩╚═  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
    function processOr(value) {

      // Add the Or token
      results.push({
        type: 'CONDITION',
        value: 'OR'
      });

      // For each condition in the OR, add a group token and process the criteria.
      _.forEach(value, function(criteria, idx) {

        // Start a group
        results.push({
          type: 'GROUP',
          value: idx
        });

        tokenizeObject(criteria);

        // End a group
        results.push({
          type: 'ENDGROUP',
          value: idx
        });

      });

      // Close the condition
      results.push({
        type: 'ENDCONDITION',
        value: 'OR'
      });
    }



    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║███████╗███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    function tokenizeObject(obj) {

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

          // If the identifier is an INSERT, add it's token
          if(identifiers[key] === 'INSERT') {
            processInsert(obj[key]);
            return;
          }

          // If the identifier is an INTO, add it's token
          if(identifiers[key] === 'INTO') {
            processInto(obj[key]);
            return;
          }

          // If the identifier is a WHERE, add it's token and process it's values
          if(identifiers[key] === 'WHERE') {
            processWhere(obj[key]);
            return;
          }

          // If the identifier is an OR, start a group and add each token.
          if(identifiers[key] === 'OR') {
            processOr(obj[key]);
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
