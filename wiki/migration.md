To manage database schema migrations in a Node.js application, you can use a migration tool or library that integrates with MongoDB. One popular option for MongoDB is `migrate-mongo`, but you can also create custom migration scripts if you prefer. Below, I’ll outline the steps to set up migrations using `migrate-mongo` and also provide an example of how you might manage migrations with custom scripts.

### Using `migrate-mongo`

#### 1. **Install `migrate-mongo`**

First, install `migrate-mongo` as a development dependency in your project:

```bash
npm install migrate-mongo --save-dev
```

#### 2. **Initialize Migration Setup**

Run the following command to initialize `migrate-mongo`. This will create a `migrate-mongo-config.js` configuration file and a `migrations` directory:

```bash
npx migrate-mongo init
```

#### 3. **Configure `migrate-mongo`**

Open the `migrate-mongo-config.js` file and configure it to connect to your MongoDB instance. Here’s an example configuration:

```javascript
// migrate-mongo-config.js

module.exports = {
  mongodb: {
    url: 'mongodb://localhost:27017',

    // The database name to use.
    databaseName: 'shopping',

    // Set to true if you want to use authentication
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  // The migrations folder
  migrationsDir: 'migrations',

  // The collection where the applied migrations are stored
  changelogCollectionName: 'changelog',

  // The migration file pattern
  migrationFileName: 'migration.js',

  // The migration file suffix
  migrationFileSuffix: '.js',

  migrationFileExtension: '.js',
  
  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,
  
  // The migration file template
  migrationFileTemplate: 'migration-template.js',
};
```

#### 4. **Create a Migration**

Generate a new migration file using `migrate-mongo`:

```bash
npx migrate-mongo create create-collections
```

This will create a new file in the `migrations` directory. Edit this file to define the operations for creating your collections:

```javascript
// migrations/xxxxxx-create-collections.js

module.exports = {
  async up(db, client) {
    // Create collections
    await db.createCollection('product');
    await db.createCollection('user');
    await db.createCollection('cart');
    await db.createCollection('order');
  },

  async down(db, client) {
    // Drop collections
    await db.collection('product').drop();
    await db.collection('user').drop();
    await db.collection('cart').drop();
    await db.collection('order').drop();
  },
};
```

#### 5. **Run Migrations**

Run the migrations to apply them to your MongoDB database:

```bash
npx migrate-mongo up
```

#### 6. **Revert Migrations**

If you need to revert the migrations, you can use:

```bash
npx migrate-mongo down
```

### Custom Migration Scripts

If you prefer not to use a dedicated migration tool, you can create custom migration scripts. Here’s a basic example:

#### 1. **Create Migration Scripts**

Create a directory for your migration scripts, e.g., `migrations/`. Add a script to initialize your database:

**`migrations/01-create-collections.js`**

```javascript
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'shopping';

async function run() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected correctly to server');

    const db = client.db(dbName);

    await db.createCollection('product');
    await db.createCollection('user');
    await db.createCollection('cart');
    await db.createCollection('order');

    console.log('Collections created successfully');
  } catch (err) {
    console.error('Error during migration', err);
  } finally {
    await client.close();
  }
}

run();
```

#### 2. **Run Migration Scripts**

Run your migration script using Node.js:

```bash
node migrations/01-create-collections.js
```

### Integrating with Your Application

You might want to integrate the migration process with your application startup to ensure that migrations are applied before your application runs. Here’s an example integration:

**`app.js`**:

```javascript
const { MongoClient } = require('mongodb');
const migrationScript = require('./migrations/01-create-collections');

async function runMigrations() {
  try {
    await migrationScript();
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

async function startServer() {
  await runMigrations();
  
  // Your application setup code here
  console.log('Starting server...');
}

startServer();
```

### Summary

- **Using `migrate-mongo`**: Provides a structured approach for managing migrations and is easy to use.
- **Custom Migration Scripts**: Allows flexibility but requires manual management.

Choose the approach that best fits your project needs. If you need more detailed guidance on any step, feel free to ask!