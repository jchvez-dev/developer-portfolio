import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CanvasDto {
  @IsNumber()
  @Min(1)
  @Max(3840)
  width: number;

  @IsNumber()
  @Min(1)
  @Max(2160)
  height: number;

  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

class LayerPropertiesDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsOptional()
  @IsString()
  assetUrl?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  color?: string;
}

class LayerDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => LayerPropertiesDto)
  properties: LayerPropertiesDto;
}

export class ExportCanvasDto {
  @ValidateNested()
  @Type(() => CanvasDto)
  canvas: CanvasDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayerDto)
  layers: LayerDto[];
}
