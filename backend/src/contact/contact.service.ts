import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly mailService: MailService) {}

  async sendContactMessage(dto: CreateContactDto): Promise<{ success: boolean }> {
    await this.mailService.sendContactFormEmail(
      dto.name,
      dto.email,
      dto.subject,
      dto.message,
    );

    this.logger.log(`Contact form submitted by ${dto.email}`);
    return { success: true };
  }
}
