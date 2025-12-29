/**
 * GraphQL Gateway - Main Export
 * Combines all type definitions and resolvers
 */

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  typeDefs,
  resolvers
};
