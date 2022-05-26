import request from 'supertest';
import { app } from '../../app';

it('clears the cokie after signout', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201);
    const response = await request(app)
    .post('/api/users/signout')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(200);
    expect(response.get('Set-Cookie')[0].split(';')[0].split('=')[1]).toBeFalsy();
});