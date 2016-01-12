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
        function parseClause(val, parentKey) {

          // For each key in the clause process the clause
          _.each(_.keys(val), function(key) {

            // Placeholder for generating logic
            var obj = [];

            // if the key is a reserved word process it differently
            if(_.includes(reservedWords, key)) {

            }

            // Otherwise check if the value is an object
            if(_.isPlainObject(val[key])) {
              parseClause(val[key], key);
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

            // Use .apply to pass in the array as arguments
            // ex: .where('foo', '>', 100)
            query.where.apply(query, obj);
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
