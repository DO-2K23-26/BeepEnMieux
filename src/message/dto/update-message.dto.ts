import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { Groupe } from '@prisma/client';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  contenu?: any;
  groupeId?: string;
  groupes?: Groupe[];
  createdAt?: Date;
  updatedAt?: Date;
}
