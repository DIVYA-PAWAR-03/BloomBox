export interface Command {
  execute(): void;
  undo(): void;
  name: string;
}
