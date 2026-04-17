import { config } from 'dotenv';
import { resolve } from 'node:path';
import mongoose, { InferSchemaType, model } from 'mongoose';

import { ResourceStatus } from './lib/resource/enums/resource-status.enum';
import { ResourceType } from './lib/resource/enums/resource-type.enum';
import { Resource, ResourceSchema } from './lib/schemas/resource.schema';

config({ path: resolve(process.cwd(), '.env') });

type SeedResource = Omit<
  InferSchemaType<typeof ResourceSchema>,
  'createdAt' | 'updatedAt' | 'id'
>;

const getMongoConfig = (): { url: string; dbName: string } => {
  const url = process.env['MONGODB_URL'];
  const dbName = process.env['MONGODB_DB_NAME'];

  if (!url) {
    throw new Error('MONGODB_URL is not set');
  }

  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not set');
  }

  return { url, dbName };
};

const seedResources: SeedResource[] = [
  {
    title: 'Designing Data-Intensive Applications',
    url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/',
    description:
      'Core systems design concepts: storage engines, replication, transactions, and stream processing.',
    tags: ['systems-design', 'distributed-systems', 'book'],
    category: 'Engineering',
    type: ResourceType.BOOK,
    status: ResourceStatus.DONE,
    metadata: { author: 'Martin Kleppmann', pages: 616, publishedYear: 2017 },
  },
  {
    title: 'Clean Architecture',
    url: 'https://www.pearson.com/en-us/subject-catalog/p/clean-architecture/P200000000626/9780134494272',
    description:
      'Architecture boundaries and dependency inversion patterns for long-lived codebases.',
    tags: ['architecture', 'software-design', 'book'],
    category: 'Engineering',
    type: ResourceType.BOOK,
    status: ResourceStatus.IN_PROGRESS,
    metadata: { author: 'Robert C. Martin', pages: 432, publishedYear: 2017 },
  },
  {
    title: 'Attention Is All You Need',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'Transformer architecture paper introducing self-attention.',
    tags: ['ml', 'nlp', 'transformers', 'paper'],
    category: 'Machine Learning',
    type: ResourceType.PAPER,
    status: ResourceStatus.DONE,
    metadata: {
      venue: 'NeurIPS',
      year: 2017,
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    },
  },
  {
    title:
      'The Log: What every software engineer should know about real-time data unification',
    url: 'https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-data-unification',
    description:
      'Foundational article on commit logs as a backbone for distributed data systems.',
    tags: ['distributed-systems', 'streaming', 'article'],
    category: 'Engineering',
    type: ResourceType.ARTICLE,
    status: ResourceStatus.WANT_TO_CONSUME,
    metadata: { author: 'Jay Kreps', readingTimeMinutes: 30 },
  },
  {
    title: 'A Philosophy of Software Design',
    url: 'https://web.stanford.edu/~ouster/cgi-bin/book.php',
    description:
      'Practical guidance on reducing complexity in software systems.',
    tags: ['design', 'maintainability', 'book'],
    category: 'Engineering',
    type: ResourceType.BOOK,
    status: ResourceStatus.WANT_TO_CONSUME,
    metadata: { author: 'John Ousterhout', pages: 190, publishedYear: 2021 },
  },
  {
    title: 'Computerphile: How HTTPS Works',
    url: 'https://www.youtube.com/watch?v=T4Df5_cojAs',
    description:
      'Clear explanation of TLS certificates, handshakes, and trust chains.',
    tags: ['security', 'https', 'video'],
    category: 'Security',
    type: ResourceType.VIDEO,
    status: ResourceStatus.DONE,
    metadata: {
      channel: 'Computerphile',
      durationMinutes: 13,
      platform: 'YouTube',
    },
  },
  {
    title: 'MIT 6.824 Distributed Systems',
    url: 'https://pdos.csail.mit.edu/6.824/',
    description:
      'Course resources and labs for consensus, replication, and fault tolerance.',
    tags: ['distributed-systems', 'course', 'link'],
    category: 'Engineering',
    type: ResourceType.LINK,
    status: ResourceStatus.IN_PROGRESS,
    metadata: { source: 'MIT', format: 'Course site' },
  },
  {
    title: 'GraphQL Cursor Connections Specification',
    url: 'https://relay.dev/graphql/connections.htm',
    description:
      'Reference for pagination semantics with edges, nodes, and cursors.',
    tags: ['graphql', 'pagination', 'spec'],
    category: 'Web API',
    type: ResourceType.LINK,
    status: ResourceStatus.WANT_TO_CONSUME,
    metadata: { source: 'Relay', topic: 'Cursor pagination' },
  },
  {
    title: 'Personal note: Resource API design decisions',
    description:
      'Resolver must stay thin; service owns filtering and pagination defaults.',
    tags: ['architecture-note', 'resource-api', 'note'],
    category: 'Notes',
    type: ResourceType.NOTE,
    status: ResourceStatus.DONE,
    metadata: { format: 'markdown', lastReviewed: '2026-04-16' },
  },
  {
    title: 'Personal note: MongoDB indexing candidates',
    description:
      'Potential indexes: type+status compound, tags multikey, category filter path.',
    tags: ['mongodb', 'indexing', 'performance', 'note'],
    category: 'Notes',
    type: ResourceType.NOTE,
    status: ResourceStatus.IN_PROGRESS,
    metadata: { followUp: 'Benchmark with realistic query volume' },
  },
  {
    title: 'System Design Interview: Rate Limiter',
    url: 'https://www.youtube.com/watch?v=FU4WlwfS3G0',
    description:
      'Video walkthrough of token bucket and distributed rate limiting tradeoffs.',
    tags: ['system-design', 'rate-limiting', 'video'],
    category: 'Engineering',
    type: ResourceType.VIDEO,
    status: ResourceStatus.WANT_TO_CONSUME,
    metadata: { durationMinutes: 26, platform: 'YouTube' },
  },
  {
    title:
      'Practical recommendations for gradient-based training of deep architectures',
    url: 'https://arxiv.org/abs/1206.5533',
    description: 'Optimization heuristics and training recommendations.',
    tags: ['deep-learning', 'optimization', 'paper'],
    category: 'Machine Learning',
    type: ResourceType.PAPER,
    status: ResourceStatus.IN_PROGRESS,
    metadata: { year: 2012, venue: 'Neural Networks: Tricks of the Trade' },
  },
];

async function seed(): Promise<void> {
  const { url, dbName } = getMongoConfig();

  await mongoose.connect(url, { dbName });

  const ResourceModel = model(Resource.name, ResourceSchema);

  try {
    await ResourceModel.collection.drop();
    console.log('Dropped existing resources collection.');
  } catch (error: unknown) {
    const isNamespaceMissing =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 26;

    if (!isNamespaceMissing) {
      throw error;
    }
  }

  const insertedResources = await ResourceModel.insertMany(seedResources);

  console.log(`Seeded ${insertedResources.length} resources into ${dbName}.`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  })
  .catch(async (error: unknown) => {
    console.error('Resource seeding failed:', error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
