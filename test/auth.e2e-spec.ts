import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';

const loginDto: AuthDto = {
  login: 'a@a.ru',
  password: '1',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    expect(response.statusCode).toEqual(200);
    expect(response.body.access_token).toBeDefined();
  });

  it('/auth/login (POST) - wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, password: '2' });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toEqual({
      message: 'Пароль не верный',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('/auth/login (POST) - wrong login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, login: 'a1@a.ru' });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toEqual({
      message: 'Пользователь с таким email не найден',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });

  afterAll(() => {
    disconnect();
  });
});
