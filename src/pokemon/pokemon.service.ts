import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import {isValidObjectId, Model} from "mongoose";
import {Pokemon} from "./entities/pokemon.entity";
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class PokemonService {

  constructor(
      @InjectModel(Pokemon.name)
      private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      return await (this.pokemonModel.create(createPokemonDto));
    } catch (e) {
      this.handleErrors(e)
    }
  }

  async findAll() {
    return this.pokemonModel.find();
  }

  async findOne(param: string) {
    let pokemon: Pokemon
    (!isNaN(+param)) ? pokemon = await this.pokemonModel.findOne({no: +param}) :
        (isValidObjectId(param)) ? pokemon = await this.pokemonModel.findOne({_id: param}) :
            pokemon = await this.pokemonModel.findOne({name: param});
    if (!pokemon) {
      throw new NotFoundException(`Pokemon whit id, name or no '${param}' not found`);
    }
    return pokemon;
  }

  async update(param: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(param);
    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true});
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (e) {
      this.handleErrors(e);
    }
  }

  async remove(id: string) {
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with id '${id}' not found`);
    return {
      status: 200,
      message: `Pokemon with id '${id} deleted successfully`
    }
  }

  private handleErrors(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in data base ${JSON.stringify(error.keyValue)}`);
    }
    throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
    console.log(error);
  }
}
