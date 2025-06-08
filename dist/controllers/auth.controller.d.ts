import { HttpStatus } from '@nestjs/common';
import { AuthService } from '../services';
import { Request, Response } from 'express';
import { GenerateMessageDto, VerifyDto, VerifyEmailDto, VerifyOrganizerDto, VerifyWalletDto } from '../dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    generateMessage({ walletAddress }: GenerateMessageDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            message: string;
        };
    }>;
    logout(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
    verifyUser(body: VerifyWalletDto, res: Response): Promise<void>;
    verifyOrganizer(body: VerifyOrganizerDto, res: Response): Promise<void>;
    verifyEmail(body: VerifyEmailDto, res: Response): Promise<void>;
    sendOtp(body: VerifyDto, res: Response): Promise<void>;
}
