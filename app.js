// Global variables
let queryEditor = null;
let resultEditor = null;
let graphQLSchema = null;

// Initialize the app immediately
async function initializeApp() {
    try {
        updateStatus("Initializing GraphQL...");
        
        // Check if GraphQL is available
        if (!window.GraphQLPlayground) {
            throw new Error("GraphQL bundle not loaded. Please check bundle.js");
        }
        
        updateStatus("Setting up schema...");
        
        // Get the schema from the bundle
        graphQLSchema = window.GraphQLPlayground.graphQLSchema;
        
        if (!graphQLSchema) {
            throw new Error("GraphQL schema not available");
        }
        
        updateStatus("Loading Monaco Editor...");
        await initializeMonaco();
        
        setupUI();
        showMainApp();
        updateStatus("GraphQL Playground Ready!");
        
    } catch (error) {
        console.error("Initialization error:", error);
        showError("Failed to initialize: " + error.message);
        
        // Fallback: show retry option
        setTimeout(() => {
            document.getElementById("loadingScreen").innerHTML = `
                <div class="text-center">
                    <div class="text-red-400 mb-4">❌ Failed to load GraphQL Playground</div>
                    <div class="text-gray-400 mb-4">${error.message}</div>
                    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">
                        Retry
                    </button>
                </div>
            `;
        }, 1000);
    }
}

// Initialize Monaco Editor
async function initializeMonaco() {
    return new Promise((resolve, reject) => {
        // Check if require is available (Monaco loader)
        if (typeof require === 'undefined') {
            reject(new Error("Monaco Editor loader not available"));
            return;
        }
        
        require.config({ 
            paths: { 
                vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs" 
            },
            onError: function(err) {
                reject(new Error("Failed to load Monaco Editor: " + err.message));
            }
        });
        
        require(["vs/editor/editor.main"], function() {
            // Register GraphQL language
            monaco.languages.register({ id: "graphql" });
            
            // Configure GraphQL syntax highlighting
            monaco.languages.setMonarchTokensProvider("graphql", {
                // Define keywords for syntax highlighting
                keywords: [
                    "query", "mutation", "subscription", "fragment", "on",
                    "type", "interface", "union", "enum", "input", "scalar",
                    "schema", "directive", "extend"
                ],
                
                tokenizer: {
                    root: [
                            // Keywords
                            [/[a-z_$][\w$]*/, {
                                cases: {
                                    "@keywords": "keyword",
                                    "@default": "identifier"
                                }
                            }],
                            
                            // Strings
                            [/".*?"/, "string"],
                            
                            // Comments
                            [/#.*$/, "comment"],
                            
                            // Brackets and operators
                            [/[{}()\[\]]/, "delimiter"],
                            [/[@:]/, "annotation"],
                            
                            // Numbers
                            [/\d+/, "number"],
                            
                            // Whitespace
                            [/\s+/, "white"]
                        ]
                }
            });
            
            // Set language configuration
            monaco.languages.setLanguageConfiguration("graphql", {
                comments: {
                    lineComment: "#"
                },
                brackets: [
                    ["{", "}"],
                    ["[", "]"],
                    ["(", ")"]
                ],
                autoClosingPairs: [
                    { open: "{", close: "}" },
                    { open: "[", close: "]" },
                    { open: "(", close: ")" },
                    { open: "\"", close: "\"", notIn: ["string"] }
                ]
            });
            
            // Create editors
            queryEditor = monaco.editor.create(document.getElementById("queryEditor"), {
                value: `query {
  users {
    id
    name
    email
  }
}`,
                language: "graphql",
                theme: "vs-dark",
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on"
            });
            
            resultEditor = monaco.editor.create(document.getElementById("resultEditor"), {
                value: "// Click Run Query to see results",
                language: "json",
                theme: "vs-dark",
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: true,
                wordWrap: "on"
            });
            
            // Set up completions
            monaco.languages.registerCompletionItemProvider("graphql", {
                provideCompletionItems: (model, position) => {
                    const suggestions = [
                        { label: "query", kind: monaco.languages.CompletionItemKind.Keyword, detail: "GraphQL Query", insertText: "query {\n  \n}" },
                        { label: "mutation", kind: monaco.languages.CompletionItemKind.Keyword, detail: "GraphQL Mutation", insertText: "mutation {\n  \n}" },
                        { label: "users", kind: monaco.languages.CompletionItemKind.Field, detail: "[User]", insertText: "users" },
                        { label: "posts", kind: monaco.languages.CompletionItemKind.Field, detail: "[Post]", insertText: "posts" },
                        { label: "user", kind: monaco.languages.CompletionItemKind.Field, detail: "User", insertText: "user(id: \"\")" },
                        { label: "post", kind: monaco.languages.CompletionItemKind.Field, detail: "Post", insertText: "post(id: \"\")" },
                        { label: "id", kind: monaco.languages.CompletionItemKind.Field, detail: "String", insertText: "id" },
                        { label: "name", kind: monaco.languages.CompletionItemKind.Field, detail: "String", insertText: "name" },
                        { label: "email", kind: monaco.languages.CompletionItemKind.Field, detail: "String", insertText: "email" },
                        { label: "title", kind: monaco.languages.CompletionItemKind.Field, detail: "String", insertText: "title" },
                        { label: "content", kind: monaco.languages.CompletionItemKind.Field, detail: "String", insertText: "content" },
                        { label: "author", kind: monaco.languages.CompletionItemKind.Field, detail: "User", insertText: "author" }
                    ];
                    
                    return { suggestions: suggestions };
                }
            });
            
            resolve();
        }, function(err) {
            reject(new Error("Monaco Editor module loading failed: " + (err.message || err)));
        });
    });
}

// Set up UI event handlers
function setupUI() {
    // Run query button
    document.getElementById("runQueryBtn").addEventListener("click", runQuery);
    
    // Sample queries dropdown
    document.getElementById("samplesDropdown").addEventListener("click", toggleSamplesDropdown);
    
    // Tab switching
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#samplesDropdown") && !e.target.closest("#samplesMenu")) {
            document.getElementById("samplesMenu").classList.add("hidden");
        }
    });
    
    // Populate sample queries
    populateSampleQueries();
}

