const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const dbPath = path.join(
  process.cwd(),
  'data',
  'skm_database.json'
);

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const admin = db.users.find(
  user => user.email.toLowerCase() === 'admin@skmhighschool.in'
);

if (!admin) {
  console.log('Admin account not found.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a NEW admin password: ', password => {
  if (password.length < 12) {
    console.log('Password must contain at least 12 characters.');
    rl.close();
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);

  if (!bcrypt.compareSync(password, hash)) {
    console.log('Password verification failed.');
    rl.close();
    process.exit(1);
  }

  admin.password_hash = hash;

  fs.writeFileSync(
    dbPath,
    JSON.stringify(db, null, 2),
    'utf8'
  );

  console.log('\nAdmin password updated successfully.');
  console.log('Bcrypt verification: PASSED');

  rl.close();
});