import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class IsSellerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // SUPER_ADMIN and OPERATOR can do everything (super user)
    if (user.role === Role.SUPER_ADMIN || user.role === Role.OPERATOR) {
      return true;
    }

    if (!user.isSeller) {
      throw new ForbiddenException(
        'Accès réservé aux vendeurs. Veuillez faire une demande pour devenir vendeur.',
      );
    }

    return true;
  }
}