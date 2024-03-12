// create-user.dto.ts
export class CreateUserDto {
  email: string;
  mdp: string;
  pseudo: string;
  nom?: string;
  prenom?: string;
}
