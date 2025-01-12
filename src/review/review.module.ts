import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { ReviewModel } from './review.model';

@Module({
  controllers: [ReviewController],
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: ReviewModel,
        schemaOptions: {
          collection: 'Review',
        },
      },
    ]),
  ],
})
export class ReviewModule {}
