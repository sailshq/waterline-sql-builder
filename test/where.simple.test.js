// var Test = require('./support/test-runner');
//
// describe('Query Generation ::', function() {
//   describe('Simple WHERE statements', function() {
//
//     it('should generate a where clause', function(done) {
//       Test({
//         flavor: 'postgresql',
//         query: {
//           select: ['id'],
//           where: {
//             firstName: 'Test',
//             lastName: 'User'
//           },
//           from: 'users'
//         },
//         outcome: 'select "id" from "users" where "firstName" = \'Test\' and "lastName" = \'User\''
//       }, done);
//     });
//
//     it('should generate a where clause when using operators', function(done) {
//       Test({
//         flavor: 'postgresql',
//         query: {
//           select: '*',
//           where: {
//             votes: { '>': 100 }
//           },
//           from: 'users'
//         },
//         outcome: 'select * from "users" where "votes" > \'100\''
//       }, done);
//     });
//
//     it('should generate a where clause when using multiple operators on a key', function(done) {
//       Test({
//         flavor: 'postgresql',
//         query: {
//           select: '*',
//           where: {
//             votes: { '>': 100, '<': 200 }
//           },
//           from: 'users'
//         },
//         outcome: 'select * from "users" where "votes" > \'100\' and "votes" < \'200\''
//       }, done);
//     });
//
//     it('should generate a where clause when using multiple columns and operators', function(done) {
//       Test({
//         flavor: 'postgresql',
//         query: {
//           select: '*',
//           where: {
//             votes: { '>': 100 },
//             age: { '<': 50 }
//           },
//           from: 'users'
//         },
//         outcome: 'select * from "users" where "votes" > \'100\' and "age" < \'50\''
//       }, done);
//     });
//
//   });
// });
