import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty({ message: 'clientId không được để trống' })
  clientId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên món ăn không được để trống' })
  foodName: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa điểm/căng tin không được để trống' })
  location: string;

  @IsString()
  @IsNotEmpty({ message: 'Loại món ăn không được để trống' })
  category: string;

  @IsNumber()
  @Min(1, { message: 'Đánh giá hương vị tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá hương vị tối đa là 5 sao' })
  tasteRating: number;

  @IsNumber()
  @Min(1, { message: 'Đánh giá giá cả tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá giá cả tối đa là 5 sao' })
  priceRating: number;

  @IsNumber()
  @Min(1, { message: 'Đánh giá vệ sinh tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá vệ sinh tối đa là 5 sao' })
  hygieneRating: number;

  @IsNumber()
  @Min(1, { message: 'Đánh giá chất lượng tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá chất lượng tối đa là 5 sao' })
  qualityRating: number;

  @IsNumber()
  @Min(1, { message: 'Đánh giá tổng thể tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá tổng thể tối đa là 5 sao' })
  overallRating: number;

  @IsNumber()
  @Min(0, { message: 'Giá món ăn phải lớn hơn hoặc bằng 0' })
  price: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;
}

