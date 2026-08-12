import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { DocumentExtractionWorker } from './document/document-extraction.worker';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    const worker = app.get(DocumentExtractionWorker);
    await worker.start();
}

void bootstrap();
