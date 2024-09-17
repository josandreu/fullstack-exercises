require('dotenv').config();

const mongoose = require('mongoose');

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

// // Check connection
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   console.log('DB connected');
// });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

// const person = new Person({
//   name: 'Paco Perez',
//   number: '667-444-444',
// });

// person.save().then((result) => {
//   console.log('result', result);
//   mongoose.connection.close();
// });

Person.find({}).then((result) => {
  result.forEach((person) => {
    console.log('person', person);
  });

  mongoose.connection.close();
});
