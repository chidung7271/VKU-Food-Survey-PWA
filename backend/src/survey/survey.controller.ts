import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SurveyService } from './survey.service';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSurveyDto: CreateSurveyDto) {
    const result = await this.surveyService.create(createSurveyDto);
    return {
      success: true,
      message: result.isDuplicate
        ? 'Khảo sát đã tồn tại trên hệ thống (chống trùng lặp thành công)'
        : 'Đã gửi khảo sát thành công.',
      data: result.survey,
      isDuplicate: result.isDuplicate,
    };
  }

  @Get()
  async findAll() {
    const data = await this.surveyService.findAll();
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.surveyService.findOne(id);
    return {
      success: true,
      data,
    };
  }
}

