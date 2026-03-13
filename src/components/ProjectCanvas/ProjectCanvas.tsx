import './ProjectCanvas.css';

import { useCallback } from 'react';

import { useProject } from '../../hooks/useProject';
import type { Wire } from '../../types/wire';
import { GRID } from '../../utils/gridUtils';
import { snapToGrid } from '../../utils/gridUtils';
import { splitSegmentWaypoints } from '../../utils/wireRouting';
import { GridCanvas } from '../GridCanvas';
import { ProjectCanvasComponents } from './ProjectCanvasComponents';
import { ProjectCanvasOverlay } from './ProjectCanvasOverlay';
import { ProjectCanvasSidebars } from './ProjectCanvasSidebars';
import { ProjectCanvasWires } from './ProjectCanvasWires';
import { useConnectedWires } from './useConnectedWires';
import { useProjectCanvasHandlers } from './useProjectCanvasHandlers';
import { useProjectCanvasState } from './useProjectCanvasState';
import { useWireEndpoints } from './useWireEndpoints';

export function ProjectCanvas() {
  const {
    project,
    placeComponent,
    movePlacedComponent,
    removePlacedComponent,
    setPlacedComponentRotation,
    updatePlacedComponentInstance,
    addWire,
    removeWire,
    updateWireWaypoints,
    updateWireColor,
    addColor,
    removeColor,
  } = useProject();

  const state = useProjectCanvasState();

  const handlers = useProjectCanvasHandlers({
    project,
    containerRef: state.containerRef,
    trashRef: state.trashRef,
    justSelectedRef: state.justSelectedRef,
    justDraggedWireRef: state.justDraggedWireRef,
    isDrawingWireRef: state.isDrawingWireRef,
    panDragRef: state.panDragRef,
    dropPreview: state.dropPreview,
    setDropPreview: state.setDropPreview,
    moveState: state.moveState,
    setMoveState: state.setMoveState,
    isOverTrash: state.isOverTrash,
    setIsOverTrash: state.setIsOverTrash,
    selectedInstanceId: state.selectedInstanceId,
    setSelectedInstanceId: state.setSelectedInstanceId,
    contextMenu: state.contextMenu,
    setContextMenu: state.setContextMenu,
    wireCtxMenu: state.wireCtxMenu,
    setWireCtxMenu: state.setWireCtxMenu,
    selectedWireId: state.selectedWireId,
    setSelectedWireId: state.setSelectedWireId,
    wireSegDrag: state.wireSegDrag,
    setWireSegDrag: state.setWireSegDrag,
    waypointDrag: state.waypointDrag,
    setWaypointDrag: state.setWaypointDrag,
    pan: state.pan,
    setPan: state.setPan,
    setIsPanning: state.setIsPanning,
    wireInProgress: state.wireInProgress,
    setWireInProgress: state.setWireInProgress,
    placeComponent,
    movePlacedComponent,
    removePlacedComponent,
    addWire,
    removeWire,
    updateWireWaypoints,
  });

  const { getWireEndpoints } = useWireEndpoints(
    project,
    handlers.findComponent
  );

  const handleGhostClick = useCallback(
    (wireId: string, segmentIndex: number, ghostX: number, ghostY: number) => {
      if (state.isDrawingWireRef.current) return;
      const wire = project?.wires?.find((w: Wire) => w.id === wireId);
      if (!wire) return;
      const eps = getWireEndpoints(wire);
      if (!eps) return;
      const newWaypoints = splitSegmentWaypoints(
        wire.waypoints,
        segmentIndex,
        eps.startPt,
        eps.endPt,
        ghostX,
        ghostY,
        snapToGrid
      );
      updateWireWaypoints(wireId, newWaypoints);
    },
    [project, updateWireWaypoints, state.isDrawingWireRef, getWireEndpoints]
  );

  const placedComponents = project?.placedComponents ?? [];
  const selectedPlaced = state.selectedInstanceId
    ? placedComponents.find(p => p.instanceId === state.selectedInstanceId)
    : null;
  const selectedComp = selectedPlaced
    ? handlers.findComponent(
        selectedPlaced.libraryId,
        selectedPlaced.componentId
      )
    : null;

  const connectedWires = useConnectedWires(
    project,
    state.selectedInstanceId,
    selectedComp ?? null
  );

  if (!project) return null;

  const isMoving = state.moveState !== null;
  const hiddenInstanceId = state.isOverTrash
    ? state.moveState?.instanceId
    : null;

  /* eslint-disable react-hooks/refs -- False positive: state object contains both refs and useState values.
     ESLint incorrectly flags state values as ref accesses. All state.* accessed during render are
     legitimate useState values, not refs. Refs (containerRef, trashRef) are correctly used only via ref prop. */
  return (
    <div
      ref={state.containerRef}
      className={[
        'project-canvas',
        isMoving || state.wireSegDrag ? 'project-canvas--moving' : '',
        state.isPanning ? 'project-canvas--panning' : '',
        state.wireInProgress ? 'project-canvas--drawing-wire' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={handlers.handleDragOver}
      onDragLeave={handlers.handleDragLeave}
      onDrop={handlers.handleDrop}
      onMouseDown={handlers.handleCanvasMouseDown}
      onMouseMove={handlers.handleMouseMove}
      onMouseUp={handlers.commitMove}
      onMouseLeave={handlers.commitMove}
      onClick={handlers.handleCanvasClick}
      onContextMenu={e => e.preventDefault()}
    >
      <GridCanvas
        id="project-grid"
        grid={GRID}
        panX={state.pan.x}
        panY={state.pan.y}
      >
        <ProjectCanvasWires
          wires={project.wires ?? []}
          selectedWireId={state.selectedWireId}
          wireSegDrag={state.wireSegDrag}
          waypointDrag={state.waypointDrag}
          wireInProgress={state.wireInProgress}
          getWireEndpoints={getWireEndpoints}
          onWireClick={handlers.handleWireClick}
          onSegmentMouseDown={handlers.handleSegmentMouseDown}
          onWaypointMouseDown={handlers.handleWaypointMouseDown}
          onWaypointClick={handlers.handleWaypointClick}
          onGhostClick={handleGhostClick}
          onSegmentContextMenu={handlers.handleSegmentContextMenu}
          onWaypointContextMenu={handlers.handleWaypointContextMenu}
        />

        <ProjectCanvasComponents
          placedComponents={placedComponents}
          dropPreview={state.dropPreview}
          moveState={state.moveState}
          hiddenInstanceId={hiddenInstanceId ?? null}
          selectedInstanceId={state.selectedInstanceId}
          findComponent={handlers.findComponent}
          onComponentMouseDown={handlers.startMove}
          onComponentContextMenu={handlers.handleContextMenu}
          onPinDown={handlers.handlePinDown}
        />
      </GridCanvas>

      <ProjectCanvasSidebars
        project={project}
        selectedInstanceId={state.selectedInstanceId}
        selectedPlaced={selectedPlaced ?? null}
        selectedComp={selectedComp ?? null}
        selectedWireId={state.selectedWireId}
        connectedWires={connectedWires}
        getWireEndpoints={getWireEndpoints}
        onRotationChange={(instanceId, rotation) =>
          setPlacedComponentRotation(instanceId, rotation as 0 | 90 | 180 | 270)
        }
        onAliasChange={(instanceId, alias) =>
          updatePlacedComponentInstance(instanceId, { alias })
        }
        onLabelPositionChange={(instanceId, position) =>
          updatePlacedComponentInstance(instanceId, { labelPosition: position })
        }
        onWireColorChange={(wireId, color) =>
          updateWireColor(wireId, color || '')
        }
        onAddColor={addColor}
        onRemoveColor={removeColor}
        onWireClick={wireId => {
          state.setSelectedInstanceId(null);
          state.setSelectedWireId(wireId);
        }}
        onCloseComponent={() => state.setSelectedInstanceId(null)}
        onCloseWire={() => state.setSelectedWireId(null)}
      />

      <ProjectCanvasOverlay
        project={project}
        placedComponents={placedComponents}
        dropPreview={state.dropPreview}
        wireInProgress={state.wireInProgress}
        isMoving={isMoving}
        isOverTrash={state.isOverTrash}
        pan={state.pan}
        contextMenu={state.contextMenu}
        wireCtxMenu={state.wireCtxMenu}
        trashRef={state.trashRef}
        getWireEndpoints={getWireEndpoints}
        onCancelWire={() => state.setWireInProgress(null)}
        onResetPan={() => state.setPan({ x: 0, y: 0 })}
        onCloseContextMenu={() => state.setContextMenu(null)}
        onCloseWireCtxMenu={() => state.setWireCtxMenu(null)}
        onSetRotation={setPlacedComponentRotation}
        onRemovePlacedComponent={removePlacedComponent}
        onSetSelectedInstanceId={state.setSelectedInstanceId}
        onUpdateWireWaypoints={updateWireWaypoints}
        onRemoveWire={removeWire}
        onSetSelectedWireId={state.setSelectedWireId}
      />
    </div>
  );
  /* eslint-enable react-hooks/refs */
}
