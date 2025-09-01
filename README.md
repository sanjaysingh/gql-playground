# GraphQL Playground

A sleek browser-based GraphQL playground with Monaco Editor integration. Query your GraphQL schemas with syntax highlighting, auto-completion, and a beautiful dark theme UI.

## 🚀 Quick Start

Just open `index.html` in your browser and start querying!

## 📁 Project Structure

```
gql-playground/
├── index.html              # Main playground UI
├── app.js                  # UI initialization logic
├── styles.css              # All the pretty styles
└── libs/                   # GraphQL library and app logic
    ├── app-gql.js          # GraphQL application logic & schema
    ├── gql-lib.js          # GraphQL library wrapper
    ├── users.json          # Sample user data
    ├── posts.json          # Sample blog post data
    ├── package.json        # Dependencies & build scripts
    ├── package-lock.json   # Dependency lock file
    └── runtime/            # Compiled bundles
        ├── app-gql-bundle.js     # Bundled application logic
        └── gql-lib-bundle.js     # Bundled GraphQL library
```

## 🔧 Building the Application

The application uses a dual-bundle system for better organization:

```bash
cd libs
npm install        # Install dependencies (if needed)
npm run build      # Builds both bundles
```

### Individual Build Commands

- **GraphQL Library Bundle:** `npm run build:graphql` - Creates `runtime/gql-lib-bundle.js`
- **Application Logic Bundle:** `npm run build:app` - Creates `runtime/app-gql-bundle.js`

The build process uses Browserify to bundle:
- **GraphQL library** (`gql-lib.js`) - Exposes GraphQL.js functionality to the browser
- **Application logic** (`app-gql.js`) - Contains the GraphQL schema, resolvers, and query execution

## 📦 Architecture Overview

### Separation of Concerns

The refactored codebase follows a clean separation:

1. **GraphQL Library Layer** (`gql-lib.js`)
   - Wraps the GraphQL.js library for browser use
   - Exposes only necessary GraphQL functions
   - Bundled into `runtime/gql-lib-bundle.js`

2. **Application Logic Layer** (`app-gql.js`)
   - Defines GraphQL schema (User, Post types)
   - Implements resolvers for queries
   - Loads sample data from JSON files
   - Bundled into `runtime/app-gql-bundle.js`

3. **UI Layer** (`index.html`, `app.js`, `styles.css`)
   - Monaco Editor integration
   - User interface and interactions
   - Loads the pre-built bundles

### Data Flow

```
Browser → UI (app.js) → Application Logic (app-gql-bundle.js) → GraphQL Library (gql-lib-bundle.js)
```

## 📦 Upgrading GraphQL Library

Want to upgrade to a newer GraphQL version? Here's how:

1. **Update the package version:**
   ```bash
   cd libs
   npm install graphql@latest  # Or specify version like graphql@17.0.0
   ```

2. **Rebuild the bundles:**
   ```bash
   npm run build
   ```

3. **Test it out:**
   - Open `index.html` and make sure everything still works
   - Try running a few queries to verify compatibility

## ✨ Features

- **Monaco Editor** - Same editor used in VS Code
- **GraphQL Syntax Highlighting** - Pretty colors for your queries
- **Smart Auto-completion** - Ctrl+Space for field suggestions
- **Sample Queries** - Click the dropdown for example queries
- **Dark Theme** - Easy on the eyes
- **Real-time Query Execution** - See results instantly
- **Error Handling** - Helpful error messages when things go wrong

## 🎮 Using the Playground

1. **Write Query** - Type your GraphQL query in the left panel
2. **Run Query** - Click the green "Run Query" button
3. **View Results** - See formatted JSON results on the right
4. **Try Samples** - Use the "Sample Queries" dropdown for examples
5. **Browse Docs** - Switch to "Docs" tab for GraphQL schema documentation

## 🛠️ Sample Data

The playground comes with rich sample data:

### Users (50 users)
- **Fields:** id, name, email
- **Example:** Alice Anderson, Bob Brown, Charlie Clark, etc.

### Posts (74 blog posts)
- **Fields:** id, title, content, author (linked to users)
- **Topics:** GraphQL, JavaScript, React, Node.js, databases, DevOps, and more
- **Authors:** Posts are distributed across the first 30 users

### Sample Queries

**Get all users:**
```graphql
query {
  users {
    id
    name
    email
  }
}
```

**Get posts with authors:**
```graphql
query {
  posts(limit: 5) {
    title
    content
    author {
      name
      email
    }
  }
}
```

**Get specific user and their posts:**
```graphql
query {
  user(id: "1") {
    name
    email
  }
  
  posts(limit: 3) {
    title
    author {
      name
    }
  }
}
```

**Pagination example:**
```graphql
query {
  users(limit: 10, offset: 5) {
    id
    name
  }
}
```

## 🔍 Development Notes

- **GraphQL.js version:** v16.8.1
- **Build tool:** Browserify v17.0.0
- **Monaco Editor:** Loaded from CDN (v0.44.0)
- **Styling:** Tailwind CSS + custom GraphQL-specific styles
- **Sample data:** 50 users + 74 posts with realistic relationships

### File Organization

- **Source files:** `libs/app-gql.js`, `libs/gql-lib.js`
- **Data files:** `libs/users.json`, `libs/posts.json`
- **Build output:** `libs/runtime/` directory
- **Dependencies:** Managed via `libs/package.json`