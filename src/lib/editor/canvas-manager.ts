import { fabric } from 'fabric';
import { CustomFabricObject, AspectRatio } from '@/types/editor';
import { useEditorStore } from '@/store/useEditorStore';
import { initAligningGuidelines } from '@/utils/editor/alignment-guides';
import { historyManager } from './history-manager';
import { 
  MoveCommand, 
  RotateCommand, 
  ScaleCommand, 
  DeleteCommand, 
  DuplicateCommand, 
  LayerCommand,
  PropertyCommand,
  GroupCommand,
  UngroupCommand
} from './commands/canvas.commands';

export class CanvasManager {
  public canvas: fabric.Canvas | null = null;
  private isPanning = false;
  private lastPosX = 0;
  private lastPosY = 0;
  private spacePressed = false;
  
  // Track drag states to compile history commands only on drag complete
  private dragStartCoords: { left: number; top: number }[] = [];
  private dragStartAngles: number[] = [];
  private dragStartScales: { scaleX: number; scaleY: number }[] = [];

  init(canvasEl: HTMLCanvasElement, containerWidth: number, containerHeight: number) {
    const storeSettings = useEditorStore.getState().settings;
    
    this.canvas = new fabric.Canvas(canvasEl, {
      width: storeSettings.dimensions.width,
      height: storeSettings.dimensions.height,
      backgroundColor: storeSettings.backgroundColor,
      selectionColor: 'rgba(244, 63, 94, 0.15)', // Light rose tint
      selectionBorderColor: '#f43f5e',
      selectionLineWidth: 1,
      preserveObjectStacking: true, // Crucial for Layer Manager layering
    });

    // Configure selection borders globally
    fabric.Object.prototype.set({
      borderColor: '#f43f5e',
      cornerColor: '#ffffff',
      cornerStrokeColor: '#f43f5e',
      cornerSize: 8,
      cornerStyle: 'circle',
      transparentCorners: false,
      padding: 6,
    });

    // Initialize alignment/snap guides
    if (storeSettings.showGuidelines) {
      initAligningGuidelines(this.canvas);
    }

    // Attach Event Handlers
    this.setupEvents();
    this.setupZoomAndPan();
    this.centerCanvas(containerWidth, containerHeight);

    // Initial store update
    this.updateStoreSelection();
    
    return this.canvas;
  }

