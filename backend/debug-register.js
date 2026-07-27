const app = require('./server');
const request = require('supertest');

(async () => {
  try {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test6@example.com', phone: '9876543210', password: 'Test1234' });
    console.log(res.status);
    console.log(JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
