import { fabric } from 'fabric';
import { Command } from './command.interface';

// ----------------------------------------------------
// MOVE COMMAND
// ----------------------------------------------------
export class MoveCommand implements Command {
  name = 'Move Object';
  constructor(
    private objects: fabric.Object[],
    private oldCoords: { left: number; top: number }[],
    private newCoords: { left: number; top: number }[]
  ) {}

  execute() {
    this.objects.forEach((obj, idx) => {
      obj.set({
        left: this.newCoords[idx].left,
        top: this.newCoords[idx].top
      });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }

  undo() {
    this.objects.forEach((obj, idx) => {
      obj.set({
        left: this.oldCoords[idx].left,
        top: this.oldCoords[idx].top
      });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }
}

// ----------------------------------------------------
// ROTATE COMMAND
// ----------------------------------------------------
export class RotateCommand implements Command {
  name = 'Rotate Object';
  constructor(
    private objects: fabric.Object[],
    private oldAngles: number[],
    private newAngles: number[]
  ) {}

  execute() {
    this.objects.forEach((obj, idx) => {
      obj.set({ angle: this.newAngles[idx] });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }

  undo() {
    this.objects.forEach((obj, idx) => {
      obj.set({ angle: this.oldAngles[idx] });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }
}

// ----------------------------------------------------
// SCALE COMMAND
// ----------------------------------------------------
export class ScaleCommand implements Command {
  name = 'Scale Object';
  constructor(
    private objects: fabric.Object[],
    private oldScales: { scaleX: number; scaleY: number }[],
    private newScales: { scaleX: number; scaleY: number }[]
  ) {}

  execute() {
    this.objects.forEach((obj, idx) => {
      obj.set({
        scaleX: this.newScales[idx].scaleX,
        scaleY: this.newScales[idx].scaleY
      });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }

  undo() {
    this.objects.forEach((obj, idx) => {
      obj.set({
        scaleX: this.oldScales[idx].scaleX,
        scaleY: this.oldScales[idx].scaleY
      });
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }
}

// ----------------------------------------------------
// DELETE COMMAND
// ----------------------------------------------------
export class DeleteCommand implements Command {
  name = 'Delete Object';
  private indices: number[] = [];

  constructor(
    private canvas: fabric.Canvas,
    private objects: fabric.Object[]
  ) {
    const allObjects = this.canvas.getObjects();
    this.indices = this.objects.map(obj => allObjects.indexOf(obj));
  }

  execute() {
    this.objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  undo() {
    // Sort and re-insert elements in their original stacking order
    const zipped = this.objects.map((obj, i) => ({ obj, index: this.indices[i] }));
    zipped.sort((a, b) => a.index - b.index);
    
    zipped.forEach(({ obj, index }) => {
      this.canvas.insertAt(obj, index, false);
    });
    this.canvas.requestRenderAll();
  }
}

// ----------------------------------------------------
// DUPLICATE COMMAND
// ----------------------------------------------------
export class DuplicateCommand implements Command {
  name = 'Duplicate Object';
  constructor(
    private canvas: fabric.Canvas,
    private duplicatedObjects: fabric.Object[]
  ) {}

  execute() {
    this.duplicatedObjects.forEach(obj => {
      this.canvas.add(obj);
    });
    // Select the new duplicated objects
    if (this.duplicatedObjects.length === 1) {
      this.canvas.setActiveObject(this.duplicatedObjects[0]);
    } else if (this.duplicatedObjects.length > 1) {
      const activeSelection = new fabric.ActiveSelection(this.duplicatedObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(activeSelection);
    }
    this.canvas.requestRenderAll();
  }

  undo() {
    this.duplicatedObjects.forEach(obj => {
      this.canvas.remove(obj);
    });
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }
}

// ----------------------------------------------------
// LAYER ORDER COMMAND
// ----------------------------------------------------
export class LayerCommand implements Command {
  name = 'Arrange Layers';
  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object,
    private oldIndex: number,
    private newIndex: number
  ) {}

  execute() {
    this.object.moveTo(this.newIndex);
    this.canvas.requestRenderAll();
  }

  undo() {
    this.object.moveTo(this.oldIndex);
    this.canvas.requestRenderAll();
  }
}

// ----------------------------------------------------
// PROPERTY CHANGE COMMAND (generic control for locks, visible, style changes)
// ----------------------------------------------------
export class PropertyCommand implements Command {
  name = 'Change Properties';
  constructor(
    private objects: fabric.Object[],
    private propertyName: string,
    private oldValues: any[],
    private newValues: any[]
  ) {}

  execute() {
    this.objects.forEach((obj, idx) => {
      obj.set(this.propertyName as any, this.newValues[idx]);
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }

  undo() {
    this.objects.forEach((obj, idx) => {
      obj.set(this.propertyName as any, this.oldValues[idx]);
      obj.setCoords();
    });
    this.objects[0]?.canvas?.requestRenderAll();
  }
}

// ----------------------------------------------------
// GROUP COMMAND
// ----------------------------------------------------
export class GroupCommand implements Command {
  name = 'Group Objects';
  private group: fabric.Group | null = null;
  private objects: fabric.Object[];

  constructor(
    private canvas: fabric.Canvas,
    private activeSelection: fabric.ActiveSelection
  ) {
    this.objects = activeSelection.getObjects();
  }

  execute() {
    if (this.group) {
      this.objects.forEach(obj => this.canvas.remove(obj));
      this.canvas.add(this.group);
      this.canvas.setActiveObject(this.group);
    } else {
      this.group = this.activeSelection.toGroup();
      const customGroup = this.group as any;
      customGroup.id = `group-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      customGroup.assetName = 'Grouped Objects';
      customGroup.category = 'group';
      customGroup.createdAt = new Date().toISOString();
      customGroup.updatedAt = new Date().toISOString();
    }
    this.canvas.requestRenderAll();
  }

  undo() {
    if (!this.group) return;
    this.activeSelection = this.group.toActiveSelection();
    this.canvas.setActiveObject(this.activeSelection);
    this.canvas.requestRenderAll();
  }
}

// ----------------------------------------------------
// UNGROUP COMMAND
// ----------------------------------------------------
export class UngroupCommand implements Command {
  name = 'Ungroup Objects';
  private activeSelection: fabric.ActiveSelection | null = null;

  constructor(
    private canvas: fabric.Canvas,
    private group: fabric.Group
  ) {}

  execute() {
    this.activeSelection = this.group.toActiveSelection();
    this.canvas.setActiveObject(this.activeSelection);
    this.canvas.requestRenderAll();
  }

  undo() {
    if (this.activeSelection) {
      const regeneratedGroup = this.activeSelection.toGroup();
      // Restore properties from group metadata
      regeneratedGroup.set({
        id: this.group.get('id' as any),
        createdAt: this.group.get('createdAt' as any),
        updatedAt: this.group.get('updatedAt' as any),
        assetName: this.group.get('assetName' as any),
        category: this.group.get('category' as any),
      } as any);
      this.group = regeneratedGroup;
      this.canvas.setActiveObject(this.group);
      this.canvas.requestRenderAll();
    }
  }
}
