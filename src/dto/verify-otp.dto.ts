import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyDto {
    @ApiProperty({
        example: '0x1234567890abcdef1234567890abcdef12345678',
        description: "User's wallet address",
    })
    @IsString()
    walletAddress: string;

    @ApiProperty({
        example: 'tranngochuy12@gmail.com',
        description: "Email of user",
    })
    @IsString()
    email: string;
}
