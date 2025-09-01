const graphqlLib = require('graphql');

// Expose only the GraphQL library to the browser
window.GraphQLLib = {
    GraphQLSchema: graphqlLib.GraphQLSchema,
    GraphQLObjectType: graphqlLib.GraphQLObjectType,
    GraphQLString: graphqlLib.GraphQLString,
    GraphQLList: graphqlLib.GraphQLList,
    GraphQLNonNull: graphqlLib.GraphQLNonNull,
    GraphQLInt: graphqlLib.GraphQLInt,
    graphql: graphqlLib.graphql
}; 