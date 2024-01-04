import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {apiEndPoint} from "../../env";
import {dummyGroupEssentialData, GroupEssentialData} from "./GroupEssentialData";
import {GroupBasicInfoCachingService} from "../../services/group-basic-info-caching.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {InviteViewComponent} from "./invite-view/invite-view.component";
import {GroupMembersViewComponent} from "./group-members-view/group-members-view.component";
import {GroupInfoViewComponent} from "./group-info-view/group-info-view.component";

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})

export class GroupComponent implements OnInit {
  @Input() groupID: number = 0;
  @Input() selfID: number = 0;
  @Input() unread = false;
  groupEssentialData: GroupEssentialData = dummyGroupEssentialData();
  groupMembersCount: number = 0;
  lastMessage: string = '';

  constructor(public http: HttpClient, private cache: GroupBasicInfoCachingService, private _bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {
    let cachedData = this.cache.get(this.groupID);
    this.http.get<number>(apiEndPoint + '/group/get_numbers_of_members/' + this.groupID).subscribe((data) => {
      this.groupMembersCount = data;
    })
    this.http.get<string>(apiEndPoint + '/group/get_time_since_last_message/' + this.groupID).subscribe((data) => {
      this.lastMessage = data;
    })
    if (cachedData) {
      this.groupEssentialData = cachedData;
      if (Math.random() < 0.5) {
        return
      }
      setTimeout(() => {
        this.http.get<GroupEssentialData>(apiEndPoint + '/group/get_essential_group_data/' + this.groupID).subscribe((data) => {
          if (data != this.groupEssentialData) {
            this.groupEssentialData = data;
            this.cache.set(data);
          }
        })
      }, 1000 + Math.random() * 3000)
    } else {
      this.http.get<GroupEssentialData>(apiEndPoint + '/group/get_essential_group_data/' + this.groupID).subscribe((data) => {
        this.groupEssentialData = data;
        this.cache.set(data);
      })
    }


  }

  openInviteView() {
    this._bottomSheet.open(InviteViewComponent, {data: this.groupID});
  }

  openMembersView() {
    this._bottomSheet.open(GroupMembersViewComponent, {data: this.groupID});
  }

  openGroupInfo() {
    this._bottomSheet.open(GroupInfoViewComponent, {data: this.groupID});
  }

  stopProp(e: Event) {
    e.stopPropagation()
  }
}
