import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GroupeService } from './groupe.service';
import { CreateGroupeDto } from './dto/create-groupe.dto';
import { UpdateGroupeDto } from './dto/update-groupe.dto';

@Controller('groupe')
export class GroupeController {
  constructor(private readonly groupeService: GroupeService) {}

  @Post()
  create(@Body() createGroupeDto: CreateGroupeDto) {
    return this.groupeService.create(createGroupeDto);
  }

  @Get()
  findAll() {
    return this.groupeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupeDto: UpdateGroupeDto) {
    return this.groupeService.update(+id, updateGroupeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupeService.remove(+id);
  }
}
