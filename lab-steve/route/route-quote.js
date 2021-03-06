'use strict';

const Quote = require('../model/quote');
const storage = require('../lib/storage');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const debug = require('debug')('http:route-quote');

module.exports = function(router) {
  // Create a quote
  router.post('/quote', bodyParser, (req, res) => {
    debug(`#router.post: req.body.author: ${req.body.author}, req.body.quote: ${req.body.quote}`);
    new Quote(req.body.author, req.body.quote)
      .then(quote => storage.create('quote', quote))
      .then(quote => res.status(201).json(quote))
      .catch(err => errorHandler(err, res));
  });

  // Get a single quote by uuid
  router.get('/quote/:_id', (req, res) => {
    debug(`#router.get: req.params._id: ${req.params._id}`);
    storage.fetchOne('quote', req.params._id)
      .then(buffer => buffer.toString())
      .then(json => JSON.parse(json))
      .then(quote => res.status(200).json(quote))
      .catch(err => errorHandler(err, res));
  });

  // Get all the quotes
  router.get('/quote', (req, res) => {
    debug(`#router.get: All`);
    storage.fetchAll('quote')
      .then(fnames => fnames.map(e => e.split('.')[0]))
      .then(ids => res.status(200).json(ids))
      .catch(err => errorHandler(err, res));
  });

  // Update a quote
  router.put('/quote/:_id', bodyParser, (req, res) => {
    debug(`#router.put: req.params._id: ${req.params._id}`);

    storage.fetchOne('quote', req.params._id)
      .then(buffer => buffer.toString())
      .then(json => JSON.parse(json))
      .then(quote => ({
        _id: req.params._id,
        quote: req.body.quote || quote.quote,
        author: req.body.author || quote.author,
      }))
      .then(item => storage.update('quote', req.params._id, item))
      .then(() => res.sendStatus(204))
      .catch(err => errorHandler(err, res));
  });

  // Delete a quote
  router.delete('/quote/:_id', (req, res) => {
    debug(`#router.delete: req.params._id: ${req.params._id}`);
    storage.destroy('quote', req.params._id)
      .then(() => res.status(204).send())
      .catch(err => errorHandler(err, res));
  });
};
