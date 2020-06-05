import { Context } from 'vm';
import CommandContext from '../CommandContext';

export type ArgumentFunc = (ctx: CommandContext, wordInvalid: string) => Promise<string> | string;

export interface FlagOptions {
  aliases: string[];
  whitelist: string[];
  name: string;
}

export interface ArgumentOptions {
  entireQuery: boolean;
  matchJoin: string;
  missingError: string | ArgumentFunc;
  optional: boolean;
  showUsage: boolean;
}

export interface BooleanArgOptions {
  falseValues: string[]
  trueValues: string[];
}

export interface DefaultFlagOptions extends FlagOptions {
  isDefaultFlag: true,
  handle: (ctx: Context) => any;
}

export type ParameterOptions = ArgumentOptions & FlagOptions;
export type ParameterOptionsTypes = ParameterOptions & BooleanArgOptions
export type ParameterTypes = 'boolean';
