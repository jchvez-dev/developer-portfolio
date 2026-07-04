import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ContactDto } from './dto/contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submit(@Body() dto: ContactDto, @Req() req: Request) {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    return this.contactService.submit(dto, ip);
  }
}
