import request from 'supertest';
import { app } from '../../app';


it('returns a 400 on incorrect email', async () => {
    await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(400);
});


it('returns a 400 on incorrect password', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password1'
    })
    .expect(400);
});


it('returns a cookie on valid credentials', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(200);
    expect(response.get('Set-Cookie')).toBeDefined();
});