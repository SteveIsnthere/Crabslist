import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {apiEndPoint} from "../env";
import {AuthService} from "../services/auth.service";
import {TextEditViewComponent} from "./text-edit-view/text-edit-view.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  groupIDs: number[] = [];
  groupWithUnreadIDs: number[] = [];
  editMode: boolean = false;

  constructor(public http: HttpClient, public auth: AuthService, private _bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {
    this.http.get<number[]>(apiEndPoint + '/group/get_joined_groups/' + this.auth.selfUserID).subscribe((data) => {
      this.groupIDs = data;
      this.http.get<number[]>(apiEndPoint + '/group/get_joined_groups_with_unread_msg/' + this.auth.selfUserID).subscribe((data) => {
        this.groupWithUnreadIDs = data;
      })
    })
  }

  createGroup(): void {
    const bottomSheetRef = this._bottomSheet.open(TextEditViewComponent, {data: "Please enter the group name"});
    bottomSheetRef.afterDismissed().subscribe(groupName => {
      if (typeof groupName != 'string') {
        console.log('groupName is not a string')
        return
      }

      if (groupName.length == 0) {
        console.log('groupName is empty')
        return
      }

      this.http.get(apiEndPoint + '/group/create_new/' + this.auth.selfUserID + '/' + groupName).subscribe(() => {
        this.ngOnInit();
      })
    });
  }

  isGroupUnread(groupID: number): boolean {
    return this.groupWithUnreadIDs.includes(groupID);
  }

  leaveGroup(groupID: number) {
    this.http.get(apiEndPoint + '/group/leave/' + groupID + '/' + this.auth.selfUserID).subscribe(() => {
      this.ngOnInit();
    })
  }
}
