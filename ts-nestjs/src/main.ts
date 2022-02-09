import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { readFileSync } from 'fs'
import { SessionService } from 'modules/auth/session/session.service'
import { AppModule } from './app.module'
import morgan from 'morgan'

async function bootstrap () {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: process.env.NGINX_ENABLED === 'yes' ? undefined : {
      // deployment: use nginx or other proxy and set env NGINX_ENABLED=yes, or use localhost method
      // localhost: `cd private && mkcert localhost && mkcert -install`
      cert: readFileSync('./private/localhost.pem'),
      key: readFileSync('./private/localhost-key.pem')
    }
  })
  app.enableCors({
    origin: true,
    allowedHeaders: ['cookie', 'content-type'],
    exposedHeaders: ['set-cookie', 'cookie', 'content-type'],
    methods: ['post', 'get', 'put', 'delete', 'patch'],
  })
  app.set('trust proxy', 1)
  const sessionService = app.get(SessionService)
  app.use(sessionService.sessionController)

  app.use(morgan((tokens, req, resp) => {
    return `${ req.method } ${ req.url } => ${ resp.statusCode }`
  }))

  await app.listen(3000)
}
bootstrap()
