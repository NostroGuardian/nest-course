import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';
import { AuthDto } from 'src/auth/dto/auth.dto';

const productId = new Types.ObjectId().toHexString();

const loginDto: AuthDto = {
  login: 'a@a.ru',
  password: '1',
};

const testDto: CreateReviewDto = {
  name: 'Test',
  title: 'Header',
  description: 'Review description',
  rating: 5,
  productId,
};

describe('ReviewController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);
    token = res.body.access_token;
  });

  it('/review/create (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/review/create')
      .send(testDto);

    createdId = response.body._id;
    expect(response.statusCode).toEqual(201);
    expect(response.body._id).toBeDefined();
  });

  it('/review/create (POST) - fail', async () => {
    const response = await request(app.getHttpServer())
      .post('/review/create')
      .send({ ...testDto, rating: 0 });

    expect(response.statusCode).toEqual(400);
    console.log(response.body);
  });

  it('/review/byProduct/:productId (GET) - success', async () => {
    const response = await request(app.getHttpServer()).get(
      '/review/byProduct/' + productId,
    );

    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBe(1);
  });

  it('/review/byProduct/:productId (GET) - fail', async () => {
    const response = await request(app.getHttpServer()).get(
      '/review/byProduct/' + new Types.ObjectId().toHexString(),
    );

    expect(response.statusCode).toEqual(200);
    expect(response.body.length).toBe(0);
  });

  it('/review/:id (DELETE) - success', async () => {
    const response = await request(app.getHttpServer())
      .delete('/review/' + createdId)
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toEqual(200);
  });

  it('/review/:id (DELETE) - fail', async () => {
    const response = await request(app.getHttpServer())
      .delete('/review/' + new Types.ObjectId().toHexString())
      .set('Authorization', 'Bearer ' + token);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual(REVIEW_NOT_FOUND);
  });

  afterAll(() => {
    disconnect();
  });
});
