require('dotenv').config();
const express = require('express');
const fs = require('fs'); // write to file
const path = require('path');
const morgan = require('morgan'); // middleware
const mongoose = require('mongoose');

const Person = require('./models/person');
const { error } = require('console');

const generateRandomId = () => {
  return Math.floor(Math.random() * (73847294728389 - 1) + 1);
};

const checkName = (obj, name) => {
  return obj.some((o) => o.name === name);
};

async function searchName(name) {
  console.log('name', name);
  try {
    const results = await Person.find({ name: name });
    console.log('results', results);
    return results;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

const app = express();

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// Error middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

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

  Person.countDocuments({}).then((result) => {
    response.send(`<p style="font-family:sans-serif">Phonebook has info for ${result} people</p>
      <p style="font-family:sans-serif">${dateMadrid}</p>`);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.json(result);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
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

  Person.findOne({ name: body.name }).then((person) => {
    if (person) {
      const opts = {
        runValidators: true,
        new: true,
        context: 'query',
      };

      Person.findByIdAndUpdate(person.id, { number: body.number, opts })
        .then((result) => {
          return response.status(200).end();
        })
        .catch((error) => next(error));
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person
        .save()
        .then((result) => {
          response.json(result);
        })
        .catch((error) => next(error));
    }
  });
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
