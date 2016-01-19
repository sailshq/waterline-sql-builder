module.exports = {


  friendlyName: 'Sequelizer',


  description: 'Uses Knex to generate sequel for the tree',


  cacheable: true,


  sync: true,


  inputs: {

    dialect: {
      description: 'The SQL dialect to use when generating the query',
      example: 'postgresql',
      defaultsTo: 'postgresql'
    },

    tree: {
      description: 'A tokenized tree representing the query values.',
      example: [[]],
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'A SQL string generated from the tree.',
      example: 'select * from "books"'
    },

  },


  fn: function(inputs, exits) {

    var _ = require('lodash');
    var knex = require('knex')({ dialect: inputs.dialect });
    var tree = inputs.tree;
    var query = knex.queryBuilder();


    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗═╗ ╦╔═╗╦═╗╔═╗╔═╗╔═╗╦╔═╗╔╗╔  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ║╣ ╔╩╦╝╠═╝╠╦╝║╣ ╚═╗╚═╗║║ ║║║║  ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝╩ ╚═╩  ╩╚═╚═╝╚═╝╚═╝╩╚═╝╝╚╝  ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Builds up an array of values that can be passed into the .where or .orWhere
    // functions of Knex.
    function whereBuilder(expr, expression) {

      // Handle KEY/VALUE pairs
      if(expr.type === 'KEY') {
        // Reset the expression for each new key, unless there was already a
        // modifier present.
        expression = expression.length > 1 ? [] : expression;
        expression.push(expr.value);
        return expression;
      }

      // Handle OPERATORS such as '>' and '<'
      if(expr.type === 'OPERATOR') {
        expression.push(expr.value);
        return expression;
      }

      // Set the value
      if(expr.type === 'VALUE') {
        expression.push(expr.value);
        return expression;
      }

    }


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔╔═╗╦
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║╠═╣║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝╩ ╩╩═╝
    //
    // Process a group of values that make up a conditional.
    // Such as an OR statement.
    function processGroup(tokens, nested, expression, modifier) {

      // Hold values that make up a nested expression group.
      var expressionGroup = [];

      // Hold a function value to use
      var fn;

      // Loop through each expression in the group
      _.each(tokens, function(groupedExpr, idx) {

        // If there is a NOT condition, reset the expression and add the NOT
        // condition as the first item in the expression. The analyzer will
        // always put the NOT condition before an expression set.
        if(groupedExpr.type === 'CONDITION' && groupedExpr.value === 'NOT') {
          expression = [];
          expression.unshift(groupedExpr.value);
          return;
        }

        // If the grouped expression is a nested array, this represents a nested
        // OR statement. So instead of building the query outright, we want to
        // collect all the pieces that make it up and call the Knex grouping
        // function at the end.
        if(_.isArray(groupedExpr)) {
          expressionGroup.push(processGroup(groupedExpr, true, expression, modifier));
          return;
        }

        // If there is a KEY/OPERATOR/VALUE token, process it using the where builder
        if(groupedExpr.type === 'KEY' || groupedExpr.type === 'OPERATOR' || groupedExpr.type === 'VALUE') {
          expression = whereBuilder(groupedExpr, expression);
        }

        // If the expression's type is value after we are done processing it we
        // can add it to the query. Unless we are in a nested statement in
        // which case just add it to the expression group.
        if(groupedExpr.type === 'VALUE') {

          // Look ahead in the tokens and see if there are any more VALUE
          // expressions. If so, this will need to be an expression group so
          // that we get parenthesis around it. This is commonly used where you
          // have a criteria like the following:
          // {
          //   or: [
          //     { name: 'foo' },
          //     { age: 21, username: 'bar' }
          //   ]
          // }
          // Here we need to wrap the `age` and `username` part of the
          // expression in parenthesis.
          var hasMoreValues = _.filter(tokens, { type: 'VALUE' });

          // If there are more values, add the current expression to the group.
          // Prepend an AND statement to the beginning to show that the will
          // end up as (age = 21 and username = bar). If this was an OR statement
          // it would be processed differently because the tokens would be
          // nested arrays.
          if(hasMoreValues.length > 1) {
            expression.unshift('AND');
            expressionGroup.push(expression);
            return;
          }

          // If this is a nested expression, just update the expression group
          if(nested) {
            expressionGroup = expressionGroup.concat(expression);
            return;
          }

          // Otherwise we can go ahead and write the expression to the query.

          // Check for any modifiers added to the beginning of the expression.
          // These represent things like NOT. Pull the value from the expression.
          var modifiers = checkForModifiers(expression);

          // Default the fn value to `orWhere`
          fn = 'orWhere';

          // If we have a modifier, take that into account when building the
          // expression.
          if(modifiers.modifier && modifiers.modifier === 'NOT') {
            fn = 'orWhereNot';
          }

          query[fn].apply(query, expression);
        }
      });

      // If we are inside of a nested expression, return the group after we are
      // done processing all the tokens.
      if(nested) {
        return expressionGroup;
      }

      // If there is an expression group and no nesting, create a grouped function
      // on the query.

      // Figure out what the function should be by examining the first item
      // in the expression group. If it has any modifiers or combinators, grab
      // them. We do this so we know if the grouping should be negated or not.
      // ex: orWhereNot vs orWhere
      var modifiers = checkForModifiers(_.first(expressionGroup), { strip: false });

      // Default the fn value to `orWhere`
      fn = 'orWhere';

      if(modifiers.modifier && modifiers.modifier === 'NOT') {
        fn = 'orWhereNot';
      }

      // Build a function that when called, creates a nested grouping of statements.
      query[fn].call(query, function() {
        var self = this;

        // Process each expression in the group, building up a query as it goes.
        _.each(expressionGroup, function(expr, idx) {

          // default the _fn to `orWhere`
          var _fn = 'orWhere';

          // Check for any modifiers and combinators
          var modifiers = checkForModifiers(expr);

          // Handle when to use `orWhereNot` vs `whereNot`
          if(modifiers.modifier === 'NOT') {
            if(modifiers.combinator === 'AND') {
              _fn = 'whereNot';
            }

            // Defaults to OR when grouping
            if(modifiers.combinator === 'OR' || !modifiers.combinator) {
              _fn = 'orWhereNot';
              modifiers.combinator = 'OR';
            }
          }

          // Handle empty modifiers. Use this when not negating. Defaulting to
          // use the `orWhere` statement already set.
          else {
            if(modifiers.combinator === 'AND') {
              _fn = 'where';
            }
          }

          // If the first item in the array, always force the fn to be
          // where. This is part of the way Knex works.
          if(idx === 0) {
            _fn = 'where';
          }

          self[_fn].apply(self, expr);
        });
      });
    }

    // Check for any embedded combinators (OR) or modifiers (NOT) in a single
    // expression set.
    function checkForModifiers(expr, options) {
      var combinator;
      var modifier;

      // Default to removing the values from the array
      // var strip = options && options.strip ? options.strip : true;
      options = _.defaults(options, { strip: true });

      // Check for any encoded combinators and remove them
      var cIdx = _.indexOf(expr, 'AND');
      if(cIdx > -1) {
        combinator = 'AND';
        if(options.strip) {
          _.pullAt(expr, cIdx);
        }
      }

      // Check for any modifiers added to the beginning of the expression.
      // These represent things like NOT. Pull the value from the expression
      var mIdx = _.indexOf(expr, 'NOT');
      if(mIdx > -1) {
        modifier = 'NOT';
        if(options.strip) {
          _.pullAt(expr, mIdx);
        }
      }

      return {
        combinator: combinator,
        modifier: modifier
      };
    }


    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Builds an array of KEY/VALUE pairs to use as the insert clause.
    function insertBuilder(expr, expression) {
      var arr = [];

      // Handle KEY/VALUE pairs
      if(expr.type === 'KEY') {
        arr.push(expr.value);
        expression.push(arr);

        return expression;
      }

      // Set the VALUE pair
      if(expr.type === 'VALUE') {
        arr = _.last(expression);
        arr.push(expr.value);

        return expression;
      }

    }


    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗    ██████╗  █████╗ ██████╗ ███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ██████╔╝███████║██████╔╝███████╗█████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ██╔═══╝ ██╔══██║██╔══██╗╚════██║██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ██║     ██║  ██║██║  ██║███████║███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // Loop through each token group in the tree and add to the query
    _.forEach(tree, function(tokenGroup, key) {
      var identifier;
      var modifier;
      var fn;
      var expression = [];

      // Loop through each item in the group and build up the expression
      _.each(tokenGroup, function(expr, idx) {

        // Handle identifiers by storing them on the fn
        if(expr.type === 'IDENTIFIER') {
          identifier = expr.value;
          return;
        }

        // Modifiers
        if(expr.type === 'CONDITION' && expr.value === 'NOT') {
          modifier = expr.value;
          return;
        }

        // Handle sets of values being inserted
        if(identifier === 'INSERT' && (expr.type === 'KEY' || expr.type === 'VALUE')) {
          expression = insertBuilder(expr, expression);
        }

        // Handle clauses in the WHERE value
        if(identifier === 'WHERE' && (expr.type === 'KEY' || expr.type === 'OPERATOR' || expr.type === 'VALUE')) {
          expression = whereBuilder(expr, expression, modifier);
        }

        // Process value and use the appropriate Knex function
        if(expr.type === 'VALUE') {

          // Examine the identifier value
          switch(identifier) {
            case 'SELECT':
              query.select(expr.value);
              break;

            case 'FROM':
              query.from(expr.value);
              break;

            case 'SCHEMA':
              query.withSchema(expr.value);
              break;

            case 'DISTINCT':
              query.distinct(expr.value);
              break;

            case 'INTO':
              query.into(expr.value);
              break;

            case 'INSERT':

              // Look ahead and see if the next expression is an Identifier.
              // If so or if there is no next identifier, add the insert statments.
              var nextExpr = tokenGroup[idx+1];
              if(!nextExpr || nextExpr.type === 'IDENTIFIER') {

                // Flatten the expression
                expression = _.fromPairs(expression);
                query.insert(expression);
              }
              break;

            case 'WHERE':

              // Check the modifier to see if a different function other than
              // WHERE should be used. The most common is NOT.
              if(modifier) {
                if(modifier === 'NOT') fn = 'whereNot';
              }

              // Otherwise use the where fn
              else {
                fn = 'where';
              }

              // Set the second or third item in the array to the value
              query[fn].apply(query, expression);

              // Clear the modifier
              modifier = undefined;
              break;
          }

          return;
        }


        //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
        //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
        //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
        //
        // If the expression is an array then the values should be grouped.
        if(_.isArray(expr)) {
          processGroup(expr, false, expression);
        }

      });

    });

    var _SQL = query.toString();
    return exits.success(_SQL);
  },



};
