require('dotenv').config();
const express = require('express');
const fs = require('fs'); // write to file
const path = require('path');
const morgan = require('morgan'); // middleware
const mongoose = require('mongoose');

const Person = require('./models/person');

const generateRandomId = () => {
  return Math.floor(Math.random() * (73847294728389 - 1) + 1);
};

const checkName = (obj, name) => {
  return obj.some((o) => o.name === name);
};

const app = express();

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

app.use(express.json());

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body',
    { stream: accessLogStream }
  )
);

app.use(express.static('dist'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get('/info', (request, response) => {
  const options = {
    timeZone: 'Europe/Madrid',
    hour12: false, // Puedes cambiar a true si prefieres formato de 12 horas
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const dateMadrid = new Intl.DateTimeFormat('es-ES', options).format(
    new Date()
  );

  response.send(`<p>Phonebook has info for ${persons.length}</p>
    <p>${dateMadrid}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((person) => person.id === id);

  if (person) {
    return response.send(person);
  }

  return response.status(400).json({
    error: 'Invalid id',
  });
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'Name is missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number is missing',
    });
  }

  // if (checkName(persons, body.name)) {
  //   return response.status(400).json({
  //     error: 'Name already exists',
  //   });
  // }

  const person = new Person({
    //id: generateRandomId(),
    name: body.name,
    number: body.number,
  });

  //persons = persons.concat(person);

  //response.send(person);

  person.save().then((result) => {
    response.json(result);
    mongoose.connection.close();
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
