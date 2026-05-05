import { ResearchEvent } from '@hub/research-data';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * This service is responsible for streaming the research process to the client.
 */
@Injectable()
export class ResearchStreamService {
  private readonly _activeStreams = new Map<string, Subject<ResearchEvent>>();

  public create(): { id: string; subject: Subject<ResearchEvent> } {
    const id = uuidv4();
    const subject = new Subject<ResearchEvent>();
    this._activeStreams.set(id, subject);
    const ret = { id, subject };
    return ret;
  }

  public delete(id: string): void {
    this._activeStreams.delete(id);
  }

  public get(id: string): Subject<ResearchEvent> | undefined {
    return this._activeStreams.get(id);
  }

  public getOrThrow(id: string): Subject<ResearchEvent> {
    const stream = this._activeStreams.get(id);
    if (!stream) {
      throw new NotFoundException(`Stream with id ${id} not found`);
    }
    return stream;
  }
}
