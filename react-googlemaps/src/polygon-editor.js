
export class PolygonEditor {

    static getPointsFromPolygon(polygon) {
        return polygon.overlay.getPath().getArray();
    }

    static getPointsFromRectangle(props, rectangle) {
        const {google} = props

        let bounds = JSON.parse(JSON.stringify(rectangle.overlay.getBounds()))
        let points = [
            new google.maps.LatLng(bounds["south"], bounds["east"]),
            new google.maps.LatLng(bounds["south"], bounds["west"]),
            new google.maps.LatLng(bounds["north"], bounds["west"]),
            new google.maps.LatLng(bounds["north"], bounds["east"])
        ]
        return points
    }

    static getPolygonArea(props, points) {
        const {google} = props
        return +google.maps.geometry.spherical.computeArea(points).toFixed(2);
    }

    static getPolygonGeoJSON(points) {
        let jsonPoints = [];
        for (var i in points) {
            jsonPoints.push(
                [points[i].lat(), points[i].lng()]
            )
        }

        let geojson = {
            "type": "Polygon",
            "coordinates": [jsonPoints]
        }

        return JSON.stringify(geojson)
    }

    static createEditablePolygon(props, polygon, map) {   
        const {google} = props

        const polygonEdit = new google.maps.Polygon({
            draggable: true,
            editable: true,
            fillColor: "#014421",
            fillOpacity: 0.65,
            paths: polygon.points,
            strokeColor: "#014421",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: map
        })
    
        return polygonEdit;
    }
      
    static getPolygonEdits(editablePolygon) {
        let path = editablePolygon.getPath();
    
        let points = [];
        for (var i = 0; i < path.length; i++) {
            points.push(path.getAt(i))
        }
    
        return points
    }
      
    static removeEditablePolygon(editablePolygon) {
        editablePolygon.setMap(null)
    }
}