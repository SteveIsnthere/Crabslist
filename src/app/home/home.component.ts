import {Component, OnInit} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {MainService} from "../services/main.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {NotificationViewComponent} from "./notification-view/notification-view.component";
import {HttpClient} from "@angular/common/http";
import {apiEndPoint} from "../env";
import {MatDialog} from "@angular/material/dialog";
import {UserSetUpComponent} from "../user/user-set-up/user-set-up.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  haveUnreadMsg: boolean = false;

  constructor(public http: HttpClient, public auth: AuthService, public main: MainService, private _bottomSheet: MatBottomSheet, private dialog: MatDialog) {
  }

  openNotificationView() {
    this.http.get<any>(apiEndPoint + '/others/visit_notification/' + this.auth.selfUserID).subscribe(() => {
    })
    this._bottomSheet.open(NotificationViewComponent);
  }

  ngOnInit(): void {
    this.http.get<boolean>(apiEndPoint + '/group/have_unread_msg/' + this.auth.selfUserID).subscribe((data) => {
      this.haveUnreadMsg = data;
    })
  }

  userSetUp() {
    this.dialog.open(UserSetUpComponent);
  }
}
