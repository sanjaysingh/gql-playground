const graphqlLib = require('graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt, graphql } = graphqlLib;

// Load static data from JSON files
const users = require('./users.json');
const posts = require('./posts.json');

const sampleData = { users, posts };
let graphQLSchema = null;
try {
    const UserType = new GraphQLObjectType({
        name: 'User',
        fields: {
            id: { type: GraphQLString },
            name: { type: GraphQLString },
            email: { type: GraphQLString }
        }
    });
    
    const PostType = new GraphQLObjectType({
        name: 'Post',
        fields: {
            id: { type: GraphQLString },
            title: { type: GraphQLString },
            content: { type: GraphQLString },
            author: {
                type: UserType,
                resolve: (post) => sampleData.users.find(u => u.id === post.author_id)
            }
        }
    });
    const QueryType = new GraphQLObjectType({
        name: 'Query',
        fields: {
            users: { 
                type: new GraphQLList(UserType), 
                args: {
                    limit: { type: GraphQLInt },
                    offset: { type: GraphQLInt }
                },
                resolve: (_, args) => {
                    const { limit, offset = 0 } = args;
                    let result = sampleData.users.slice(offset);
                    if (limit) {
                        result = result.slice(0, limit);
                    }
                    return result;
                }
            },
            posts: { 
                type: new GraphQLList(PostType), 
                args: {
                    limit: { type: GraphQLInt },
                    offset: { type: GraphQLInt }
                },
                resolve: (_, args) => {
                    const { limit, offset = 0 } = args;
                    let result = sampleData.posts.slice(offset);
                    if (limit) {
                        result = result.slice(0, limit);
                    }
                    return result;
                }
            },
            user: {
                type: UserType,
                args: { id: { type: new GraphQLNonNull(GraphQLString) } },
                resolve: (_, args) => sampleData.users.find(u => u.id === args.id)
            },
            post: {
                type: PostType,
                args: { id: { type: new GraphQLNonNull(GraphQLString) } },
                resolve: (_, args) => sampleData.posts.find(p => p.id === args.id)
            }
        }
    });
    
    graphQLSchema = new GraphQLSchema({ query: QueryType });
    
} catch (error) {
    console.error('Schema creation error:', error);
    graphQLSchema = null;
}
window.GraphQLPlayground = {
    graphql,
    graphQLSchema,
    sampleData,
    executeQuery: async function(queryString) {
        try {
            if (!this.graphQLSchema) throw new Error('Schema not available');
            const result = await this.graphql({ schema: this.graphQLSchema, source: queryString });
            return result;
        } catch (error) {
            console.error('Query execution error:', error);
            return { errors: [{ message: error.message }] };
        }
    }
};

