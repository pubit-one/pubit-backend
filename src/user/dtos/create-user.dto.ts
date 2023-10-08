import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  walletAddress: string;

  @IsNumber()
  nonce: number;
}
