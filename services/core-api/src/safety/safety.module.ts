// WO: WO-034
import { Module } from '@nestjs/common';
import { ProvisionalSuppressionService } from './provisional-suppression.service';
import { UploadInterceptorMiddleware } from './upload-interceptor.middleware';

@Module({
  providers: [ProvisionalSuppressionService, UploadInterceptorMiddleware],
  exports: [ProvisionalSuppressionService, UploadInterceptorMiddleware],
})
export class SafetyModule {}
