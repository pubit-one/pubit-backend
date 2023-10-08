import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginWithWalletDto } from './dtos';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/signup')
  signup(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get('/nonce/:wallet')
  getNonce(@Param('wallet') wallet: string) {
    return this.userService.getNonce(wallet);
  }

  @Post('/login/:wallet')
  loginWithWallet(
    @Param('wallet') wallet: string,
    @Body() dto: LoginWithWalletDto,
  ) {
    const signature: string = dto.signature;
    return this.userService.loginWithWallet(wallet, signature);
  }
}
