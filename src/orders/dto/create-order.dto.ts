
import {ArrayMinSize, IsArray, ValidateNested} from 'class-validator'

import { Type } from "class-transformer";
import { OrderItemDto } from './order-item.dto';


export class CreateOrderDto {
    @IsArray()
    @ValidateNested({each:true})
    @ArrayMinSize(1)
    @Type(()=>OrderItemDto)
    items : OrderItemDto []
}
