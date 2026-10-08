
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject} from '@nestjs/common';
import { Request } from 'express';
import { NATS_SERVICE } from '../../config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        @Inject(NATS_SERVICE) private readonly client:ClientProxy,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try{

            const {user, token:newToken} = await firstValueFrom(
                this.client.send('auth.verify.user',token)
            );
            request['user']= user
            request['token'] = newToken;
            
        } catch (error) {
            throw new UnauthorizedException();
        }

        return true;
    }


    private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
    }

}