// Run GraphQL query
async function runQuery() {
    const runBtn = document.getElementById("runQueryBtn");
    runBtn.disabled = true;
    runBtn.textContent = "Running...";
    
    try {
        const query = queryEditor.getValue();
        
        updateQueryStatus("Executing query...");
        
        if (!window.GraphQLPlayground || !window.GraphQLPlayground.executeQuery) {
            throw new Error("GraphQL execution function not available");
        }
        
        const result = await window.GraphQLPlayground.executeQuery(query);
        
        const resultText = JSON.stringify(result, null, 2);
        resultEditor.setValue(resultText);
        
        updateQueryStatus("Query executed successfully");
        
    } catch (error) {
        console.error("Query error:", error);
        resultEditor.setValue(`Error: ${error.message}`);
        updateQueryStatus("Query failed");
    }
    
    runBtn.disabled = false;
    runBtn.textContent = " Run Query";
}



// Toggle sample queries dropdown
function toggleSamplesDropdown() {
    const menu = document.getElementById("samplesMenu");
    menu.classList.toggle("hidden");
}

// Global variable to store the last query
let lastQuery = `query {
  users {
    id
    name
    email
  }
}`;

// Switch between tabs
function switchTab(tabName) {
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    
    if (tabName === "docs") {
        // Save current query before showing docs
        lastQuery = queryEditor.getValue();
        showDocs();
    } else if (tabName === "query") {
        // Restore the last query when switching back
        queryEditor.setValue(lastQuery);
    }
}

// Show documentation
function showDocs() {
    queryEditor.setValue(`# GraphQL Documentation
#
# This playground demonstrates GraphQL with sample data
#
# Available queries:
# - users: Get all users
# - posts: Get all posts with authors
# - user(id: "1"): Get specific user
# - post(id: "1"): Get specific post with author
#
# Example query:
query {
  users {
    id
    name
    email
  }
  
  posts {
    id
    title
    author {
      name
    }
  }
}`);
}

