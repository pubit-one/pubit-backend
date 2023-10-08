import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateUserDto } from './dtos';
import { User } from './schemas';
import { UserRepository } from './user.repository';
import { Messages, checkPublicKey, getRandomNonce } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as ESU from 'eth-sig-util';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async create(user: CreateUserDto) {
    return await this.userRepository.create({ ...user });
  }
  async findUser(username: string): Promise<User> {
    return await this.userRepository.findOne({ username });
  }

  async findUserByWallet(walletAddress: string) {
    return await this.userRepository.findOne({ walletAddress });
  }

  async findUserById(userId: string) {
    return await this.userRepository.findOne({ _id: userId });
  }
  async updateUserById(userId: Types.ObjectId, data: any) {
    return this.userRepository.findOneAndUpdate({ _id: userId }, data);
  }

  async getNonce(wallet: string) {
    if (!checkPublicKey(wallet))
      throw new BadRequestException('invalid wallet');

    const user = await this.findUserByWallet(wallet);

    const nonce = getRandomNonce();

    if (user) {
      return {
        message: Messages.SIGN_MESSAGE + user.nonce.toString(),
        userId: user._id,
      };
    }

    const newUser = await this.create({
      nonce,
      walletAddress: wallet,
    });

    return {
      message: Messages.SIGN_MESSAGE + newUser.nonce.toString(),
      userId: newUser._id,
    };
  }

  async loginWithWallet(walletAddress: string, signature: string) {
    if (!checkPublicKey(walletAddress))
      throw new BadRequestException('invalid wallet');

    const user = await this.findUserByWallet(walletAddress);
    if (!user) throw new NotFoundException('user not exist');

    const message = Messages.SIGN_MESSAGE + user.nonce.toString();
    const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
    const recoveredAddress = ESU.recoverPersonalSignature({
      data: msg,
      sig: signature,
    });

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase())
      throw new ForbiddenException('invalid credentials');

    const nonce: number = getRandomNonce();

    await this.updateUserById(user._id, { nonce });

    return {
      access_token: await this.getAccessToken(user._id, user.walletAddress),
    };
  }

  async getAccessToken(userId: Types.ObjectId, walletAddress: string) {
    const payload = { userId, walletAddress };

    return this.jwtService.signAsync(payload, {
      expiresIn: 60 * 60 * 24 * 30,
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async getTokens(userId: string, username: string) {
    const payload = { sub: userId, username };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 15,
        secret: 'at-secret',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24,
        secret: 'rt-secret',
      }),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  //return 6 digit random token
  genRandomToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
