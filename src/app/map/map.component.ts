import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  private startPoint: any = null;
  private endPoint: any = null;
  private routingControl: any = null;
  private routeLayer: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        const map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        import('leaflet-routing-machine').then(() => {
          map.on('click', (e: any) => {
            if (!this.startPoint) {
              this.startPoint = e.latlng;
              L.marker(this.startPoint)
                .addTo(map)
                .bindPopup('Inicio')
                .openPopup();
            } else if (!this.endPoint) {
              this.endPoint = e.latlng;
              L.marker(this.endPoint)
                .addTo(map)
                .bindPopup('Destino')
                .openPopup();

              // Calcular y dibujar la ruta
              this.calculateAndDrawRoute(L, map);
            } else {
              // Si ya se seleccionaron ambos puntos, reiniciar para seleccionar de nuevo
              map.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                  map.removeLayer(layer);
                }
              });
              this.startPoint = e.latlng;
              this.endPoint = null;
              L.marker(this.startPoint)
                .addTo(map)
                .bindPopup('Inicio')
                .openPopup();

              if (this.routingControl) {
                map.removeControl(this.routingControl);
                this.routingControl = null;
              }
              if (this.routeLayer) {
                map.removeLayer(this.routeLayer);
                this.routeLayer = null;
              }
            }
          });
        });
      });
    }
  }

  private calculateAndDrawRoute(L: any, map: any): void {
    const apiKey = '5b3ce3597851110001cf6248926a8321b6eb4f09903425286324ce7a';
    const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${this.startPoint.lng},${this.startPoint.lat}&end=${this.endPoint.lng},${this.endPoint.lat}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos recibidos:', data); // Debugging line

        if (data.features && data.features.length > 0) {
          const coordinates = data.features[0].geometry.coordinates.map(
            (coord: any) => [coord[1], coord[0]]
          );

          if (this.routeLayer) {
            map.removeLayer(this.routeLayer);
          }

          this.routeLayer = L.polyline(coordinates, { color: 'blue' }).addTo(
            map
          );
          map.fitBounds(this.routeLayer.getBounds());
          // Mostrar instrucciones en el mapa
          this.showInstructions(
            data.features[0].properties.segments[0].steps,
            L,
            map
          );
        } else {
          console.error('No se encontraron rutas en la respuesta:', data);
        }
      })
      .catch((error) => {
        console.error('Error al calcular la ruta:', error);
      });
  }
  private showInstructions(steps: any[], L: any, map: any): void {
    let instructionsHtml = '<div><h4>Instrucciones de la ruta:</h4><ul>';

    steps.forEach((step: any) => {
      instructionsHtml += `<li>${step.instruction}</li>`;
    });

    instructionsHtml += '</ul></div>';

    const instructionsPopup = L.popup()
      .setLatLng(this.endPoint)
      .setContent(instructionsHtml)
      .openOn(map);
  }
}
