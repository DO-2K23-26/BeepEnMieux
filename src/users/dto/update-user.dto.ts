import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  email?: string;
  mdp?: string;
  pseudo?: string;
  nom?: string;
  prenom?: string;
  groupeIds?: string[] | null; // Ajoutez cela si vous prévoyez de mettre à jour les groupes associés
  groupes?: never;
  updatedAt?: Date; // Vous pouvez ajuster le type en fonction de votre configuration
}
