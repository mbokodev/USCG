import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { LocalStorageProvider, STORAGE_PROVIDER } from './storage';

@Module({
  imports: [
    // Configurer Multer pour utiliser le stockage en mémoire
    // Le fichier sera ensuite traité par notre StorageProvider
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    // Injection du provider de stockage
    // Pour passer à S3 : remplacer LocalStorageProvider par S3StorageProvider
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
