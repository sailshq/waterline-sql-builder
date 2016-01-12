# Waterline Query Syntax Documentation

This will document the declarative query syntax used in the Waterline Query Builder
notation. Through this syntax you should be able to compose complex queries that
can run on both a SQL data store or a NoSQL data store. The language is completely
database independent. This acts as an interchange format that can be processed
by an adapter and interpreted to be run on that particular database. It is highly
influenced by a relational sequel language but should be normalized enough to
be converted into NoSql queries as well.

For familiarity the generated SQL query is shown next to each example using the
PostgreSQL dialect. The equivalent MongoDB query is also shown.


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
-- PostgreSQL
select "title", "author", "year" from "books"
```

```javascript
// MongoDB
db.books.find({}, { title: 1, author: 1, year: 1 })
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
-- PostgreSQL
select * from "books"
```

```javascript
// MongoDB
db.books.find()
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
-- PostgreSQL
select * from "books"
```

```javascript
// MongoDB
db.books.find()
```


### Schemas (SQL Only)

You can specify a schema to be used as a prefix of the table name.

**Example**

```javascript
{
  select: '*',
  from: { table: 'books', schema: 'public' }
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "public"."books"
```


### Distinct

Allows the ability to select `distinct` values.

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
-- PostgreSQL
select distinct "firstName", "lastName" from "customers"
```

```javascript
// MongoDB
db.customers.aggregate([{"$group": {"_id": { firstName: "$firstName", lastName: "$lastName" }}}]);
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
-- PostgreSQL
select "id" from "books" where "firstName" = 'Test' and "lastName" = 'User'
```

```javascript
// MongoDB
db.users.find({ firstName: 'Test', lastName: 'User' }, { _id: 1 });
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
-- PostgreSQL
select * from "users" where "votes" > '100'
```

```javascript
// MongoDB
db.users.find({ votes: { $gt: 100 }});
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
-- PostgreSQL
select * from "users" where ("id" = '1' or "id" > '10') or "name" = 'Tester'
```

```javascript
// MongoDB
db.users.find({$or: [
  {
    $or: [
      { _id: 1 },
      { _id: { $gt: 10 } }
    ]
  },
  {
    name: 'Tester'
  }
]});
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
-- PostgreSQL
select * from "accounts" where "id" IN (select "id" from "users" where "votes" > '100' and "status" = 'active' or "name" = 'John')
```

```javascript
// MongoDB
var users = db.users.find({
  $and: [
    { votes: { $gt: 100 } },
    {
      $or: [
        { status: 'active' },
        { name: 'John' }
      ]
    }
  ]
}, { _id: 0 });
db.accounts.find({ _id: { $in: users }});
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
-- PostgreSQL
select "id" from "users" where not "firstName" = 'Test' and not "lastName" = 'User'
```

```javascript
// MongoDB
db.users.find({
  $and: [
    { firstName: { $ne: 'Test' } },
    { lastName: { $ne: 'User' } }
  ]
}, { _id: 1 });
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
-- PostgreSQL
select * from "users" where not ("id" = '1' or not "id" > '10') or not "name" = 'Tester'
```

```javascript
// MongoDB
db.users.find({
  $or: [
    {
      $not: {
        $or: [
          { _id: 1 },
          { _id: { $gt: 100 } }
        ]
      }
    },
    {
      name: { $ne: 'Tester' }
    }
  ]
});
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
-- PostgreSQL
select * from "users" where not "votes" > '100'
```

```javascript
// MongoDB
db.users.find({
  $not: {
    votes: { $gt: 100 }
  }
});
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
-- PostgreSQL
select "name" from "users" where "id" in ('1', '2', '3') or "id" in ('4', '5', '6')
```

```javascript
// MongoDB
db.users.find({
  $or: [
    { _id: { $in: [1,2,3] } },
    { _id: { $in: [4,5,6] } }
  ]
}, { name: 1 });
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
-- PostgreSQL
select "name" from "users" where "accountId" in (select "id" from "accounts")
```

```javascript
// MongoDB
var accountIds = db.accounts.find({}, { _id: 1 });
db.users.find({ accountId: { $in: accountIds } }, { name: 1 });
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
-- PostgreSQL
select * from "users" where "name" = 'John' or ("votes" > '100' and "title" not 'Admin')
```

```javascript
// MongoDB
db.users.find({
  $or: [
    { name: 'John' },
    {
      $and: [
        { votes: { $gt: 100 } },
        { title: { $ne: 'Admin' } }
      ]
    }
  ]
});
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
-- PostgreSQL
select * from "users" where "id" not in ('1','2','3')
```

```javascript
// MongoDB
db.users.find({ _id: { $nin: [1,2,3] } });
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
-- PostgreSQL
select * from "users" where "name" like '%Test%' or "id" not in ('1','2','3')
```

```javascript
// MongoDB
db.users.find({
  $or: [
    { name: { like: /Test/ } },
    { _id: { $nin: [1,2,3] } }
  ]
});
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
-- PostgreSQL
select * from "users" where "updatedAt" is null
```

```javascript
// MongoDB
db.users.find({ updatedAt: { $exists: false } });
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
-- PostgreSQL
select * from "users" where "updatedAt" is not null
```

```javascript
// MongoDB
db.users.find({ updatedAt: { $exists: true } });
```

## Where Exists

** Same as NOT NULL **


## Where Not Exists

** Same as NOT NULL **


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
-- PostgreSQL
select * from "users" where "votes" between '1' and '100'
```

```javascript
// MongoDB
db.users.find({ votes: { $gt: 1, $lt: 100 } });
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
-- PostgreSQL
select * from "users" where id = '1'
```


## Join Methods

Several methods are available for assisting with joins. If using a nosql database
such as MongoDB, you have the option to use "populate" instead. This "inflates"
the return values, giving you less performant queries but still allows for querying
the values.

### Join

Allows joins between collections to be specified.

**Example:**

```javascript
{
  select: ['users.id', 'contacts.phone'],
  from: 'users',
  join: [
    {
      from: 'contacts',
      on: {
        users: 'id',
        contacts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"
```


### Grouped Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  join: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    ]
  }
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Raw Join Values

If you need to use a literal value in the join you can use the `raw` syntax.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  join: [
    {
      from: 'accounts',
      on: {
        accounts: 'type',
        raw: ['?', ['admin']]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" inner join "accounts" on "accounts"."type" = 'admin'
```


### Inner Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  innerJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" inner join "accounts" on "users"."id" = "accounts"."user_id"
```

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  innerJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ],
  where: {
    accounts: {
      value: { '>': 1000 }
    },
    users: {
      age: { '>': 18 }
    }
  }
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" inner join "accounts" on "users"."id" = "accounts"."user_id" where "accounts"."value" > 1000 and "users"."age" > 18;
```


### Grouped Inner Joins

```javascript
{
  select: '*',
  from: 'users',
  innerJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Left Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  leftJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" left join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Left Joins

```javascript
{
  select: '*',
  from: 'users',
  leftJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" left join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Left Outer Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  leftOuterJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" left outer join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Left Outer Joins

```javascript
{
  select: '*',
  from: 'users',
  leftOuterJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" left outer join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Right Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  rightJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" right join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Right Joins

```javascript
{
  select: '*',
  from: 'users',
  rightJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" right join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Right Outer Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  rightOuterJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" right outer join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Right Outer Joins

```javascript
{
  select: '*',
  from: 'users',
  rightOuterJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" right outer join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Outer Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  outerJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" outer join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Outer Joins

```javascript
{
  select: '*',
  from: 'users',
  outerJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" outer join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Full Outer Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  fullOuterJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" full outer join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Full Outer Joins

```javascript
{
  select: '*',
  from: 'users',
  fullOuterJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" full outer join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```


### Cross Joins

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  crossJoin: [
    {
      from: 'accounts',
      on: {
        users: 'id',
        accounts: 'user_id'
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" cross join "accounts" on "users"."id" = "accounts"."user_id"
```


### Grouped Cross Joins

```javascript
{
  select: '*',
  from: 'users',
  crossJoin: [
    {
      from: 'accounts',
      on: {
        or: [
          {
            accounts: 'id',
            users: 'account_id'
          },
          {
            accounts: 'owner_id',
            users: 'id'
          }
        ]
      }
    }
  ]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" cross join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"
```

## Populates

Populate is the nosql equivalent of a join. It performs multiple queries to get
the data requested. It's similar to the `.populate()` method in [Mongoose](http://mongoosejs.com/docs/populate.html).

### Populate

**TODO**

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
-- PostgreSQL
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
-- PostgreSQL
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
-- PostgreSQL
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
-- PostgreSQL
select * from "table" order by col NULLS LAST DESC
```


## Having

Adds a `having` clause to the query.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  groupBy: ['count'],
  orderBy: [{ name: 'desc' }],
  having: [{ count: { '>': 100 }}]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" group by "count" having "count" > '100' order by "name" desc
```


### Having Raw

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  groupBy: ['count'],
  orderBy: [{ name: 'desc' }],
  having: [{ raw: ['count > ?', [100]] }]
}
```

**Outputs:**

```sql
-- PostgreSQL
select * from "users" group by "count" having count > '100' order by "name" desc
```

## Offset

Adds an `offset` clause to the query.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  offset: 10
}
```

```sql
-- PostgreSQL
select * from "users" offset '10'
```


## Limit

Adds a `limit` clause to the query.

**Example:**

```javascript
{
  select: '*',
  from: 'users',
  limit: 10,
  offset: 30
}
```

```sql
-- PostgreSQL
select * from "users" limit '10' offset '30'
```


## Union

**NOT SUPPORTED**


## Union All

**NOT SUPPORTED**


## Insert

Creates an `insert` query taking either an object of values or an array of objects
representing a set of records that will be inserted in a single query.

**Example:**

```javascript
{
  insert: {
    title: 'Slaughterhouse Five'
  },
  into: 'books'
}
```

**Outputs:**

```sql
-- PostgreSQL
insert into "books" ("title") values ('Slaughterhouse Five')
```


**Example:**

```javascript
{
  insert: [{x: 20}, {y: 30},  {x: 10, y: 20}],
  into: 'coords'
}
```

**Outputs:**

```sql
-- PostgreSQL
insert into "coords" ("x", "y") values ('20', NULL), (NULL, '30'), ('10', '20')
```


**Example:**

```javascript
{
  insert: [{x: 20}, {y: 30},  {x: 10, y: 20}],
  into: 'coords'
}
```

**Outputs:**

```sql
-- PostgreSQL
insert into "coords" ("x", "y") values ('20', NULL), (NULL, '30'), ('10', '20')
```


## Update

Creates an `update` query. Any reasonable and valid `where` criteria may be used
in the query.

**Example:**

```javascript
{
  update: {
    status: 'archived'
  },
  where: {
    publishedDate: { '>': 2000 }
  },
  using: 'books'
}
```

**Outputs:**

```sql
-- PostgreSQL
update "books" set "status" = 'archived' where "published_date" < '2000'
```


## Delete

Aliased to `del` as `delete` is a reserved word in javascript. Deletes one or more
rows based on matching criteria.

**Example:**

```javascript
{
  del: true,
  from: 'accounts',
  where: {
    activated: false
  }
}
```

**Outputs:**

```sql
-- PostgreSQL
delete from "accounts" where "activated" = 'false'
```


## Count

Performs a count on the specified attribute.

**Example:**

```javascript
{
  select: {
    count: 'active'
  },
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select count("active") from "users"
```

## Min

Gets the minimum value for the specified attribute.

**Example:**

```javascript
{
  select: {
    min: 'age'
  },
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select min("age") from "users"
```

**Example:**

```javascript
{
  select: [{ raw: ['min(age) as a'] }],
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select min("age") as "a" from "users"
```


## Max

Gets the maximum value for the specified attribute.

**Example:**

```javascript
{
  select: {
    max: 'age'
  },
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select max("age") from "users"
```

**Example:**

```javascript
{
  select: [{ raw: ['max(age) as a'] }],
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select max("age") as "a" from "users"
```


## Sum

Retrieve the sum of the values of a given attribute.

**Example:**

```javascript
{
  select: {
    sum: 'products'
  },
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select sum("products") from "users"
```

**Example:**

```javascript
{
  select: [{ raw: ['sum(products) as p'] }],
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select sum("products") as "p" from "users"
```


## Avg

Retrieve the average of the values of a given attribute.

**Example:**

```javascript
{
  select: {
    avg: 'age'
  },
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select avg("age") from "users"
```

**Example:**

```javascript
{
  select: [{ raw: ['avg(age) as a'] }],
  from: 'users'
}
```

**Outputs:**

```sql
-- PostgreSQL
select avg("age") as "a" from "users"
```
