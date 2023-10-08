import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ type: String, unique: true })
  walletAddress: string;

  @Prop({ type: Number })
  nonce: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
