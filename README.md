# GraphQL Playground

A modern, interactive GraphQL playground built with Monaco Editor for syntax highlighting and autocompletion.

## Features

- **Interactive Query Editor**: Monaco Editor with GraphQL syntax highlighting and autocompletion
- **Real-time Query Execution**: Execute GraphQL queries against sample data
- **Sample Queries**: Pre-built queries to explore the GraphQL schema
- **Sample Data Viewer**: Browse the underlying users and posts data
- **Deep Linking**: Share queries via URL parameters
- **Mobile Responsive**: Works great on desktop and mobile devices

## Deep Linking & URL Sharing

The playground now supports deep linking through URL parameters, making it easy to share GraphQL queries and demonstrate how GraphQL works:

### How it works:
- **Automatic URL Updates**: When you type or load a query, the URL automatically updates to include the query
- **Auto-Execution**: When you visit a URL with a query parameter, the query loads and executes automatically
- **Direct Access**: Visit URLs with query parameters to load and run queries directly

### Example URLs:

**Basic Users Query:**
```
http://localhost:8000/?query=query%20%7B%0A%20%20users%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%20%20email%0A%20%20%7D%0A%7D
```

**Specific User Query:**
```
http://localhost:8000/?query=query%20GetUserById%20%7B%0A%20%20user(id%3A%20%225%22)%20%7B%0A%20%20%20%20id%0A%20%20%20%20name%0A%20%20%20%20email%0A%20%20%7D%0A%7D
```

**Posts with Authors:**
```
http://localhost:8000/?query=query%20GetPostsWithAuthors%20%7B%0A%20%20posts(limit%3A%205)%20%7B%0A%20%20%20%20id%0A%20%20%20%20title%0A%20%20%20%20author%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20email%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D
```

### Benefits for Learning GraphQL:
1. **Share Examples**: Easily share specific queries with students or colleagues
2. **Documentation**: Include links to specific queries in documentation
3. **Demonstrations**: Show exactly how GraphQL queries work with real examples
4. **Bookmarking**: Bookmark complex queries for later use

## Getting Started

1. Open `index.html` in a web browser or serve it from a local web server
2. Try the sample queries from the dropdown menu
3. Modify queries in the editor and see real-time results
4. Copy the URL from your browser's address bar to share queries (they're automatically saved to URL)
5. Visit the Sample Data tab to explore the underlying data structure

## GraphQL Schema

The playground includes a sample schema with:
- **Users**: 50 sample users with id, name, and email
- **Posts**: ~200 sample posts with id, title, content, and author relationships
- **Queries**: Support for fetching individual items, lists, pagination, and relationships

## Technology Stack

- **Monaco Editor**: Provides the rich editing experience with GraphQL syntax highlighting
- **GraphQL.js**: Handles query parsing and execution
- **Tailwind CSS**: Modern, responsive styling
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility

## Local Development

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the directory
cd gql-playground

# Serve the files (any HTTP server will work)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

## Contributing

Feel free to contribute by:
- Adding new sample queries
- Improving the UI/UX
- Enhancing GraphQL schema features
- Adding new data types or relationships

## License

MIT License - see LICENSE file for details