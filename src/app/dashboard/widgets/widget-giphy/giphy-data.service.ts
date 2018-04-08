import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GiphyImage } from './interfaces/giphy-image';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

@Injectable()
export class GiphyDataService {
  private GIPHY_API_KEY = 'dc6zaTOxFJmzC';
  private timer = Observable.interval(600000).startWith(0); // 10 minutes + start now
  private offset_max = 100;
  private q: string;
  private nbRestartIfNoData = 0;

  constructor(private http: HttpClient) {}

  public getImages(q: string): Observable<GiphyImage[]> {
    this.q = q;
    return this.timer.switchMap(() => this.getGiphyImages(q));
  }

  private mapDataFromApi(response: any): GiphyImage[] {
    this.offset_max = response.pagination.total_count - 100;

    if (0 === response.data.length && this.nbRestartIfNoData < 2) {
      this.nbRestartIfNoData++;
      this.getGiphyImages(this.q);
    }

    this.nbRestartIfNoData = 0;

    const images = [];
    for (let _i = 0; _i < response.data.length; _i++) {
      const image: GiphyImage = {
        url: response.data[_i].images.fixed_height.url,
        height: response.data[_i].images.fixed_height.height,
        width: response.data[_i].images.fixed_height.width
      };

      // only landscape image
      if (image.width > image.height) {
        images.push(image);
      }
    }
    return images;
  }

  private getGiphyImages(q: string): Observable<GiphyImage[]> {
    const params = new HttpParams()
      .set('q', q)
      .set('limit', '100')
      .set('rating', 'g')
      .set('offset', (Math.floor(Math.random() * this.offset_max) + 1).toString())
      .set('api_key', this.GIPHY_API_KEY);

    return this.http
      .get('//api.giphy.com/v1/gifs/search', { params: params })
      .map(response => this.mapDataFromApi(response));
  }
}
