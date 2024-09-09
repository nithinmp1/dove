module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    await db.createCollection('product');
    await db.createCollection('user');
    await db.createCollection('cart');
    await db.createCollection('order');
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('product').drop();
    await db.collection('user').drop();
    await db.collection('cart').drop();
    await db.collection('order').drop();
  }
};
