import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { User } from '@hub/user-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'alice@example.com',
  ...overrides,
});

const makeTag = (overrides = {}) => ({
  id: 1,
  name: 'Work',
  colorHex: '#ff0000',
  ...overrides,
});

const makeTagServiceMock = () => ({
  getTags: jest.fn(),
  createTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TagController', () => {
  let controller: TagController;
  let tagService: ReturnType<typeof makeTagServiceMock>;

  beforeEach(async () => {
    tagService = makeTagServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [{ provide: TagService, useValue: tagService }],
    }).compile();

    controller = module.get(TagController);
  });

  // -------------------------------------------------------------------------
  // getTags
  // -------------------------------------------------------------------------

  describe('getTags', () => {
    it('returns all tags for the current user', async () => {
      const user = makeUser();
      const tags = [makeTag(), makeTag({ id: 2, name: 'Personal' })];
      tagService.getTags.mockResolvedValue(tags);

      const result = await controller.getTags(user);

      expect(result).toEqual(tags);
      expect(tagService.getTags).toHaveBeenCalledWith(user);
    });
  });

  // -------------------------------------------------------------------------
  // createTag
  // -------------------------------------------------------------------------

  describe('createTag', () => {
    it('creates a tag and returns it', async () => {
      const user = makeUser();
      const dto = { name: 'Shopping', colorHex: '#00ff00' };
      const created = makeTag(dto);
      tagService.createTag.mockResolvedValue(created);

      const result = await controller.createTag(dto, user);

      expect(result).toEqual(created);
      expect(tagService.createTag).toHaveBeenCalledWith(user, dto);
    });
  });

  // -------------------------------------------------------------------------
  // updateTag
  // -------------------------------------------------------------------------

  describe('updateTag', () => {
    it('updates a tag by id and returns the updated tag', async () => {
      const user = makeUser();
      const dto = { name: 'Renamed', colorHex: null };
      const updated = makeTag({ name: 'Renamed' });
      tagService.updateTag.mockResolvedValue(updated);

      const result = await controller.updateTag(1, dto, user);

      expect(result).toEqual(updated);
      expect(tagService.updateTag).toHaveBeenCalledWith(user, 1, dto);
    });
  });

  // -------------------------------------------------------------------------
  // deleteTag
  // -------------------------------------------------------------------------

  describe('deleteTag', () => {
    it('deletes a tag by id and returns the deleted tag', async () => {
      const user = makeUser();
      const deleted = makeTag();
      tagService.deleteTag.mockResolvedValue(deleted);

      const result = await controller.deleteTag(1, user);

      expect(result).toEqual(deleted);
      expect(tagService.deleteTag).toHaveBeenCalledWith(user, 1);
    });
  });
});
