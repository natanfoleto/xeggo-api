import 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    s3Client: S3ClientWrapper
  }

  export interface FastifyRequest {
    getCurrentUser(): Promise<{ userId: string; restaurantId: string }>
  }
}
