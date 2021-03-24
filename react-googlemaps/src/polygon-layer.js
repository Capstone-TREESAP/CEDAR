import { PolygonEditor } from './polygon-editor'

export class PolygonLayer {
    constructor(polygonList, props, map) {
        this.props = props
        this.map = map
        this.polygon = null
        this.editablePolygon = null

        this.polygons = this.parsePolygons(polygonList);
    }

    selectPolygon(polygon) {
        this.polygon = polygon
    }

    parsePolygons(polygons){
        let collectedPolygons = [];
    
        for(var i = 0; i < polygons.features.length; i++) {
      
            var coordinates = polygons.features[i].geometry.coordinates[0];
            var points = PolygonEditor.backwardsGeoJSONToJSONCoords(coordinates)
            var area = PolygonEditor.getPolygonArea(this.props, points.map(
                point => PolygonEditor.pointToLatLng(this.props, point)
            ))
            collectedPolygons.push(
                {
                    "id": i, //TODO
                    "points": points,
                    "area": area,
                    "editable": false
                }
            )
        }
    
        return collectedPolygons;
    };

    makePolygonEditable = (polygon) => {
        let index = this.polygons.findIndex(element => element === polygon)
        this.polygons.splice(index, 1);
        this.editablePolygon = PolygonEditor.createEditablePolygon(this.props, polygon, this.map);
    }

    makeCurrentPolygonUneditable = () => {
        if (this.editablePolygon == null) {
            return
        }

        let newPoints = PolygonEditor.getPolygonEdits(this.editablePolygon)
        let newArea = PolygonEditor.getPolygonArea(this.props, newPoints)
        PolygonEditor.removeEditablePolygon(this.editablePolygon)

        this.polygon.points = newPoints
        this.polygon.area = newArea
        this.polygons.push(this.polygon)
        this.editablePolygon = null
    }
    
    deletePolygon = (polygon) => {
        let index = this.polygons.findIndex(element => element === polygon)
        this.polygons.splice(index, 1)
        this.polygon = null
    }

    addPolygon = (polygon) => {
        const {google} = this.props
        var points;

        if (polygon.type == google.maps.drawing.OverlayType.POLYGON) {
            points = PolygonEditor.getPointsFromPolygon(polygon)
        } else if (polygon.type == google.maps.drawing.OverlayType.RECTANGLE) {
            points = PolygonEditor.getPointsFromRectangle(this.props, polygon)
        }

        let area = PolygonEditor.getPolygonArea(this.props, points)
        //TODO: should we use UUIDs?
        // or use some system where first x bits represents whether it's frontend created or not,
        // then just increment up for the rest of the bits
        //This depends on the broader question of how we create IDs for polygons in the backend,
        // so I'm leaving it for now.
        let id = this.polygons.length

        this.polygons.push(
            {
                "id": id,
                "points": PolygonEditor.googleToJSONCoords(points),
                "area": area,
                "editable": false
            }
        )

        polygon.overlay.setMap(null);
        
    }

    containsPolygon(polygon) {
        for (var i = 0; i < this.polygons.length; i++) {
            if (polygon === this.polygons[i]) {
                return true
            }
        }

        return false
    }
}