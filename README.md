# Waterline SQL Builder

[![Build Status](https://travis-ci.org/treelinehq/waterline-sql-builder.svg?branch=master)](https://travis-ci.org/treelinehq/waterline-sql-builder)

A helper for building SQL queries from Waterline statements based on [Knex](http://knexjs.org).

This is a replacement for the [Waterline-Sequel](https://github.com/balderdashy/waterline-sequel) package in newer specs of the Waterline adapter interface. It is not backwards compatible.

Behind the scenes [Knex](http://knexjs.org) is used to generate queries which should be valid in any of the
databases they support. The official SQL adapters will use this library internally.

Refer to [Waterline Query Docs](https://github.com/particlebanana/waterline-query-docs) for more information on Waterline Statements.


## How To Use

This module is meant to be used by adapter authors who need to generate a query to run on a given driver. Example usage is below:

```javascript
var sqlBuilder = require('waterline-sql-builder')({
  dialect: 'postgres'
});

var sql = sqlBuilder.generate({
  select: ['id'],
  where: {
    firstName: 'Test',
    lastName: 'User'
  },
  from: 'users'
});

```
{
  sql: 'select "id" from "users" where "firstName" = $1 and "lastName" = $2',
  bindings: ['Test', 'User']
}
```
