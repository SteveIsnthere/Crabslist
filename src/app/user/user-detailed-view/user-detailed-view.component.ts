import {Component, OnInit} from '@angular/core';
import {UserComponent} from "../user.component";
import {apiEndPoint} from "../../env";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TextEditViewComponent} from "../../chat/text-edit-view/text-edit-view.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {UserSetUpComponent} from "../user-set-up/user-set-up.component";
import {MainService} from "../../services/main.service";
import {UserInfoCachingService} from "../../services/user-info-caching.service";
import { LoadingPlaceholderComponent } from '../../compoents/loading-placeholder/loading-placeholder.component';
import { PostSectionViewBaseComponent } from '../../home/post/post-section-view/post-section-view-base/post-section-view-base.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { SimpleFigureComponent } from '../../simple-figure/simple-figure.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-user-detailed-view',
    templateUrl: './user-detailed-view.component.html',
    styleUrls: ['./user-detailed-view.component.scss'],
    standalone: true,
    imports: [NgClass, SimpleFigureComponent, MatDivider, MatButton, MatIcon, RouterLink, PostSectionViewBaseComponent, LoadingPlaceholderComponent]
})
export class UserDetailedViewComponent extends UserComponent implements OnInit {
  userDescription = 'loading...';
  isFriend = false;
  friendRequestSent = false;
  showClippedFigure = true
  postsLoaded = false;
  xp = 0;
  isLandlord = false;
  creditScore = 0;
  neighborhood = '';
  postIDs: number[] = [];

  constructor(http: HttpClient, cache: UserInfoCachingService, public route: ActivatedRoute, public auth: AuthService, private main: MainService, private dialogRef: MatDialog, private _snackBar: MatSnackBar, private _bottomSheet: MatBottomSheet, private dialog: MatDialog) {
    super(http, cache);
  }

  override ngOnInit(): void {
    this.dialogRef.closeAll();
    this.route.params.subscribe(params => {
      this.userID = params['id'];
    });
    super.ngOnInit();
    this.http.get<boolean>(apiEndPoint + '/user/friend_status/' + this.auth.selfUserID + '/' + this.userID).subscribe((data) => {
      this.isFriend = data;
    });
    this.http.get<string>(apiEndPoint + '/user/description/' + this.userID).subscribe((data) => {
      this.userDescription = data;
    });
    this.http.get<number[]>(apiEndPoint + '/post/get_post_ids_of_user/' + this.userID).subscribe((data) => {
      this.postIDs = data;
      this.postsLoaded = true;
    })
    this.http.get<number>(apiEndPoint + '/user/experience/' + this.userID).subscribe((data) => {
      this.xp = data;
    })
    this.http.get<boolean>(apiEndPoint + '/user/is_landlord/' + this.userID).subscribe((data) => {
      this.isLandlord = data;
    })
    this.http.get<number>(apiEndPoint + '/user/credit_score/' + this.userID).subscribe((data) => {
      this.creditScore = data;
    })
    this.http.get<string>(apiEndPoint + '/user/neighbourhood/' + this.userID).subscribe((data) => {
      this.neighborhood = data;
    })

    this.main.postReloadEvent.subscribe(() => {
      this.ngOnInit();
    })
  }

  sendFriendRequest() {
    this.http.get(apiEndPoint + '/user/create_friend_request/' + this.auth.selfUserID + '/' + this.userID, {}).subscribe(() => {
      this.friendRequestSent = true;
      this.openSnackBar('Friend request sent', 'OK');
    })
  }

  removeFriend() {
    this.http.get(apiEndPoint + '/user/remove_friend/' + this.auth.selfUserID + '/' + this.userID, {}).subscribe(() => {
      this.isFriend = false;
      this.openSnackBar('Friend removed', 'OK');
    })
  }

  sendDM() {
    const bottomSheetRef = this._bottomSheet.open(TextEditViewComponent, {data: 'Enter your message'});
    bottomSheetRef.afterDismissed().subscribe(textContent => {
      if (typeof textContent != 'string') {
        console.log('Text content is not a string')
        return
      }
      if (textContent.length == 0) {
        console.log('Text content is empty')
        return
      }
      this.http.post(apiEndPoint + '/user/dm/' + this.auth.selfUserID + '/' + this.userID, textContent).subscribe(() => {
        this.openSnackBar('DM sent', 'OK');
      })
    });
  }

  userSetUp() {
    this.dialog.open(UserSetUpComponent);
  }

  logout() {
    this.auth.logout();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {duration: 4000});
  }
}
