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

```sql
select 'title', 'author', 'year' from 'books'
```

**Example of all columns**

```javascript
{
  select: '*',
  from: 'books'
}
```

**Outputs:**

```sql
select * from 'books'
```


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

```sql
select * from "books"
```


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

```sql
select * from "public"."books"
```


### Distinct (proposed syntax)

Allows the ability to select `distinct` values.

**NOTE:** Need to figure out what this would look like in a NOSql data store such
as mongo. If it's a sql only syntax could it just be covered by a raw key?

**Example:**

```javascript
{
  select: {
    distinct: ['firstName', 'lastName']
  },
  from: 'customers'
}
```

**Outputs:**

```sql
select distinct "first_name", "last_name" from "customers"
```


## Where Clauses

There are several helpers available to you to create complex where queries as well
as sub queries.

#### Key Value

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

```sql
select "id" from "books" where "firstName" = 'Test' and "lastName" = 'User'
```


#### Using Operators

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

```sql
select * from "users" where "votes" > '100'
```


#### Grouped Clauses

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

```sql
select * from "users" where ("id" = '1' or "id" > '10') or "name" = 'Tester'
```


#### Sub-Queries

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

```sql
select * from "accounts" where "id" IN (select "id" from "users" where "votes" > '100' and "status" = 'active' or "name" = 'John')
```


## Where Not Clauses

#### Key Value

**Example**

```javascript
{
  select: ['id'],
  from: 'users',
  where: {
    not: {
      firstName: 'Test',
      lastName: 'User'
    }
  }
}
```

**Outputs:**

```sql
select "id" from "users" where not "firstName" = 'Test' and not "lastName" = 'User'
```


#### Grouped Clauses

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

```sql
select * from "users" where not ("id" = '1' or not "id" > '10') or not "name" = 'Tester'
```


#### Operators

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

```sql
select * from "users" where not "votes" > '100'
```


## Where In

#### Key Value

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

```sql
select * from "users" where "id" in ('1', '2', '3') or "id" in ('4', '5', '6')
```


#### Sub Queries

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

```sql
select "name" from "users" where "accountId" in (select "id" from "accounts")
```


#### Operators

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

```sql
select * from "users" where "name" = 'John' or ("votes" > '100' and "title" not 'Admin')
```


## Where Not In

#### Key Value

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    id: {
      not: [1,2,3]
    }
  }
}
```

**Outputs:**

```sql
select * from "users" where "id" not in ('1','2','3')
```

#### Operators

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    or: [
      { name: { like: '%Test%' } },
      { id: { not: [1,2,3] } }
    ]
  }
}
```

**Outputs:**

```sql
select * from "users" where "name" like '%Test%' or "id" not in ('1','2','3')
```


## Where Null

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    updatedAt: 'NULL'
  }
}
```

**Outputs:**

```sql
select * from "users" where "updatedAt" is null
```


## Where Not Null

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    updatedAt: { not: 'NULL' }
  }
}
```

**Outputs:**

```sql
select * from "users" where "updatedAt" is not null
```

## Where Exists

**NOT SUPPORTED**


## Where Not Exists

**NOT SUPPORTED**


## Where Between (proposed syntax)

**NOTE:** Note sure if this is needed if we support the `>` and `<` operators.
This could be represented as less than and greater than.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    votes: {
      between: [1, 100]
    }
  }
}
```

**Outputs:**

```sql
select * from "users" where "votes" between '1' and '100'
```


## Where Raw (proposed syntax)

Sometimes you can't express the query needed using the defined query language. For
these rare cases a `raw` key is provided that allows you to pass in a string value
to use as a where clause. For a NoSQL storage provider, a JSON stringified version
may be supplied.

**NOTE:** In this proposal, the word `raw` is reserved which would prevent you from
searching using a column name `raw`. An alternative could be a clearer `whereRaw`
object key name.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  where: {
    raw: ['id = ?', [1]]
  }
}
```

**Outputs:**

```sql
select * from "users" where id = '1'
```


## Join Methods

Placeholder


## Group By

Adds a `group by` clause to the query.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  groupBy: ['count']
}
```

**Outputs:**

```sql
select * from "users" group by "count"
```


### Group By Raw

**Example:**

```javascript
{
  select: ['year', { raw: ['SUM(profit)'] }]
  from: 'sales',
  groupBy: [{ raw: ['year WITH ROLLUP'] }]
}
```

**Outputs:**

```sql
select "year", SUM(profit) from "sales" group by year WITH ROLLUP
```


## Order By

Adds an `order by` clause to the query.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  orderBy: [{ name: 'desc' }]
}
```

**Outputs:**

```sql
select * from "users" order by "name" desc
```


### Order By Raw

**Example:**

```javascript
{
  select: '*'
  from: 'table',
  orderBy: [{ raw: ['col NULLS LAST DESC'] }]
}
```

**Outputs:**

```sql
select * from "table" order by col NULLS LAST DESC
```
