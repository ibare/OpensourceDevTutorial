const test = require('supertest');
const request = test('http://localhost:3000');
const roomID = 'test';

function hasArray(res) {
  return Array.isArray(res.body);
}

describe('Default', () => {
  var server;

  it('server working', done => {
    request
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it('event list', done => {
    request
      .get('/events/'+roomID)
      .expect(200)
      .expect(hasArray)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
