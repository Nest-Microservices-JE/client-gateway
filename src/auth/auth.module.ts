import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [AuthController],
  imports:[
    NatsModule
  ]
})
export class AuthModule {}
