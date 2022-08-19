import { Module } from '@nestjs/common';
import { PokemonModule } from './pokemon/pokemon.module';
import {MongooseModule} from "@nestjs/mongoose";
import { CommonModule } from './common/common.module';

@Module({
  imports: [
      PokemonModule,
      MongooseModule.forRoot('mongodb://localhost:27017/pokedex'),
      CommonModule
  ],
})
export class AppModule {}
