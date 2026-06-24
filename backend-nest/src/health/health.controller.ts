import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'portafolio-nest',
      timestamp: new Date().toISOString(),
    };
  }
}
