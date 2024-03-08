import { PartialType } from '@nestjs/mapped-types';
import { Groupe } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto){
  email?: string;
  mdp?: string;
  pseudo?: string;
  nom?: string | null;
  prenom?: string | null;
  groupeIds?: string[]; // Ajoutez cela si vous prévoyez de mettre à jour les groupes associés
  groupes?: Groupe[];
  updatedAt?: Date; // Vous pouvez ajuster le type en fonction de votre configuration
}