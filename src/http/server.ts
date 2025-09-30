import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { config } from 'dotenv'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/http/error-handler'
import routes from '@/http/routes'
import S3ClientWrapper from '@/lib/aws'

config()

const app = fastify().withTypeProvider<ZodTypeProvider>()

const s3Client = new S3ClientWrapper()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Xeggo',
      description: 'Documentação dos recursos do Xeggo API.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
})

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
})

app.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || []

    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('Not allowed'), false)
  },
  credentials: true,
})

app.register(async function (app) {
  try {
    app.decorate('s3Client', s3Client)

    console.log('🚀 S3 inicializado com sucesso!')

    app.register(routes)
  } catch (error) {
    console.error('❌ Falha ao inicializar S3 Client:', error)
    process.exit(1)
  }
})

app
  .listen({ port: process.env.SERVER_PORT, host: '0.0.0.0' })
  .then(() => {
    console.log('🚀 HTTP server está rodando!')
  })
  .catch((error) => {
    console.error('❌ Erro ao iniciarlizar HTTP server:', error)
    process.exit(1)
  })
