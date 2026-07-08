import { Command } from './commands/command.interface';
import { useEditorStore } from '@/store/useEditorStore';

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxDepth = 50; // History limit

  execute(command: Command) {
    // Run the command
    command.execute();

    // Push to undo, clear redo
    this.undoStack.push(command);
    this.redoStack = [];

    // Limit depth
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }

    this.syncWithStore();
  }

  // Registers a command that was already executed by user interaction (e.g. mouse drag complete)
  // to avoid running execute() again.
  push(command: Command) {
    this.undoStack.push(command);
    this.redoStack = [];

    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }

    this.syncWithStore();
  }

  undo() {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    this.syncWithStore();
  }

  redo() {
    if (this.redoStack.length === 0) return;

    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);

    this.syncWithStore();
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.syncWithStore();
  }

  private syncWithStore() {
    useEditorStore.getState().setHistoryStates(
      this.undoStack.length > 0,
      this.redoStack.length > 0
    );
  }
}

// Export a singleton history manager
export const historyManager = new HistoryManager();
