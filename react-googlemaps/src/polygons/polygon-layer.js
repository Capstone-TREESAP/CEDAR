import { PolygonEditor } from './polygon-editor';

const CUSTOM_KEY = "C";
var customKeyNum = 0;

export class PolygonLayer {
  constructor(polygonList, props, type) {
    this.props = props;
    this.polygon = null;
    this.editablePolygon = null;
    this.type = type;
    this.polygons = this.parsePolygons(polygonList, type);
  }

  selectPolygon(polygon) {
    this.polygon = polygon;
  }

  parsePolygons(polygons, type){
    let collectedPolygons = [];
    for (var i = 0; i < polygons.features.length; i++) {
      //TODO this is broken for polygons with inner rings
      for (var j = 0; j < polygons.features[i].geometry.coordinates.length; j++) {
        //TODO temp fix so it stops yelling: just ignore inner rings
        if (j > 0 && polygons.features[i].geometry.type == "Polygon") {
          continue;
        }

        if (polygons.features[i].geometry.type == "MultiPolygon") {
          var coordinates = polygons.features[i].geometry.coordinates[j][0];
        } else {
          var coordinates = polygons.features[i].geometry.coordinates[j];
        }
        var points = PolygonEditor.backwardsGeoJSONToJSONCoords(coordinates);
        var area = PolygonEditor.getPolygonArea(this.props, points.map(
          point => PolygonEditor.pointToLatLng(this.props, point)
        ));
        var key = null;
        if (type == "tree") {
          if (polygons.features[i].properties.id) {
            key = polygons.features[i].properties.id;
          } else {
            key = customKeyNum++;
          }
        } else {
          key = polygons.features[i].properties["BLDG_UID"];
        }
        if (polygons.features[i].geometry.type == "MultiPolygon") {
          key += "." + j;
        }

        var polygon = {
          // update this when lidar has ids added
          "key": key,
          "points": points,
          "area": area,
          "editable": false,
          "type": type,
        };
        if (type == "building") {
          polygon.address = polygons.features[i].properties["PRIMARY_ADDRESS"];
          polygon.name = polygons.features[i].properties["NAME"];
          polygon.neighbourhood = polygons.features[i].properties["NEIGHBOURHOOD"];
          polygon.occupied_date = polygons.features[i].properties["OCCU_DATE"];
          polygon.max_floors = polygons.features[i].properties["MAX_FLOORS"];
        }
        collectedPolygons.push(polygon);
      }
    }
    return collectedPolygons;
  }

  makePolygonEditable = (polygon, map) => {
    let index = this.polygons.findIndex(element => element === polygon);
    this.polygons.splice(index, 1);
    this.editablePolygon = PolygonEditor.createEditablePolygon(this.props, polygon, map, "#014421", 0);
  }

  makeCurrentPolygonUneditable = () => {
    if (this.editablePolygon == null) {
      return;
    }

    let newPoints = PolygonEditor.getPolygonEdits(this.editablePolygon);
    let newArea = PolygonEditor.getPolygonArea(this.props, newPoints);
    PolygonEditor.removeEditablePolygon(this.editablePolygon);

    this.polygon.points = PolygonEditor.googleToJSONCoords(newPoints);
    this.polygon.area = newArea;
    this.polygons.push(this.polygon);
    this.editablePolygon = null;
  }

  deletePolygon = (polygon) => {
    let index = this.polygons.findIndex(element => element === polygon);
    this.polygons.splice(index, 1);
    this.polygon = null;
  }

  addPolygon = (polygon) => {
    const {google} = this.props;
    var points;

    if (polygon.type == google.maps.drawing.OverlayType.POLYGON) {
      points = PolygonEditor.getPointsFromPolygon(polygon);
    } else if (polygon.type == google.maps.drawing.OverlayType.RECTANGLE) {
      points = PolygonEditor.getPointsFromRectangle(this.props, polygon);
    }

    let area = PolygonEditor.getPolygonArea(this.props, points);

    this.polygons.push(
      {
        "key": PolygonEditor.createKey(CUSTOM_KEY, customKeyNum++),
        "points": PolygonEditor.googleToJSONCoords(points),
        "area": area,
        "editable": false,
      }
    );
    polygon.overlay.setMap(null);
  }

  containsPolygon(polygon) {
    for (var i = 0; i < this.polygons.length; i++) {
      if (polygon === this.polygons[i]) {
        return true;
      }
    }
    return false;
  }
}
