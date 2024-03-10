// create-user.dto.ts
export class CreateUserDto {
  id: string;
  email: string;
  mdp: string;
  pseudo: string;
  nom?: string;
  prenom?: string;
  createdAt: Date;
}
