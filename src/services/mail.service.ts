import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly smtpUser: string;
  private readonly smtpPassword: string;
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.smtpUser = this.configService.getOrThrow<string>('SMTP_USER');
    this.smtpPassword = this.configService.getOrThrow<string>('SMTP_PASSWORD');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.smtpUser,
        pass: this.smtpPassword,
      },
    });
  }

  async sendEmail(subject: string, html: string, email: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        to: email,
        subject: subject,
        html: html,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }
}
