import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);

  constructor(
    @InjectModel(Survey.name)
    private readonly surveyModel: Model<SurveyDocument>,
  ) {}

  async create(createSurveyDto: CreateSurveyDto): Promise<{ survey: Survey; isDuplicate: boolean }> {
    // Chống duplicate: Kiểm tra xem clientId đã tồn tại chưa
    const existing = await this.surveyModel.findOne({ clientId: createSurveyDto.clientId }).exec();
    if (existing) {
      this.logger.warn(`Survey với clientId ${createSurveyDto.clientId} đã tồn tại. Bỏ qua tạo lặp.`);
      return { survey: existing, isDuplicate: true };
    }

    const createdSurvey = new this.surveyModel({
      ...createSurveyDto,
      createdAt: createSurveyDto.createdAt ? new Date(createSurveyDto.createdAt) : new Date(),
    });

    const saved = await createdSurvey.save();
    this.logger.log(`Tạo mới survey thành công cho món: ${saved.foodName} (clientId: ${saved.clientId})`);
    return { survey: saved, isDuplicate: false };
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Survey> {
    let survey: Survey | null = null;
    // Tìm theo MongoDB _id hoặc theo clientId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      survey = await this.surveyModel.findById(id).exec();
    }
    if (!survey) {
      survey = await this.surveyModel.findOne({ clientId: id }).exec();
    }
    if (!survey) {
      throw new NotFoundException(`Không tìm thấy khảo sát với id hoặc clientId: ${id}`);
    }
    return survey;
  }
}

