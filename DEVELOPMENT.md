# ChainDB CLI Development Guide

This document provides instructions for developers working on the ChainDB CLI project.

## Setting Up the Development Environment

1. **Clone the repository**:

   ```bash
   git clone https://github.com/wpdas/chain-db.git
   cd chain-db
   ```

2. **Install dependencies**:
   ```bash
   cd chain-db-cli
   npm install
   ```

## Building and Testing the CLI

### Building the CLI

```bash
npm run build
```

This will compile the TypeScript code and make the CLI executable.

### Installing the CLI locally

To test the CLI as if it were installed globally, use:

```bash
# Link
npm link
# Remove previous link and link again
npm unlink -g chain-db-cli && npm link
```

This creates a symbolic link to your development version of the CLI.

## Testing the CLI

### 1. Start the ChainDB Server

First, you need to run the ChainDB server:

```bash
# From the root directory of the project
cargo run --bin chain-db
```

The server will start on port 2818 by default.

### 2. Configure the CLI

Configure the CLI to connect to your local server:

```bash
chaindb config --host http://localhost:2818
```

### 3. Create a Database

```bash
chaindb db create --name test_db --user admin --password yourpassword
```

### 4. Connect to the Database

```bash
chaindb db connect --name test_db --user admin --password yourpassword
```

This will authenticate you and save the token for subsequent requests.

### 5. Test Table Operations

#### Add data to a table:

```bash
chaindb table persist users --data '{"name": "John", "age": 30, "city": "New York"}'
```

#### Get current data (the last record stored in the table):

```bash
chaindb table get users
```

#### Update data:

```bash
chaindb table update users --data '{"name": "John", "age": 31, "city": "New York"}'
```

#### View change history:

```bash
chaindb table history users
```

#### Search with simple criteria:

```bash
chaindb table find users --criteria '{"name": "John"}'
```

#### Search with advanced criteria:

```bash
chaindb table find-advanced users --criteria '[{"field": "age", "operator": "Gt", "value": 25}]'
```

### 6. Change Database Password

```bash
chaindb db change-password --name test_db --user admin --old-password oldpassword --new-password newpassword
```

## Common Issues and Solutions

### Authentication Errors

If you encounter authentication errors, check:

1. That you've connected to the database with `chaindb db connect`
2. That the token file exists at `~/.chaindb-token.json`
3. That the token format is correct

### Error Messages

If you see `[object Object]` in error messages, it means the error object isn't being properly stringified. Check the error handling in `src/utils/api.ts`.

## Development Workflow

1. Make changes to the code
2. Run `npm run build` to compile
3. Test your changes using the commands above
4. If you've made changes to the authentication or API request logic, you may need to reconnect to the database

## Debugging

For more verbose output, you can modify the code to include more console logs. Key files to look at:

- `src/utils/api.ts` - Handles API requests and authentication
- `src/commands/` - Contains the implementation of each command
