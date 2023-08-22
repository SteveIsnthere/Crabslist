import {Component, Input, OnInit} from '@angular/core';
import {PostComments} from "../../../services/main.service";
import {PostCommentsViewComponent} from "../../post/post-comments-view/post-comments-view.component";
import {HttpClient} from "@angular/common/http";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {apiEndPoint} from "../../../env";
import {AuthService} from "../../../services/auth.service";
import {Post} from "../../post/Post";

@Component({
  selector: 'app-post-comment-row',
  templateUrl: './post-comment-row.component.html',
  styleUrls: ['./post-comment-row.component.css']
})
export class PostCommentRowComponent implements OnInit {
  @Input() postComment: PostComments | null = null;
  postData: Post | null = null;

  constructor(public http: HttpClient, private _bottomSheet: MatBottomSheet, public dialog: MatDialog, private auth: AuthService) {
  }

  openCommentSection(): void {
    this._bottomSheet.open(PostCommentsViewComponent, {
      data: this.postComment?.post_id,
    });
    this.clearNotification()
  }

  postTitle(): string {
    // return the post title if under 50 characters, otherwise return the first 50 characters
    if (this.postData?.title.length! > 50) {
      return this.postData?.title.slice(0, 50) + '...';
    }
    return this.postData!.title;
  }

  clearNotification(): void {
    this.http.get(apiEndPoint + '/notification/clear_post_comment_notification/' + this.postComment?.post_id + '/' + this.auth.selfUserID).subscribe(() => {
      console.log('removed notification')
    })
  }

  ngOnInit(): void {
    this.http.get<Post>(apiEndPoint + '/post/get_post/' + this.postComment!.post_id).subscribe((data) => {
      this.postData = data;
    })
  }
}