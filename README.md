# GraphQL Playground

A sleek browser-based GraphQL playground with Monaco Editor integration. Query your GraphQL schemas with syntax highlighting, auto-completion, and a beautiful dark theme UI.

## 🚀 Quick Start

Just open `index.html` in your browser and start querying!

## 📁 Project Structure

```
graphql/
├── index.html              # Main playground UI
├── styles.css              # All the pretty styles
├── app.js                  # Application logic
└── libs/                   # GraphQL library stuff
    ├── bundle-graphql-16.8.1.js  # Compiled GraphQL bundle
    ├── main.js             # GraphQL source code
    ├── package.json        # Dependencies & build scripts
    └── node_modules/       # NPM packages
```

## 🔧 Building the GraphQL Library

If you need to rebuild the GraphQL bundle (e.g., after modifying `main.js`):

```bash
cd libs
npm install        # Install dependencies (if needed)
npm run build      # Builds bundle-graphql-16.8.1.js
```

That's it! The bundle gets automatically generated and the UI will pick it up.

## 📦 Upgrading GraphQL Library

Want to upgrade to a newer GraphQL version? Here's how:

1. **Update the package version:**
   ```bash
   cd libs
   npm install graphql@latest  # Or specify version like graphql@17.0.0
   ```

2. **Update the bundle filename:**
   - Check the new version: `npm list graphql`
   - Edit `libs/package.json` and update the build scripts:
     ```json
     "scripts": {
       "build": "browserify main.js -o bundle-graphql-17.0.0.js"
     }
     ```

3. **Rebuild the bundle:**
   ```bash
   npm run build
   ```

4. **Update the HTML reference:**
   - Edit `index.html` and change the script src:
     ```html
     <script src="libs/bundle-graphql-17.0.0.js"></script>
     ```

5. **Test it out:**
   - Open `index.html` and make sure everything still works
   - Try running a few queries to verify compatibility

**Pro tip:** Keep the old bundle file around just in case you need to rollback!

## ✨ Features

- **Monaco Editor** - Same editor used in VS Code
- **GraphQL Syntax Highlighting** - Pretty colors for your queries
- **Smart Auto-completion** - Ctrl+Space for field suggestions
- **Example Queries** - Click the sidebar examples to get started
- **Dark Theme** - Easy on the eyes
- **Real-time Query Execution** - See results instantly
- **Error Handling** - Helpful error messages when things go wrong

## 🎮 Using the Playground

1. **Write Query** - Type your GraphQL query in the left panel
2. **Run Query** - Click the green "Run Query" button
3. **View Results** - See formatted JSON results on the right
4. **Try Examples** - Click any example in the right sidebar
5. **Browse Docs** - Switch to "Docs" tab for GraphQL documentation

## 🛠️ Sample Data

The playground comes with built-in sample data:
- **Users** - A few test users with id, name, email
- **Posts** - Blog posts with titles, content, and authors
- **Relationships** - Posts are linked to their authors

Try this query to get started:
```graphql
query {
  users {
    id
    name
    email
  }
  
  posts {
    title
    author {
      name
    }
  }
}
```

## 🔍 Development Notes

- GraphQL library is built with **Browserify** 
- Uses **GraphQL.js v16.8.1**
- Monaco Editor loaded from CDN
- Tailwind CSS for base styling
- Custom CSS for GraphQL-specific components

## 🎯 Need Help?

The playground is pretty self-explanatory, but if you get stuck:
- Check the browser console for error messages
- Try the example queries first
- Make sure your GraphQL syntax is correct
- Refresh the page if Monaco Editor doesn't load