  dispose() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }

  // ----------------------------------------------------
  // EVENT INTEGRATION
  // ----------------------------------------------------
  private setupEvents() {
    if (!this.canvas) return;

    // Track active selection changes
    const onSelectionChange = () => {
      this.updateStoreSelection();
    };

    this.canvas.on('selection:created', onSelectionChange);
    this.canvas.on('selection:updated', onSelectionChange);
    this.canvas.on('selection:cleared', () => {
      useEditorStore.getState().setSelectedObjectId(null);
      useEditorStore.getState().setSelectedObjectProps(null);
    });

    // Object additions: Tag them with unique IDs if they don't have them
    this.canvas.on('object:added', (e) => {
      const obj = e.target as CustomFabricObject;
      if (obj && !obj.id) {
        obj.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        obj.createdAt = new Date().toISOString();
        obj.updatedAt = new Date().toISOString();
      }
    });

    // Handle modification drags (History compilation)
    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj && useEditorStore.getState().settings.snapToGrid) {
        const gridSize = useEditorStore.getState().settings.gridSize;
        // Snap movement coordinates
        obj.set({
          left: Math.round(obj.left! / gridSize) * gridSize,
          top: Math.round(obj.top! / gridSize) * gridSize,
        });
      }
    });

    this.canvas.on('before:transform', (e) => {
      const transform = e.transform;
      if (!transform) return;
      
      const targets = transform.target.type === 'activeSelection' 
        ? (transform.target as fabric.ActiveSelection).getObjects()
        : [transform.target];

      // Save initial transform coordinates for undo commands
      this.dragStartCoords = targets.map(t => ({ left: t.left || 0, top: t.top || 0 }));
      this.dragStartAngles = targets.map(t => t.angle || 0);
      this.dragStartScales = targets.map(t => ({ scaleX: t.scaleX || 1, scaleY: t.scaleY || 1 }));
    });

    // Commit commands to history on completion of transformations
    this.canvas.on('object:modified', (e) => {
      const target = e.target;
      if (!target) return;

      const action = e.transform?.action;
      const targets = target.type === 'activeSelection'
        ? (target as fabric.ActiveSelection).getObjects()
        : [target];

      if (action === 'drag' || action === 'dragX' || action === 'dragY' || action === 'moving') {
        const newCoords = targets.map(t => ({ left: t.left || 0, top: t.top || 0 }));
        const cmd = new MoveCommand(targets, [...this.dragStartCoords], newCoords);
        historyManager.push(cmd);
      } else if (action === 'rotate') {
        const newAngles = targets.map(t => t.angle || 0);
        const cmd = new RotateCommand(targets, [...this.dragStartAngles], newAngles);
        historyManager.push(cmd);
      } else if (action === 'scale' || action === 'scaleX' || action === 'scaleY') {
        const newScales = targets.map(t => ({ scaleX: t.scaleX || 1, scaleY: t.scaleY || 1 }));
        const cmd = new ScaleCommand(targets, [...this.dragStartScales], newScales);
        historyManager.push(cmd);
      }

      this.updateStoreSelection();
    });
  }

  private updateStoreSelection() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject() as CustomFabricObject;
    if (active) {
      useEditorStore.getState().setSelectedObjectId(active.id);
      useEditorStore.getState().setSelectedObjectProps({
        id: active.id,
        type: active.type,
        left: active.left,
        top: active.top,
        angle: active.angle,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        opacity: active.opacity,
        locked: active.isLockedFlag || false,
        visible: active.visible || true,
        assetId: active.assetId || null,
        assetName: active.assetName || null,
        category: active.category || null,
        subcategory: active.subcategory || null,
        layer: active.layer || null,
        isLocked: active.isLockedFlag || false,
      });
    }
  }

  // ----------------------------------------------------
  // ZOOM & PAN ENGINE
  // ----------------------------------------------------
  private setupZoomAndPan() {
    if (!this.canvas) return;

    // Mouse wheel zoom
    this.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas!.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.1) zoom = 0.1;
      
      this.canvas!.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      useEditorStore.getState().setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Spacebar drag / Middle click pan setup
    this.canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      const isMiddleButton = evt.button === 1; // Middle mouse click
      
      if (this.spacePressed || isMiddleButton) {
        this.isPanning = true;
        this.canvas!.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (this.isPanning) {
        const e = opt.e;
        const vpt = this.canvas!.viewportTransform!;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.canvas!.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.canvas!.selection = true;
        this.canvas!.requestRenderAll();
      }
    });

    // Listen to spacebar key events in the window
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        this.spacePressed = true;
        if (this.canvas) {
          this.canvas.defaultCursor = 'grab';
        }
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        if (this.canvas) {
          this.canvas.defaultCursor = 'default';
        }
      }
    });
  }

  // ----------------------------------------------------
  // VIEWPORT CONTROLS
  // ----------------------------------------------------
  public setZoomLevel(zoom: number) {
    if (!this.canvas) return;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint({ x: center.left, y: center.top }, zoom);
    useEditorStore.getState().setZoom(zoom);
  }

  public zoomIn() {
    if (!this.canvas) return;
    const zoom = this.canvas.getZoom() + 0.1;
    this.setZoomLevel(Math.min(zoom, 5.0));
  }

  public zoomOut() {
    if (!this.canvas) return;
    const zoom = this.canvas.getZoom() - 0.1;
    this.setZoomLevel(Math.max(zoom, 0.1));
  }

  public resetZoom() {
    this.setZoomLevel(1.0);
  }

  public fitToScreen(containerWidth: number, containerHeight: number) {
    if (!this.canvas) return;
    const width = this.canvas.getWidth();
    const height = this.canvas.getHeight();
    
    const scaleX = (containerWidth - 60) / width;
    const scaleY = (containerHeight - 60) / height;
    const zoom = Math.min(scaleX, scaleY, 1.0); // Fit but don't over-magnify

    this.setZoomLevel(zoom);
    this.centerCanvas(containerWidth, containerHeight);
  }

  public centerCanvas(containerWidth: number, containerHeight: number) {
    if (!this.canvas) return;
    const zoom = this.canvas.getZoom();
    const width = this.canvas.getWidth() * zoom;
    const height = this.canvas.getHeight() * zoom;

    const vpt = this.canvas.viewportTransform!;
    vpt[4] = (containerWidth - width) / 2;
    vpt[5] = (containerHeight - height) / 2;
    this.canvas.requestRenderAll();
  }

  // ----------------------------------------------------
  // CANVAS DIMENSIONS
  // ----------------------------------------------------
  public resizeCanvas(aspectRatio: AspectRatio, containerWidth: number, containerHeight: number) {
    if (!this.canvas) return;
    const dimensions = useEditorStore.getState().settings.dimensions;
    
    this.canvas.setWidth(dimensions.width);
    this.canvas.setHeight(dimensions.height);
    this.fitToScreen(containerWidth, containerHeight);
  }

  // ----------------------------------------------------
  // OBJECT PERSISTENCE MAPPING
  // ----------------------------------------------------
  public saveCanvas(): string {
    if (!this.canvas) return '{}';
    return JSON.stringify(
      this.canvas.toJSON([
        'id',
        'createdAt',
        'updatedAt',
        'assetId',
        'assetName',
        'category',
        'subcategory',
        'isLocked',
        'layer',
        'metadata',
        'isLockedFlag',
        'isHiddenFlag',
        'lockMovementX',
        'lockMovementY',
        'lockScalingX',
        'lockScalingY',
        'lockRotation',
        'selectable',
        'evented',
        'visible'
      ])
    );
  }

  public loadCanvas(jsonState: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.canvas) {
        resolve();
        return;
      }
      this.canvas.loadFromJSON(jsonState, () => {
        // Enforce lock properties on restored objects
        this.canvas!.getObjects().forEach((obj: any) => {
          if (obj.isLockedFlag) {
            obj.set({
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true,
              selectable: false,
            });
          }
        });
        this.canvas!.requestRenderAll();
        historyManager.clear();
        this.updateStoreSelection();
        resolve();
      });
    });
  }

  public exportCanvas(format: 'png' | 'svg'): string {
    if (!this.canvas) return '';
    // Export at base 1.0 zoom without pan adjustments
    const originalZoom = this.canvas.getZoom();
    const originalVpt = [...this.canvas.viewportTransform!];
    
    // Reset zoom and pan for high quality raw export
    this.canvas.setZoom(1.0);
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    this.canvas.requestRenderAll();

    let data = '';
    if (format === 'png') {
      data = this.canvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });
    } else {
      data = this.canvas.toSVG();
    }

    // Restore zoom and pan
    this.canvas.setZoom(originalZoom);
    this.canvas.viewportTransform = originalVpt;
    this.canvas.requestRenderAll();
    
    return data;
  }

  // ----------------------------------------------------
  // LAYER MANAGER OPERATIONS
  // ----------------------------------------------------
  public bringForward() {
    const active = this.canvas?.getActiveObject();
    if (!this.canvas || !active) return;
    
    const oldIndex = this.canvas.getObjects().indexOf(active);
    const newIndex = Math.min(oldIndex + 1, this.canvas.getObjects().length - 1);
    
    const cmd = new LayerCommand(this.canvas, active, oldIndex, newIndex);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public sendBackward() {
    const active = this.canvas?.getActiveObject();
    if (!this.canvas || !active) return;
    
    const oldIndex = this.canvas.getObjects().indexOf(active);
    const newIndex = Math.max(oldIndex - 1, 0);
    
    const cmd = new LayerCommand(this.canvas, active, oldIndex, newIndex);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public bringToFront() {
    const active = this.canvas?.getActiveObject();
    if (!this.canvas || !active) return;
    
    const oldIndex = this.canvas.getObjects().indexOf(active);
    const newIndex = this.canvas.getObjects().length - 1;
    
    const cmd = new LayerCommand(this.canvas, active, oldIndex, newIndex);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public sendToBack() {
    const active = this.canvas?.getActiveObject();
    if (!this.canvas || !active) return;
    
    const oldIndex = this.canvas.getObjects().indexOf(active);
    const newIndex = 0;
    
    const cmd = new LayerCommand(this.canvas, active, oldIndex, newIndex);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public lockSelected() {
    const active = this.canvas?.getActiveObject() as CustomFabricObject;
    if (!this.canvas || !active) return;

    const targets = active.type === 'activeSelection' 
      ? (active as any).getObjects() as CustomFabricObject[]
      : [active];

    const oldLocks = targets.map(t => t.isLockedFlag || false);
    const newLocks = targets.map(() => true);

    const cmd = new PropertyCommand(targets, 'isLockedFlag', oldLocks, newLocks);
    historyManager.execute(cmd);

    // Apply native locking properties
    targets.forEach(t => {
      t.set({
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        selectable: false,
      });
    });
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.updateStoreSelection();
  }

  public unlockObjectById(id: string) {
    if (!this.canvas) return;
    const target = this.canvas.getObjects().find((obj: any) => obj.id === id) as CustomFabricObject;
    if (!target) return;

    const cmd = new PropertyCommand([target], 'isLockedFlag', [true], [false]);
    historyManager.execute(cmd);

    target.set({
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      selectable: true,
    });
    
    this.canvas.setActiveObject(target);
    this.canvas.requestRenderAll();
    this.updateStoreSelection();
  }

  public toggleVisibilitySelected() {
    const active = this.canvas?.getActiveObject() as CustomFabricObject;
    if (!this.canvas || !active) return;

    const targets = active.type === 'activeSelection' 
      ? (active as any).getObjects() as CustomFabricObject[]
      : [active];

    const oldVis = targets.map(t => t.visible !== false);
    const newVis = targets.map(t => !t.visible);

    const cmd = new PropertyCommand(targets, 'visible', oldVis, newVis);
    historyManager.execute(cmd);

    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.updateStoreSelection();
  }

  // ----------------------------------------------------
  // TEST UTILITIES (Foundation Validation)
  // ----------------------------------------------------
  public addMockObject(type: 'rect' | 'circle' | 'text', fill: string = '#f43f5e') {
    if (!this.canvas) return;

    let obj: fabric.Object;
    const center = this.canvas.getCenter();

    if (type === 'rect') {
      obj = new fabric.Rect({
        left: center.left - 50,
        top: center.top - 50,
        width: 100,
        height: 100,
        fill: fill,
        rx: 8,
        ry: 8,
      });
    } else if (type === 'circle') {
      obj = new fabric.Circle({
        left: center.left - 50,
        top: center.top - 50,
        radius: 50,
        fill: fill,
      });
    } else {
      obj = new fabric.IText('BloomBox', {
        left: center.left - 70,
        top: center.top - 20,
        fontFamily: 'Inter',
        fontSize: 28,
        fill: fill,
        fontWeight: 'bold',
      });
    }

    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    
    // Register action in history
    const cmd = new DuplicateCommand(this.canvas, [obj]);
    historyManager.push(cmd);
  }

  // ----------------------------------------------------
  // ADVANCED OBJECT EDITING (PHASE 3C)
  // ----------------------------------------------------
  public groupSelected() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject() as fabric.ActiveSelection;
    if (!active || active.type !== 'activeSelection') return;
    
    const cmd = new GroupCommand(this.canvas, active);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public ungroupSelected() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject() as fabric.Group;
    if (!active || active.type !== 'group') return;
    
    const cmd = new UngroupCommand(this.canvas, active);
    historyManager.execute(cmd);
    this.updateStoreSelection();
  }

  public flipHorizontal() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) return;
    const targets = active.type === 'activeSelection' 
      ? (active as fabric.ActiveSelection).getObjects()
      : [active];
    
    const oldFlips = targets.map(t => t.flipX || false);
    const newFlips = targets.map(t => !t.flipX);

    const cmd = new PropertyCommand(targets, 'flipX', oldFlips, newFlips);
    historyManager.execute(cmd);
    this.canvas.requestRenderAll();
    this.updateStoreSelection();
  }

  public flipVertical() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (!active) return;
    const targets = active.type === 'activeSelection' 
      ? (active as fabric.ActiveSelection).getObjects()
      : [active];
    
    const oldFlips = targets.map(t => t.flipY || false);
    const newFlips = targets.map(t => !t.flipY);

    const cmd = new PropertyCommand(targets, 'flipY', oldFlips, newFlips);
    historyManager.execute(cmd);
    this.canvas.requestRenderAll();
    this.updateStoreSelection();
  }

  public align(type: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle') {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject() as fabric.ActiveSelection;
    if (!active) return;

    const objects = active.type === 'activeSelection' ? active.getObjects() : [active];
    if (objects.length === 0) return;

    const oldCoords = objects.map(o => ({ left: o.left || 0, top: o.top || 0 }));

    if (active.type === 'activeSelection') {
      objects.forEach(obj => {
        const w = (obj.width || 0) * (obj.scaleX || 1);
        const h = (obj.height || 0) * (obj.scaleY || 1);
        
        if (type === 'left') {
          obj.set({ left: -active.width! / 2 });
        } else if (type === 'right') {
          obj.set({ left: active.width! / 2 - w });
        } else if (type === 'center') {
          obj.set({ left: -w / 2 });
        } else if (type === 'top') {
          obj.set({ top: -active.height! / 2 });
        } else if (type === 'bottom') {
          obj.set({ top: active.height! / 2 - h });
        } else if (type === 'middle') {
          obj.set({ top: -h / 2 });
        }
        obj.setCoords();
      });
    } else {
      // Single object alignment relative to canvas boundaries
      const obj = active;
      const w = (obj.width || 0) * (obj.scaleX || 1);
      const h = (obj.height || 0) * (obj.scaleY || 1);
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();

      if (type === 'left') {
        obj.set({ left: 0 });
      } else if (type === 'right') {
        obj.set({ left: canvasWidth - w });
      } else if (type === 'center') {
        obj.set({ left: (canvasWidth - w) / 2 });
      } else if (type === 'top') {
        obj.set({ top: 0 });
      } else if (type === 'bottom') {
        obj.set({ top: canvasHeight - h });
      } else if (type === 'middle') {
        obj.set({ top: (canvasHeight - h) / 2 });
      }
      obj.setCoords();
    }

    this.canvas.requestRenderAll();
    const newCoords = objects.map(o => ({ left: o.left || 0, top: o.top || 0 }));
    
    const cmd = new MoveCommand(objects, oldCoords, newCoords);
    historyManager.push(cmd);
    this.updateStoreSelection();
  }

  public distribute(direction: 'horizontal' | 'vertical') {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject() as fabric.ActiveSelection;
    if (!active || active.type !== 'activeSelection') return;

    const objects = [...active.getObjects()];
    if (objects.length < 3) return; // Distributing needs >= 3 objects

    const oldCoords = objects.map(o => ({ left: o.left || 0, top: o.top || 0 }));

    if (direction === 'horizontal') {
      objects.sort((a, b) => (a.left || 0) - (b.left || 0));
      const leftmost = objects[0];
      const rightmost = objects[objects.length - 1];
      const totalWidth = (rightmost.left || 0) - (leftmost.left || 0);
      const step = totalWidth / (objects.length - 1);

      for (let i = 1; i < objects.length - 1; i++) {
        objects[i].set({ left: (leftmost.left || 0) + i * step });
        objects[i].setCoords();
      }
    } else {
      objects.sort((a, b) => (a.top || 0) - (b.top || 0));
      const topmost = objects[0];
      const bottommost = objects[objects.length - 1];
      const totalHeight = (bottommost.top || 0) - (topmost.top || 0);
      const step = totalHeight / (objects.length - 1);

      for (let i = 1; i < objects.length - 1; i++) {
        objects[i].set({ top: (topmost.top || 0) + i * step });
        objects[i].setCoords();
      }
    }

    this.canvas.requestRenderAll();
    const newCoords = objects.map(o => ({ left: o.left || 0, top: o.top || 0 }));
    
    const cmd = new MoveCommand(objects, oldCoords, newCoords);
    historyManager.push(cmd);
    this.updateStoreSelection();
  }

  public exportToTemplateJSON(): string {
    if (!this.canvas) return '{}';
    const objects = this.canvas.getObjects().filter((o: any) => !o.excludeFromExport);
    const template = {
      version: '1.0.0',
      aspectRatio: useEditorStore.getState().settings.aspectRatio,
      dimensions: useEditorStore.getState().settings.dimensions,
      backgroundColor: useEditorStore.getState().settings.backgroundColor,
      objects: objects.map((o: any) => {
        return o.toJSON([
          'id',
          'assetId',
          'assetName',
          'category',
          'subcategory',
          'createdAt',
          'updatedAt',
          'rotation',
          'scale',
          'layer',
          'isLocked',
          'isLockedFlag',
          'isHiddenFlag',
          'visible'
        ]);
      })
    };
    return JSON.stringify(template, null, 2);
  }
}

// Export singleton canvas manager
export const canvasManager = new CanvasManager();
