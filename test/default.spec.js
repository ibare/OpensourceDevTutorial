const chai = require('chai');

chai.should();

function V() {}

V.prototype.zero = function() { return 0 };
V.prototype.ten = function() { return 10 };

describe('Test', () => {
  var v;

  beforeEach(() => {
     v = new V();
   });

  it('return 0', () => {
    v.zero().should.equal(0);
  });

  it('return 10', () => {
    v.ten().should.equal(10);
  });
});
