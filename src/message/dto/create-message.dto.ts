import { Groupe } from "@prisma/client";

export class CreateMessageDto {
    id: string;
    contenu: any; // Adjust the type according to your actual data structure
    groupeId: string; // Adjust the type based on the type of your group identifier
    groupes: Groupe[];
    createdAt: Date; // Optional: Include this property if you want to set a custom creation date
}