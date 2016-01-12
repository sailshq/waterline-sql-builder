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
        query = query.select(value);
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

      where: function() {

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
