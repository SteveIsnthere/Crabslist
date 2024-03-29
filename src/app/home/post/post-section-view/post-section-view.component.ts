import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {MainService} from "../../../services/main.service";
import {apiEndPoint} from "../../../env";
import {MatDialog} from "@angular/material/dialog";
import {StatesService} from "../../../services/states.service";
import {rankingModes} from "../../../env";
import {neighbourhoods} from "../../../env";
import {LoadingPlaceholderComponent} from '../../../compoents/loading-placeholder/loading-placeholder.component';
import {PostSectionViewBaseComponent} from './post-section-view-base/post-section-view-base.component';

import {MatIcon} from '@angular/material/icon';
import {MatMenuTrigger, MatMenu, MatMenuItem} from '@angular/material/menu';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {RouterLink} from "@angular/router";
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {FormsModule} from "@angular/forms";
import {MatCardTitle} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-post-section-view',
  templateUrl: './post-section-view.component.html',
  styleUrls: ['./post-section-view.component.scss'],
  standalone: true,
  imports: [MatButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, PostSectionViewBaseComponent, LoadingPlaceholderComponent, MatMiniFabButton, RouterLink, MatSlider, FormsModule, MatSliderThumb, MatCardTitle, MatSliderRangeThumb, MatDivider]
})

export class PostSectionViewComponent implements OnInit {
  postIDs: number[] = [];

  loading = true;
  empty = false;
  maxPrice: number = 6000;
  minPrice: number = 300;
  priceCeil: number = 0;
  priceFloor: number = 0;
  selectedRankingMode: string[] = rankingModes[0];
  neighbourhoodSelected = neighbourhoods[0];
  canShowReloadButton = false;
  showReloadButton = false;
  showPostSection = true;
  setTimeRangeTimeout: any;
  // isChecked = false;
  cacheKey: string = 'post-ids-cache';
  showRequestMorePostsButton = false;


  constructor(public http: HttpClient, public auth: AuthService, public main: MainService, public dialog: MatDialog, public states: StatesService) {
    this.priceCeil = this.maxPrice;
    this.priceFloor = this.minPrice;
    this.main.appReopenEvent.subscribe(() => {
      if (this.canShowReloadButton) {
        this.showReloadButton = true;
      }
    })
    this.main.postReloadEvent.subscribe(() => {
      this.fetchPosts();
    })
  }

  ngOnInit(): void {
    this.showReloadButton = false;
    this.canShowReloadButton = false;
    this.loading = true;
    this.loadSettingsFromLocalStorage();

    // subscribe to the resize event

    if (this.states.loadedUp) {
      this.loadPostIDsFromLocalStorage();
      this.showReloadButton = true;
      return;
    }

    this.fetchPosts();
  }

  fetchPosts() {
    this.showReloadButton = false;
    this.loading = true;
    this.canShowReloadButton = false;
    let searchTerm = this.main.searchTerms;
    if (searchTerm == '') {
      searchTerm = 'null';
    }
    this.http.post<number[]>(apiEndPoint + '/post/get_recommended_post_ids/' + this.selectedRankingMode[0] + '/' + this.neighbourhoodSelected + '/' + this.priceFloor + '/' + this.priceCeil + '/' + this.auth.selfUserID, searchTerm).subscribe((data) => {
      if (data != this.postIDs) {
        this.loading = false;
        this.postIDs = data;
        this.savePostIDsToLocalStorage();
      }

      this.empty = this.postIDs.length == 0;
      setTimeout(() => {
        this.canShowReloadButton = true;
      }, 15000);
    })
  }

  fetchMorePosts() {
    this.showReloadButton = false;
    this.loading = true;
    this.canShowReloadButton = false;
    this.http.get<number[]>(apiEndPoint + '/post/get_extra_post_ids/' + this.auth.selfUserID).subscribe((data) => {
      if (data != this.postIDs) {
        this.loading = false;
        this.postIDs = data;
        this.savePostIDsToLocalStorage();
      }

      this.empty = this.postIDs.length == 0;
      setTimeout(() => {
        this.canShowReloadButton = true;
      }, 15000);
    })
  }

  loadSettingsFromLocalStorage() {
    // first check if the local storage is empty
    let storedRankingMode = localStorage.getItem('rankingMode');
    let storedNeighbourhood = localStorage.getItem('neighbourhood');
    let storedPriceCeil = localStorage.getItem('priceCeil');
    let storedPriceFloor = localStorage.getItem('priceFloor');

    if (storedRankingMode != null && rankingModes.includes(JSON.parse((storedRankingMode)))) this.selectedRankingMode = JSON.parse(storedRankingMode);
    if (storedNeighbourhood != null && neighbourhoods.includes(storedNeighbourhood)) this.neighbourhoodSelected = storedNeighbourhood;
    if (storedPriceCeil != null && parseInt(storedPriceCeil) <= this.priceCeil) this.priceCeil = parseInt(storedPriceCeil);
    if (storedPriceFloor != null && parseInt(storedPriceFloor) >= this.priceFloor) this.priceFloor = parseInt(storedPriceFloor);
  }

  saveSettingsToLocalStorage() {
    localStorage.setItem('neighbourhood', this.neighbourhoodSelected);
    localStorage.setItem('rankingMode', JSON.stringify(this.selectedRankingMode));
    localStorage.setItem('priceCeil', this.priceCeil.toString());
    localStorage.setItem('priceFloor', this.priceFloor.toString());
    this.fetchPosts();
  }

  refresh() {
    // reload the site
    this.fetchPosts()
  }

  private loadPostIDsFromLocalStorage(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      this.postIDs = JSON.parse(cachedData);
      this.loading = false;
    } else {
      this.fetchPosts();
    }
  }

  private savePostIDsToLocalStorage(): void {
    localStorage.setItem(this.cacheKey, JSON.stringify(this.postIDs));
  }

  setPriceRangeDebounced() {
    clearTimeout(this.setTimeRangeTimeout);
    this.setTimeRangeTimeout = setTimeout(() => {
      this.saveSettingsToLocalStorage();
    }, 200);
  }

  setRankingMode(mode: string[]) {
    this.selectedRankingMode = mode;
    this.saveSettingsToLocalStorage()
  }

  setNeighbourhood(neighbourhood: string) {
    this.neighbourhoodSelected = neighbourhood;
    this.saveSettingsToLocalStorage()
  }

  protected readonly rankingModes = rankingModes;
  protected readonly neighbourhoods = neighbourhoods;
}
