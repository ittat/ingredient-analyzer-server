import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import OpenAI from 'openai';
import { ModuleType } from './libs/emus';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './libs/pipeTransforms';
import { blob } from 'stream/consumers';
import { FileLike } from 'openai/uploads';
import { R } from './libs/R';
import { GenerativeModel } from '@google/generative-ai';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,

    @Inject(ModuleType.openai) private readonly openai: OpenAI,
    @Inject(ModuleType.googleai) private readonly googleai: GenerativeModel,
  ) {}

  @Get('')
  hello() {
    return R.ok('hello world');
  }

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image'))
  async ingredientAnalyzer(
    @UploadedFile()
    // new FileSizeValidationPipe(5 * 1024 * 1024), //5MB
    image: Express.Multer.File,
    @Req() req,
  ) {
    // req.setTimeout(60* 1000);

    // await new Promise(resolve => setTimeout(resolve, 60000))

    // return R.ok("sfdsdf")

    // 是的，我们将每张图片的图片上传
    let file_object = await this.openai.files.create({
      file: new File([image.buffer], image.originalname, {
        type: image.mimetype,
      }),
      // @ts-ignore
      purpose: 'file-extract',
    });

    // 获取结果
    // file_content = client.files.retrieve_content(file_id=file_object.id)
    // 注意，之前 retrieve_content api 在最新版本标记了 warning, 可以用下面这行代替
    // 如果是旧版本，可以用 retrieve_content
    let file_content = await (
      await this.openai.files.content(file_object.id)
    ).text();

    // { prompt_tokens: 977, completion_tokens: 834, total_tokens: 1811 }
    const res = await this.openai.chat.completions.create({
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: `
            你是一位专业的食品、化妆品、药品分析师，你会根据提供的图片，为用户提供产品成分表，你会为用户提供安全，有帮助，准确的回答。
            你需要考虑下面的因素：
            - 判断用户提供的图片是否为存在食品的成分表。如果不是，需要直接提示用户不是食品成分表。
            - 如果是发现有成分表，需要解析成分表，并且提供食品的成分表。
            - 检查成分的作用，判断是否存在潜在风险。
            - 告知用户该产品主要用途。
            - 如果成分可能涉及不使用人群。
            - 需要告知用户，你的分析只是为了帮助用户，并不是医疗建议。
            - 如果用户提供是食品，有可能存在营养表，也需要分析一下
            `,
        },
        {
          role: 'user',
          content: file_content,
        },
        {
          role: 'user',
          content: [{ type: 'text', text: '分析一下这张图片的成分表' }],
        },
      ],

      temperature: 0.3,
      max_tokens: 2000,
    });

    console.log(res);

    return R.ok(res.choices[0].message.content);
  }

  @Post('analyzev2')
  @UseInterceptors(FileInterceptor('image'))
  async ingredientAnalyzer2(
    @UploadedFile()
    // new FileSizeValidationPipe(5 * 1024 * 1024), //5MB
    image: Express.Multer.File,
    @Req() req,
  ) {
    // const prompt = "Explain how AI works";

    // const result = await this.googleai.generateContent(prompt);
    // console.log(result.response.text());

    const result = await this.googleai.generateContent([
      {
        inlineData: {
          data: image.buffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      },
      `
   你是一位专业的食品、化妆品、药品分析师，你会根据提供的图片，为用户提供产品成分表，你会为用户提供安全，有帮助，准确的回答。
            你需要考虑下面的因素：
            - 请使用中文回答
            - 判断用户提供的图片是否为存在食品的成分表。如果不是，需要直接提示用户不是食品成分表。
            - 如果是发现有成分表，需要解析成分表，并且提供食品的成分表。
            - 检查成分的作用，判断是否存在潜在风险。
            - 告知用户该产品主要用途。
            - 如果成分可能涉及不使用人群。
            - 需要告知用户，你的分析只是为了帮助用户，并不是医疗建议。
            - 如果用户提供是食品，有可能存在营养表，也需要分析一下
            `,
    ]);
    // console.log(result.response.text());

    return R.ok(result.response.text())
  }
}
