import {
  DeleteObjectsCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

class S3ClientWrapper {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  }

  async listBuckets() {
    try {
      const response = await this.client.send(new ListBucketsCommand({}))

      return response.Buckets || []
    } catch (error) {
      console.error('Erro ao listar buckets:', error)

      throw error
    }
  }

  async uploadFile(
    bucketName: string,
    fileKey: string,
    fileContent: Buffer,
    contentType: string,
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: contentType,
      })

      const response = await this.client.send(command)

      return response
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
      throw error
    }
  }

  async deleteFolder(bucketName: string, folderKey: string) {
    try {
      let continuationToken: string | undefined

      do {
        const command = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: folderKey,
          ContinuationToken: continuationToken,
        })

        const listResponse = await this.client.send(command)

        if (!listResponse.Contents || listResponse.Contents.length === 0) return

        const chunks = this.chunkArray(listResponse.Contents, 1000)

        await Promise.all(
          chunks.map(async (chunk) => {
            const command = new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: chunk.map((object) => ({
                  Key: object.Key,
                })),
              },
            })

            await this.client.send(command)
          }),
        )

        continuationToken = listResponse.NextContinuationToken
      } while (continuationToken)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  chunkArray<T>(array: T[], size: number): T[][] {
    const result = []

    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }

    return result
  }
}

export default S3ClientWrapper
