import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { CanvasModule } from './canvas/canvas.module';
import { HealthModule } from './health/health.module';
import { UploadModule } from './upload/upload.module';
import { ChatModule } from './chat/chat.module';
import { ContactModule } from './contact/contact.module';
import { ProfileModule } from './profile/profile.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    StorageModule,
    HealthModule,
    CanvasModule,
    UploadModule,
    ChatModule,
    ContactModule,
    ProfileModule,
  ],
})
export class AppModule {}
