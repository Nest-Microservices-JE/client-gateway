import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ORDER_SERVICE } from '../config';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [OrdersController],
  providers: [],
  imports:[
    NatsModule
  ]
})
export class OrdersModule {}
