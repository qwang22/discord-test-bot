type CommandType = 'function' | 'music';

interface ITextCommand {
  name: string;
  type: CommandType;
  callback: string;
}

interface ITextCommandList {
  commands: ITextCommand[]
}

export { CommandType, ITextCommand, ITextCommandList }