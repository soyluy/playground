import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Research, ResearchDocument } from '../schemas/research-result.schema';
import { Model } from 'mongoose';

@Injectable()
export class ResearchPersistenceService {
  @InjectModel(Research.name)
  private readonly _researchModel!: Model<ResearchDocument>;

  public async save(research: Research): Promise<Research> {
    return this._researchModel.create(research);
  }

  public async findById(id: string): Promise<Research | null> {
    return this._researchModel.findById(id);
  }

  public async findByTodoId(todoId: string): Promise<Research[]> {
    return this._researchModel.find({ todoId });
  }

  public async update(
    id: string,
    research: Partial<Research>,
  ): Promise<Research | null> {
    return this._researchModel.findByIdAndUpdate(id, research, { new: true });
  }
}