// Populate sample queries dropdown
function populateSampleQueries() {
    const samples = [
        {
            title: "Get All Users",
            description: "Fetch all 50 users with their details",
            query: `query {
  users {
    id
    name
    email
  }
}`
        },
        {
            title: "Get First 10 Users",
            description: "Limit results for better performance",
            query: `query GetFirstTenUsers {
  users(limit: 10) {
    id
    name
    email
  }
}`
        },
        {
            title: "Get All Posts",
            description: "Fetch all ~200 posts with their authors",
            query: `query {
  posts {
    id
    title
    content
    author {
      name
      email
    }
  }
}`
        },
        {
            title: "Get Posts with Authors",
            description: "Fetch posts with full author information",
            query: `query GetPostsWithAuthors {
  posts {
    id
    title
    author {
      id
      name
      email
    }
  }
}`
        },
        {
            title: "Get Specific User",
            description: "Fetch a user by ID (try different IDs 1-50)",
            query: `query GetUserById {
  user(id: "5") {
    id
    name
    email
  }
}`
        },
        {
            title: "Get Specific Post",
            description: "Fetch a post with its author details",
            query: `query GetPostById {
  post(id: "10") {
    id
    title
    content
    author {
      id
      name
      email
    }
  }
}`
        },
        {
            title: "Users and Posts Overview",
            description: "Get basic info about users and their posts",
            query: `query Overview {
  users {
    id
    name
  }
  
  posts {
    id
    title
    author {
      name
    }
  }
}`
        },
        {
            title: "Just User Names",
            description: "Simple query to get just names",
            query: `query GetUserNames {
  users {
    name
  }
}`
        },
        {
            title: "Just Post Titles",
            description: "Quick overview of all post titles",
            query: `query GetPostTitles {
  posts {
    title
  }
}`
        },
        {
            title: "User with ID and Email",
            description: "Test different user IDs",
            query: `query GetUserInfo {
  user(id: "25") {
    name
    email
  }
}`
        },
        {
            title: "Get First 5 Posts",
            description: "Limit posts to first 5 results",
            query: `query GetFirstFivePosts {
  posts(limit: 5) {
    id
    title
    author {
      name
    }
  }
}`
        },
        {
            title: "Get Users 11-20",
            description: "Pagination with offset and limit",
            query: `query GetUsersPage2 {
  users(offset: 10, limit: 10) {
    id
    name
    email
  }
}`
        },
        {
            title: "Get Posts 21-30",
            description: "Get a specific page of posts",
            query: `query GetPostsPage3 {
  posts(offset: 20, limit: 10) {
    id
    title
    author {
      name
    }
  }
}`
        }
    ];
    
    const container = document.getElementById("samplesMenuList");
    
    samples.forEach(sample => {
        const button = document.createElement("button");
        button.className = "dropdown-item";
        button.innerHTML = `
            <div class="dropdown-title">${sample.title}</div>
            <div class="dropdown-description">${sample.description}</div>
        `;
        
        button.addEventListener("click", () => {
            queryEditor.setValue(sample.query);
            lastQuery = sample.query; // Save the loaded query
            updateQueryStatus(`Loaded: ${sample.title}`);
            document.getElementById("samplesMenu").classList.add("hidden");
        });
        
        container.appendChild(button);
    });
}

// Update status text
function updateStatus(text) {
    document.getElementById("statusText").textContent = text;
}

// Update query status
function updateQueryStatus(text) {
    document.getElementById("queryStatus").textContent = text;
}

// Show main application
function showMainApp() {
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
}

// Show error message
function showError(message) {
    document.getElementById("loadingScreen").classList.add("hidden");
    const errorDiv = document.getElementById("errorDisplay");
    document.getElementById("errorText").textContent = message;
    errorDiv.classList.remove("hidden");
}

// Start the app when the page loads
window.addEventListener("load", () => {
    setTimeout(initializeApp, 100); // Short delay to ensure bundle loads
});

// Handle window resize
window.addEventListener("resize", () => {
    if (queryEditor) queryEditor.layout();
    if (resultEditor) resultEditor.layout();
}); 