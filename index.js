var _ = require('lodash');
var md5 = require('md5');
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

var db = mongoose.connection;

mongoose.connect('mongodb://:@ds047085.mongolab.com:47085/pikitimeline');

db.on('error', () => console.error('connection error!'));
db.once('open', () => console.log('mongodb connection ok'));

var eventSchema = mongoose.Schema({
  roomId: String,
  title: String,
  start: String,
  end: String,
  owner: String,
  password: String
});

var Events = mongoose.model('event', eventSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/', (req, res, next) => res.json({ message: 'ok' }));

app.get('/utils/md5/:message', (req, res, next) => res.send(md5(req.params.message)));

app.get('/events/:roomid', (req, res, next) => {
  Events.find({ roomId: req.params.roomid }, (err, collection) => {
    res.send(collection);
  });
});

app.post('/events/:roomid', (req, res, next) => {
  var body = req.body;
  var event;

  body.password = md5(body.password);

  event = new Events(_.extend({ roomId: req.params.roomid }, req.body));

  event.save((err, newEvent) => res.send(newEvent));
});

app.put('/events/:id', (req, res, next) => {
  var event = new Events(req.body);

  Events.findById(req.params.id, (err, findEvent) => {
    findEvent.title = event.title;
    findEvent.start = event.start;
    findEvent.end = event.end;
    findEvent.owner = event.owner;

    findEvent.save((err, updateEvent) => res.send(updateEvent));
  });
});

app.delete('/events/:id', (req, res, next) => {
  Events.findById(req.params.id).remove( () => res.send({ message: 'ok' }) );
});

app.listen(process.env.PORT || 3000, () => console.log('ready!'));
