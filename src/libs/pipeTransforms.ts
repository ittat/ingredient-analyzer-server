import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {

    limit: number = 100000;

    constructor(limit?: number) {
        if(limit){
            this.limit = limit;
        }
    }

  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    return value.size < this.limit;
  }
}