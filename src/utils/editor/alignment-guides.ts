import { fabric } from 'fabric';

export function initAligningGuidelines(canvas: fabric.Canvas) {
  const aligningLineOffset = 8; // Snap threshold (px)
  const aligningLineMargin = 4;
  const aligningLineWidth = 1;
  const aligningLineColor = '#f43f5e'; // Rose-500 for object-to-object alignment
  const canvasLineColor = '#06b6d4'; // Cyan-500 for canvas boundaries alignment
  
  let verticalLines: { x: number; y1: number; y2: number; isCanvas?: boolean }[] = [];
  let horizontalLines: { y: number; x1: number; x2: number; isCanvas?: boolean }[] = [];

  canvas.on('object:moving', (e) => {
    const activeObject = e.target;
    if (!activeObject) return;

    // Reset lines array
    verticalLines = [];
    horizontalLines = [];

    const activeBounds = activeObject.getBoundingRect(true);
    const activeWidth = activeBounds.width;
    const activeHeight = activeBounds.height;

    const activeLeft = activeBounds.left;
    const activeRight = activeBounds.left + activeWidth;
    const activeTop = activeBounds.top;
    const activeBottom = activeBounds.top + activeHeight;
    const activeCenterX = activeBounds.left + activeWidth / 2;
    const activeCenterY = activeBounds.top + activeHeight / 2;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const canvasObjects = canvas.getObjects();
    let snapX: number | null = null;
    let snapY: number | null = null;

    // Compare with nearby objects
    for (let i = 0; i < canvasObjects.length; i++) {
      const obj = canvasObjects[i];
      if (obj === activeObject || obj.excludeFromExport) continue;

      const objBounds = obj.getBoundingRect(true);
      const objWidth = objBounds.width;
      const objHeight = objBounds.height;

      const objLeft = objBounds.left;
      const objRight = objBounds.left + objWidth;
      const objTop = objBounds.top;
      const objBottom = objBounds.top + objHeight;
      const objCenterX = objBounds.left + objWidth / 2;
      const objCenterY = objBounds.top + objHeight / 2;

      // Vertical snaps (Object to Object)
      if (Math.abs(activeLeft - objLeft) < aligningLineOffset) {
        snapX = objLeft;
        verticalLines.push({ x: objLeft, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeLeft - objCenterX) < aligningLineOffset) {
        snapX = objCenterX;
        verticalLines.push({ x: objCenterX, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeLeft - objRight) < aligningLineOffset) {
        snapX = objRight;
        verticalLines.push({ x: objRight, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      }

      if (Math.abs(activeCenterX - objCenterX) < aligningLineOffset) {
        snapX = objCenterX - activeWidth / 2;
        verticalLines.push({ x: objCenterX, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeCenterX - objLeft) < aligningLineOffset) {
        snapX = objLeft - activeWidth / 2;
        verticalLines.push({ x: objLeft, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeCenterX - objRight) < aligningLineOffset) {
        snapX = objRight - activeWidth / 2;
        verticalLines.push({ x: objRight, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      }

      if (Math.abs(activeRight - objRight) < aligningLineOffset) {
        snapX = objRight - activeWidth;
        verticalLines.push({ x: objRight, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeRight - objCenterX) < aligningLineOffset) {
        snapX = objCenterX - activeWidth;
        verticalLines.push({ x: objCenterX, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      } else if (Math.abs(activeRight - objLeft) < aligningLineOffset) {
        snapX = objLeft - activeWidth;
        verticalLines.push({ x: objLeft, y1: Math.min(activeTop, objTop), y2: Math.max(activeBottom, objBottom) });
      }

      // Horizontal snaps (Object to Object)
      if (Math.abs(activeTop - objTop) < aligningLineOffset) {
        snapY = objTop;
        horizontalLines.push({ y: objTop, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeTop - objCenterY) < aligningLineOffset) {
        snapY = objCenterY;
        horizontalLines.push({ y: objCenterY, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeTop - objBottom) < aligningLineOffset) {
        snapY = objBottom;
        horizontalLines.push({ y: objBottom, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      }

      if (Math.abs(activeCenterY - objCenterY) < aligningLineOffset) {
        snapY = objCenterY - activeHeight / 2;
        horizontalLines.push({ y: objCenterY, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeCenterY - objTop) < aligningLineOffset) {
        snapY = objTop - activeHeight / 2;
        horizontalLines.push({ y: objTop, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeCenterY - objBottom) < aligningLineOffset) {
        snapY = objBottom - activeHeight / 2;
        horizontalLines.push({ y: objBottom, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      }

      if (Math.abs(activeBottom - objBottom) < aligningLineOffset) {
        snapY = objBottom - activeHeight;
        horizontalLines.push({ y: objBottom, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeBottom - objCenterY) < aligningLineOffset) {
        snapY = objCenterY - activeHeight;
        horizontalLines.push({ y: objCenterY, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      } else if (Math.abs(activeBottom - objTop) < aligningLineOffset) {
        snapY = objTop - activeHeight;
        horizontalLines.push({ y: objTop, x1: Math.min(activeLeft, objLeft), x2: Math.max(activeRight, objRight) });
      }
    }

    // Snapping to Canvas Center & Canvas Boundaries
    // Snap to Canvas Center (Vertical X line)
    if (Math.abs(activeCenterX - centerX) < aligningLineOffset) {
      snapX = centerX - activeWidth / 2;
      verticalLines.push({ x: centerX, y1: 0, y2: canvasHeight, isCanvas: true });
    }
    // Snap to Left Edge
    else if (Math.abs(activeLeft - 0) < aligningLineOffset) {
      snapX = 0;
      verticalLines.push({ x: 0, y1: 0, y2: canvasHeight, isCanvas: true });
    }
    // Snap to Right Edge
    else if (Math.abs(activeRight - canvasWidth) < aligningLineOffset) {
      snapX = canvasWidth - activeWidth;
      verticalLines.push({ x: canvasWidth, y1: 0, y2: canvasHeight, isCanvas: true });
    }

    // Snap to Canvas Center (Horizontal Y line)
    if (Math.abs(activeCenterY - centerY) < aligningLineOffset) {
      snapY = centerY - activeHeight / 2;
      horizontalLines.push({ y: centerY, x1: 0, x2: canvasWidth, isCanvas: true });
    }
    // Snap to Top Edge
    else if (Math.abs(activeTop - 0) < aligningLineOffset) {
      snapY = 0;
      horizontalLines.push({ y: 0, x1: 0, x2: canvasWidth, isCanvas: true });
    }
    // Snap to Bottom Edge
    else if (Math.abs(activeBottom - canvasHeight) < aligningLineOffset) {
      snapY = canvasHeight - activeHeight;
      horizontalLines.push({ y: canvasHeight, x1: 0, x2: canvasWidth, isCanvas: true });
    }

    // Apply Snapping coordinates
    if (snapX !== null) {
      if (activeObject.originX === 'center') {
        activeObject.set({ left: snapX + activeWidth / 2 });
      } else {
        activeObject.set({ left: snapX });
      }
    }
    if (snapY !== null) {
      if (activeObject.originY === 'center') {
        activeObject.set({ top: snapY + activeHeight / 2 });
      } else {
        activeObject.set({ top: snapY });
      }
    }

    if (snapX !== null || snapY !== null) {
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });

  // Render snap guidelines on top of viewport Container Context
  canvas.on('after:render', () => {
    const ctx = (canvas as any).contextContainer;
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = aligningLineWidth;

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

    // Draw vertical guidelines
    verticalLines.forEach(line => {
      ctx.beginPath();
      ctx.strokeStyle = line.isCanvas ? canvasLineColor : aligningLineColor;
      
      if (line.isCanvas) {
        ctx.setLineDash([4, 4]); // Dashed cyan for canvas bounds
      } else {
        ctx.setLineDash([]); // Solid rose for object alignments
      }

      const x = line.x * zoom + vpt[4];
      const y1 = line.y1 * zoom + vpt[5];
      const y2 = line.y2 * zoom + vpt[5];
      
      ctx.moveTo(x, y1 - aligningLineMargin);
      ctx.lineTo(x, y2 + aligningLineMargin);
      ctx.stroke();
    });

    // Draw horizontal guidelines
    horizontalLines.forEach(line => {
      ctx.beginPath();
      ctx.strokeStyle = line.isCanvas ? canvasLineColor : aligningLineColor;
      
      if (line.isCanvas) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }

      const y = line.y * zoom + vpt[5];
      const x1 = line.x1 * zoom + vpt[4];
      const x2 = line.x2 * zoom + vpt[4];

      ctx.moveTo(x1 - aligningLineMargin, y);
      ctx.lineTo(x2 + aligningLineMargin, y);
      ctx.stroke();
    });

    ctx.restore();
  });

  // Clear guide lines on mouse release
  canvas.on('mouse:up', () => {
    verticalLines = [];
    horizontalLines = [];
    canvas.requestRenderAll();
  });
}
