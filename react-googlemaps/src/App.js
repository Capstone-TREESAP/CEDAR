import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Polygon, Marker, InfoWindow } from 'google-maps-react';
import polygons from './random_polygons.json';
import Popup from './Popup.js'

const CARBON_RATE = 30.600; // tonnes/hectare/year
const SQUARE_METRE_TO_HECTARE = 10000; // m2/hectare
const TREE_RUNOFF_EFFECTS = 0.881 // L/m2/year

var collectedPolygons = []
function parsePolygons(polygons){
  
  for(var i = 0; i < polygons.features.length; i++) {

    var polygon = polygons.features[i].geometry.coordinates[0];
    var area = polygons.features[i].properties.area;
    var points = [];
    for(var point in polygon) {
      points.push(
        {
          lat: parseFloat(polygon[point][1]),
          lng: parseFloat(polygon[point][0])
        }
      )
    }
    collectedPolygons.push(
      {
        "id": i,
        "points": points,
        "area": area
      }
    )
  }
};
parsePolygons(polygons);

const mapStyles = {
  width: '100%',
  height: '100%'
};

export class MapContainer extends Component {
  state = {
    showInfoWindow: false,
    clickedLocation: null,
    marker: null,
    polygon: null
  };
  getCarbonSequesteredAnnually = (area) => area / SQUARE_METRE_TO_HECTARE * CARBON_RATE;
  getAvoidedRunoffAnnually = (area) => area * TREE_RUNOFF_EFFECTS;
  onMarkerClick = (props, m, e) =>
    this.setState({
      marker: m,
      showInfoWindow: true
  });
  onClose = props => {
    if (this.state.showInfoWindow) {
      this.setState({
        showInfoWindow: false,
        marker: null
      });
    }
  };
  handleClick = 
  (polygon, map, coords) => {
    this.setState({
      clickedLocation: coords,
      showInfoWindow: this.state.showInfoWindow,
      polygon: polygon
    })
  };
  displayPolygons = () => collectedPolygons
  .map(polygon => 
  <Polygon
    paths={polygon.points}
    key={polygon.id}
    onClick={(t, map, coords) => 
      this.handleClick(polygon, map, coords.latLng)
    }
    strokeColor="#014421"
    strokeOpacity={0.8}
    strokeWeight={2}
    fillColor="#014421"
    fillOpacity={0.65}
  />)
  render() {
    return (
      <Map
        google={this.props.google}
        zoom={14}
        style={mapStyles}
        initialCenter={
          {
            lat: 49.2367,
            lng: -123.2031
          }
        }
        >
        <Marker 
          onClick={this.onMarkerClick}
          visible={this.state.clickedLocation != null}
          position={this.state.clickedLocation}
        />
        <InfoWindow
          visible={this.state.showInfoWindow}
          marker={this.state.marker}
          onClose={this.onClose}
        >   
            <div>
              <h3>Area: {this.state.polygon ? this.state.polygon.area : null} m<sup>2</sup></h3>
              <h3> Carbon sequestered: {this.state.polygon ? this.getCarbonSequesteredAnnually(this.state.polygon.area).toFixed(2) : null} tonnes/year</h3>
              <h3> Avoided rainwater run-off: {this.state.polygon ? this.getAvoidedRunoffAnnually(this.state.polygon.area).toFixed(2) : null} litres/year</h3>
            </div>
            <button type="button">Report</button>
        </InfoWindow>
        {this.displayPolygons()}
      </Map>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: 'AIzaSyB8xmip8bwBsT_iqZ2-jBei-gwKNm5kR3A'
})(MapContainer);
