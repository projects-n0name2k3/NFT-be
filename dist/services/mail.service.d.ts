import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly smtpUser;
    private readonly smtpPassword;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(subject: string, html: string, email: string): Promise<void>;
}
