import { HttpStatus } from '@nestjs/common';
import { UsersService } from '../services';
import { UpdateUserDto, TokenPayloadDto } from '../dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateUser(user: TokenPayloadDto, files: {
        coverPhotoImage?: Express.Multer.File[];
        thumbnailImage?: Express.Multer.File[];
    } | undefined, { name }: UpdateUserDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            updatedUser: import("../entities").User;
        };
    }>;
    getUserProfile(user: TokenPayloadDto): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            user: import("../entities").User;
        };
    }>;
}
