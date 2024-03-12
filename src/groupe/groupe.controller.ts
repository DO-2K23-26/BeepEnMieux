import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GroupeService } from './groupe.service';

@Controller('groupe')
export class GroupeController {
  constructor(private readonly groupeService: GroupeService) {}

  @Post()
  create(@Body() groupe: Prisma.GroupeCreateInput) {
    return this.groupeService.create(groupe);
  }

  @Get()
  findAll() {
    return this.groupeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.groupeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() groupe: Prisma.GroupeUpdateInput) {
    return this.groupeService.update(id, groupe);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.groupeService.remove(id);
  }
}
