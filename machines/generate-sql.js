module.exports = {

  friendlyName: 'Generate SQL',

  description: 'Generate a SQL string ',

  cacheable: true,

  sync: true,

  inputs: {

    flavor: {
      description: 'The SQL flavor to use for the query.',
      example: 'PostgreSQL',
      defaultsTo: 'postgresql'
    },

    query: {
      description: 'The query object to use.',
      example: {},
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'The generated sql query',
      example: 'SELECT * FROM "books";'
    },

  },


  fn: function(inputs, exits) {
    var _ = require('lodash');
    var knex = require('knex')({ dialect: inputs.flavor });
    var query = false;

    var processor = {

      // Generate a SELECT
      select: function(value) {
        query = query || knex;

        // Check if a distinct or other key is being used
        if(_.isObject(value) && !_.isArray(value)) {
          if(value.distinct) {
            query.distinct(value.distinct).select();
          }
        } else {
          query = query.select(value);
        }
      },

      // Generate a FROM
      from: function(value) {
        query = query || knex;

        // Check if a schema is being used
        if(_.isObject(value)) {
          if(value.schema) {
            query.withSchema(value.schema);
          }

          if(value.table) {
            query.from(value.table);
          }
        } else {
          query = query.from(value);
        }
      },

      // Parse the WHERE clause
      where: function(value) {

        var reservedWords = ['or'];

        // Recursively go through the values in the where clause and build up
        // the appropriate Knex function.
        function parseClause(val, parentKey, reservedFn, context) {

          // For each key in the clause process the clause
          _.each(_.keys(val), function(key) {

            // Placeholder for generating logic
            var obj = [];

            // if the key is a reserved word process it differently
            if(_.includes(reservedWords, key)) {

              // Handle OR keys
              if(key === 'or') {

                // Validate that the OR key is an array
                if(!_.isArray(val[key])) { throw new Error('Invalid OR syntax'); }

                // Reset the context each time we enter a new grouping
                context = [];

                // For each item in the array, parse the criteria
                _.each(val[key], function(clause) {

                  // Build up a base argument to send
                  var args = [clause, undefined, 'orWhere'];

                  // If we are already in a group, tested by checking if
                  // there is a `reservedFn` value set, then add the context
                  // array because the arguments will need to be grouped a bit
                  // different.
                  if(reservedFn) { args.push(context || []); }
                  parseClause.apply(this, args);
                });

                // If we are in a nested grouped clause, perform the top level
                // `where` function here and wrap the children in a function.
                // This is because of the way grouping works in Knex, in order
                // to wrap groups in parenthesis they need to look like the
                // following example:
                // query.orWhere(function() {
                //   this.where('foo', '>', 'bar').orWhere('age', '>', 20);
                // })
                if(reservedFn) {

                  // Use .apply to pass in the array as arguments
                  // ex: .where('foo', '>', 100)
                  query.orWhere(function() {
                    var self = this;
                    _.each(context, function(opt) {
                      self.orWhere.apply(self, opt);
                    });
                  });
                }

                return;
              }

            }

            // Otherwise check if the value is an object
            if(_.isPlainObject(val[key])) {

              // Build up a dynamic argument list based on the availability of
              // arguments to the parent function
              var args = [val[key], key];
              if(reservedFn) { args.push(reservedFn); }
              if(context) { args.push(context); }

              parseClause.apply(this, args);
              return;
            }

            // Add the primitive value as an array.
            // ex: ['foo', 100] for { foo: 100 }
            var lookupKey = parentKey ? parentKey : key;
            obj.push(lookupKey);

            // If there is a parentKey this a 3 part value.
            // ex: ['foo', '>', 100]
            if(parentKey) {
              obj.push(key);
            }
            // Add in the value
            obj.push(val[key]);

            // If we are operating inside a grouped clause, don't do the apply
            // here. Instead do it in the calling grouping function.
            if(context) {
              context.push(obj);
              return;
            }

            // Use .apply to pass in the array as arguments
            // ex: .where('foo', '>', 100)
            var fn = reservedFn || 'where';
            query[fn].apply(query, obj);
          });
        }

        parseClause(value);
      },

    };

    // Process all of the keys in the query clause

    // Due to the way Knex works, find the "from" clause if available and run it
    // first. This will set everything up correctly.
    var clauseKeys = _.reject(_.keys(inputs.query), 'from');
    var _from = inputs.query.from;

    if(_from) {
      processor.from(_from);
    }

    _.each(clauseKeys, function(key) {
      if(processor[key]) {
        processor[key](inputs.query[key]);
      }
    });

    var SQL = query.toString();
    return exits.success(SQL);
  },

};
