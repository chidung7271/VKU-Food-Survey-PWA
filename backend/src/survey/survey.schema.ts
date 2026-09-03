import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SurveyDocument = Survey & Document;

@Schema({ timestamps: true })
export class Survey {
  @Prop({ required: true, unique: true, index: true })
  clientId: string;

  @Prop({ required: true })
  foodName: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, min: 1, max: 5 })
  tasteRating: number;

  @Prop({ required: true, min: 1, max: 5 })
  priceRating: number;

  @Prop({ required: true, min: 1, max: 5 })
  hygieneRating: number;

  @Prop({ required: true, min: 1, max: 5 })
  qualityRating: number;

  @Prop({ required: true, min: 1, max: 5 })
  overallRating: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: '' })
  comment: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);

