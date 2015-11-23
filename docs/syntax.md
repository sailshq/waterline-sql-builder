# Waterline Query Syntax Documentation

This will document the declaritive query syntax used in the Waterline Query Builder
notation. Through this syntax you should be able to compose complex queries that
can run on both a SQL data store or a NoSQL data store. The language is completely
database independent.

However for familiarity the generated SQL query is shown next to each example.

## Query Building


## Selects

Creates a `select` query. Accepts either an array of columns to select or a
single `'*'` value to represent all values.

**Example of named columns**

```javascript
{
  select: ['title', 'author', 'year'],
  from: 'books'
}
```

**Outputs:**

`select 'title', 'author', 'year' from 'books'`

**Example of all columns**

```javascript
{
  select: '*',
  from: 'books'
}
```

**Outputs:**

`select * from 'books'`


### From

Specifies which table to perform the query on.

**Example**

```javascript
{
  select: '*',
  from: 'books'
}
```

**Outputs:**

`select * from "books"`


### Schemas

You can specifiy a schema to be used as a prefix of the table name.

**Example**

```javascript
{
  select: '*',
  from: { identity: 'books', schema: 'public' }
}
```

**Outputs:**

`select * from "public"."books"`


## Where Clauses

There are several helpers available to you to create complex where queries as well
as sub queries.

### Key Value

**Example**

```javascript
{
  select: ['id'],
  where: {
    firstName: 'Test',
    lastName: 'User'
  }
  from: 'users'
}
```

**Outputs:**

`select "id" from "books" where "firstName" = 'Test' and "lastName" = 'User'`


### Using Operators

```javascript
{
  select: '*',
  where: {
    votes: { '>': 100 }
  }
  from: 'users'
}
```

**Outputs:**

`select * from "users" where "votes" > '100'`


### Grouped Clauses

**Example**

```javascript
{
  select: '*',
  where: {
    or: [
      {
        or: [
          { id: 1 },
          { id: { '>': 10 } }
        ]
      },
      {
        name: 'Tester'
      }
    ]
  }
  from: 'users'
}
```

**Outputs:**

`select * from "users" where ("id" = '1' or "id" > '10') or "name" = 'Tester'`


### Sub-Queries

You can also create subqueries. The following example will show you how to nest
queries within a query as well as show a combination of AND and OR operators.

**Example**

```javascript
{
  select: '*',
  from: 'accounts',
  where: {
    id: [
      {
        select: ['id'],
        from: 'users',
        where: {
          votes: { '>': 100 },
          or: [
            { status: 'active' },
            { name: 'John' }
          ]
        }
      }
    ]
  }
}
```

**Outputs:**

`select * from "accounts" where "id" IN (select "id" from "users" where "votes" > '100' and "status" = 'active' or "name" = 'John')`


## Where Not Clauses

### Key Value

**Example**

```javascript
{
  select: ['id'],
  from: 'users',
  whereNot: {
    firstName: 'Test',
    lastName: 'User'
  }
}
```

**Outputs:**

`select "id" from "users" where not "firstName" = 'Test' and not "lastName" = 'User'`


### Grouped Clauses

**Example**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    or: [
      {
        not: {
          or: [
            { id: 1 },
            { not: { id: > 10 } }
          ]
        }
      },
      {
        not: {
          name: 'Tester'
        }
      }
    ]
  ]
}
```

**Outputs:**

`select * from "users" where not ("id" = '1' or not "id" > '10') or not "name" = 'Tester'`


### Operators

**Example**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    not: {
      votes: { '>': 100 }
    }
  }
}
```

**Outputs:**

`select * from "users" where not "votes" > '100'`


## Where In

### Key Value

**Example:**

```javascript
{
  select: ['name'],
  from: 'users',
  where: {
    or: [
      { id: [1,2,3] },
      { id: [4,5,6] }
    ]
  }
}
```

**Outputs:**

`select * from "users" where "id" in ('1', '2', '3') or "id" in ('4', '5', '6')`


### Sub Queries

**Example:**

```javascript
{
  select: ['name'],
  from: 'users',
  where: {
    accountId: [
      {
        select: ['id'],
        from: 'accounts'
      }
    ]
  }
}
```

**Outputs:**

`select "name" from "users" where "accountId" in (select "id" from "accounts")`


### Operators

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    or: [
      { name: 'John' },
      {
        votes: { '>': 100 },
        title: {
          not: 'Admin'
        }
      }
    ]
  }
}
```

**Outputs:**

`select * from "users" where "name" = 'John' or ("votes" > '100' and "title" not 'Admin')`
