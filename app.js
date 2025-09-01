// Global variables
let queryEditor = null;
let resultEditor = null;
let graphQLSchema = null;

// URL Parameter handling for deep linking
function getQueryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const decodedQuery = query ? decodeURIComponent(query) : null;
    return decodedQuery;
}

function updateURLWithQuery(query) {
    if (!query || query.trim() === '') {
        // Remove query parameter if query is empty
        const url = new URL(window.location);
        url.searchParams.delete('query');
        window.history.replaceState({}, '', url);
        return;
    }
    
    const url = new URL(window.location);
    url.searchParams.set('query', encodeURIComponent(query));
    window.history.replaceState({}, '', url);
}



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
        
        // Initialize the query tab as active
        switchTab("query");
        
        // Load query from URL if present and auto-execute
        const urlQuery = getQueryFromURL();
        if (urlQuery) {
            queryEditor.setValue(urlQuery);
            updateQueryStatus("Loaded query from URL");
            // Auto-execute the query after a short delay to ensure UI is ready
            setTimeout(() => {
                runQuery();
            }, 500);
        }
        
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
    
    // Set up query editor change listener (with debounce for URL updates)
    // This will be called after Monaco editor is initialized
    if (queryEditor) {
        setupQueryEditorChangeListener();
    }
}

// Run GraphQL query
async function runQuery() {
    const runBtn = document.getElementById("runQueryBtn");
    runBtn.disabled = true;
    runBtn.textContent = "Running...";
    
    // Switch to query tab if not already there
    switchTab("query");
    
    try {
        const query = queryEditor.getValue();
        
        // Update URL with current query for deep linking
        updateURLWithQuery(query);
        
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





// Set up query editor change listener with debounce
function setupQueryEditorChangeListener() {
    let debounceTimeout;
    
    if (queryEditor) {
        queryEditor.onDidChangeModelContent(() => {
            // Clear previous timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            
            // Set new timeout to update URL after 1 second of no changes
            debounceTimeout = setTimeout(() => {
                const query = queryEditor.getValue();
                updateURLWithQuery(query);
            }, 1000);
        });
    }
}

// Toggle sample queries dropdown
function toggleSamplesDropdown() {
    const menu = document.getElementById("samplesMenu");
    menu.classList.toggle("hidden");
}



// Switch between tabs
function switchTab(tabName) {
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    
    // Hide all tab content panels
    document.getElementById("queryEditor").style.display = "none";
    document.getElementById("dataPanel").classList.add("hidden");
    
    if (tabName === "data") {
        // Show sample data panel
        document.getElementById("dataPanel").classList.remove("hidden");
        populateSampleData();
    } else if (tabName === "query") {
        // Show query editor
        document.getElementById("queryEditor").style.display = "block";
    }
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
            updateQueryStatus(`Loaded: ${sample.title}`);
            document.getElementById("samplesMenu").classList.add("hidden");
            
            // Update URL with the sample query for deep linking
            updateURLWithQuery(sample.query);
            
            // Switch to query tab if not already there
            switchTab("query");
            
            // Auto-execute the sample query after a short delay
            setTimeout(() => {
                runQuery();
            }, 200);
        });
        
        container.appendChild(button);
    });
}

// Populate sample data in the data tab
function populateSampleData() {
    // Get sample data from the GraphQL playground
    if (window.GraphQLPlayground && window.GraphQLPlayground.sampleData) {
        const { users, posts } = window.GraphQLPlayground.sampleData;
        
        // Display users data
        const usersJson = document.getElementById("usersJson");
        usersJson.textContent = JSON.stringify(users, null, 2);
        
        // Display posts data
        const postsJson = document.getElementById("postsJson");
        postsJson.textContent = JSON.stringify(posts, null, 2);
    } else {
        // Fallback if sample data is not available
        document.getElementById("usersJson").textContent = "Sample data not available";
        document.getElementById("postsJson").textContent = "Sample data not available";
    }
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