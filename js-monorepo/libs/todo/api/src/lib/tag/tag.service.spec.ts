import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '@hub/prisma';
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
  ownerId: 1,
  ...overrides,
});

const makePrismaMock = () => ({
  tag: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TagService', () => {
  let service: TagService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TagService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TagService);
  });

  // -------------------------------------------------------------------------
  // getTags
  // -------------------------------------------------------------------------

  describe('getTags', () => {
    it('returns all tags belonging to the user', async () => {
      const user = makeUser({ id: 7 });
      const tags = [
        makeTag({ ownerId: 7 }),
        makeTag({ id: 2, name: 'Personal', ownerId: 7 }),
      ];
      prisma.tag.findMany.mockResolvedValue(tags);

      const result = await service.getTags(user);

      expect(result).toEqual(tags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { ownerId: 7 },
      });
    });

    it('returns an empty array when the user has no tags', async () => {
      prisma.tag.findMany.mockResolvedValue([]);

      const result = await service.getTags(makeUser());

      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // createTag
  // -------------------------------------------------------------------------

  describe('createTag', () => {
    it('creates a tag and returns it', async () => {
      const user = makeUser();
      const dto = { name: 'Shopping', colorHex: '#00ff00' };
      const created = makeTag({ ...dto });
      prisma.tag.create.mockResolvedValue(created);

      const result = await service.createTag(user, dto);

      expect(result).toEqual(created);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: { ...dto, ownerId: user.id },
      });
    });

    it('associates the tag with the current user', async () => {
      const user = makeUser({ id: 99 });
      const dto = { name: 'Urgent', colorHex: '#0000ff' };
      prisma.tag.create.mockResolvedValue(makeTag());

      await service.createTag(user, dto);

      expect(prisma.tag.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ownerId: 99 }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // deleteTag
  // -------------------------------------------------------------------------

  describe('deleteTag', () => {
    it('deletes the tag and returns it', async () => {
      const user = makeUser();
      const deleted = makeTag();
      prisma.tag.delete.mockResolvedValue(deleted);

      const result = await service.deleteTag(user, 1);

      expect(result).toEqual(deleted);
      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: 1, ownerId: user.id },
      });
    });
  });

  // -------------------------------------------------------------------------
  // updateTag
  // -------------------------------------------------------------------------

  describe('updateTag', () => {
    it('updates the tag name and returns the updated tag', async () => {
      const user = makeUser();
      const dto = { name: 'Renamed', colorHex: null };
      const updated = makeTag({ name: 'Renamed' });
      prisma.tag.update.mockResolvedValue(updated);

      const result = await service.updateTag(user, 1, dto);

      expect(result).toEqual(updated);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: 1, ownerId: user.id },
        data: { name: 'Renamed', colorHex: undefined },
      });
    });

    it('updates the tag color and returns the updated tag', async () => {
      const user = makeUser();
      const dto = { name: null, colorHex: '#aabbcc' };
      prisma.tag.update.mockResolvedValue(makeTag({ colorHex: '#aabbcc' }));

      await service.updateTag(user, 1, dto);

      expect(prisma.tag.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: undefined, colorHex: '#aabbcc' },
        }),
      );
    });
  });
});
