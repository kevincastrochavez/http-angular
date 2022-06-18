import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { map, catchError, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";

import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = {
      title,
      content,
    };
    this.http
      .post<{ name: string }>(
        "https://http-example-735bb-default-rtdb.firebaseio.com/posts.json",
        postData,
        {
          observe: "response",
        }
      )
      .subscribe(
        (responseData) => {
          console.log(responseData);
        },
        (error) => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    return this.http
      .get<{ [key: string]: Post }>(
        "https://http-example-735bb-default-rtdb.firebaseio.com/posts.json",
        {
          headers: new HttpHeaders({
            "Custom-Header": "Hello",
          }),
          params: new HttpParams().set("print", "pretty"),
          responseType: "json",
        }
      )
      .pipe(
        // map((responseData: { [key: string]: Post }) => {
        map((responseData) => {
          const postsArray: Post[] = [];

          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }

          return postsArray;
        }),
        catchError((errorResponse) => {
          return throwError(errorResponse);
        })
      );
  }

  deletePosts() {
    return this.http
      .delete(
        "https://http-example-735bb-default-rtdb.firebaseio.com/posts.json",
        {
          observe: "events",
          responseType: "json",
        }
      )
      .pipe(
        tap((e) => {
          console.log(e);
          if (e.type === HttpEventType.Response) {
            console.log(e.body);
          }
        })
      );
  }
}
