import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModuleType } from './libs/emus';
import OpenAI from 'openai';
import { ConfigModule } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: ModuleType.openai,
      async useFactory() {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
          // httpAgent: new HttpsProxyAgent(process.env.PROXY_URL),
        });

        return openai;
      },
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useFactory: () => {
    //     // const timeoutInMilliseconds: number = parseInt(configService.get<any>('TIMEOUT_IN_MILLISECONDS', 2500));
    //     return new TimeoutInterceptor(1000* 60);
    //   },
    //   // inject: [ConfigService],
    // }

    {
      provide: ModuleType.googleai,
     useFactory() {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      return model
     },
    }
  ],
})
export class AppModule {}
