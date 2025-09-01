# Build Structure

This directory contains the separated GraphQL playground components:

## Files Structure

### Source Files
- `graphql-lib.js` - Exposes only the GraphQL library to the browser window
- `app-logic.js` - Contains the application-specific GraphQL schema and logic
- `users.json` - Sample user data
- `posts.json` - Sample post data

### Generated Bundles
- `graphql-bundle.js` - Contains only the GraphQL library (browserified)
- `app-bundle.js` - Contains only your application logic (browserified)

### Legacy Files (can be removed)
- `main.js` - Old combined source file
- `bundle-graphql-16.8.1.js` - Old combined bundle

## Benefits of Separation

1. **Clear separation of concerns**: Library code vs application code
2. **Independent updates**: You can update your app logic without touching the GraphQL library
3. **Better caching**: The GraphQL library bundle rarely changes, so browsers can cache it longer
4. **Smaller application bundle**: Your app-specific code is now much smaller (19KB vs 655KB)
5. **Development efficiency**: You can watch/rebuild just your app code during development

## Build Commands

- `npm run build` - Build both bundles
- `npm run build:graphql` - Build only the GraphQL library bundle
- `npm run build:app` - Build only the application logic bundle
- `npm run watch` - Watch both files for changes
- `npm run watch:graphql` - Watch only the GraphQL library file
- `npm run watch:app` - Watch only the application logic file

## Development Workflow

For development, you'll mostly be editing `app-logic.js` and can use:
```bash
npm run watch:app
```

This will automatically rebuild your application bundle when you make changes, without touching the GraphQL library bundle. 