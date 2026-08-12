import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`Aplicação iniciada na porta ${port}`);
}
void bootstrap().catch((error: unknown) => {
    const logger = new Logger('Bootstrap');
    logger.error(
        'Não foi possível iniciar a aplicação',
        error instanceof Error ? error.stack : String(error),
    );
    process.exitCode = 1;
});
