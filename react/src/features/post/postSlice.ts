import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import axios from "axios";
import { PROPS_NEWPOST, PROPS_LIKED, PROPS_COMMENT } from "../types";

// 環境変数でAPIのエンドポイント格納
const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

// 投稿の一覧をGETで取得する
export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
    const res = await axios.get(apiUrlPost, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    // 取得した投稿の一覧が配列で返す
    return res.data;
  });

// 新規投稿作成
export const fetchAsyncNewPost = createAsyncThunk(
  "post/post",
//   tyoes.tsで定義した型
  async (newPost: PROPS_NEWPOST) => {
    const uploadData = new FormData();
    // 引数で受け取ったtitleを追加
    uploadData.append("title", newPost.title);
    // imgのファイルがある場合にimgを追加
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
    // axiosの第2引数にuploadDataを渡してPOSTする
    const res = await axios.post(apiUrlPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    // 新規で作った投稿のオブジェクトのデータが入ってくる
    return res.data;
  }
);

// postの中のlikedを更新する非同期関数
export const fetchAsyncPatchLiked = createAsyncThunk(
  "post/patch",
// tyoes.tsで定義した型
  async (liked: PROPS_LIKED) => {
    // 現在のlileのデータを格納
    const currentLiked = liked.current;
    const uploadData = new FormData();

    // いいねボタンの解除
    let isOverlapped = false;
    // 現在の配列の内容を展開して、新しく追加されたユーザーのIDが現在のlikeに含まれるかどうか（既にいいねしているかどうか）
    currentLiked.forEach((current) => {
        // 含まれる場合（既にいいねしていた場合）
      if (current === liked.new) {
        isOverlapped = true;
      } else {
        // 含まれない場合はuploadDataに追加
        uploadData.append("liked", String(current));
      }
    });

    // isOverlappedがfalseの場合
    if (!isOverlapped) {
      uploadData.append("liked", String(liked.new));
    // isOverlappedがtrueで、現在のいいね数が残り1だった場合の処理、likedを空にする
    } else if (currentLiked.length === 1) {
      uploadData.append("title", liked.title);
      const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      });
    // ここのelse ifに入ったら処理を出る
      return res.data;
    }
    // likedの状態をpatchで更新する
    const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメントの一覧を取得
export const fetchAsyncGetComments = createAsyncThunk(
  "comment/get",
  async () => {
    const res = await axios.get(apiUrlComment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメントを新規作成
export const fetchAsyncPostComment = createAsyncThunk(
  "comment/post",
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiUrlComment, comment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

export const postSlice = createSlice({
    name: "post",
    initialState: {
    // 処理中用モーダルの表示非表示
      isLoadingPost: false,
    // 新規投稿用モーダルの表示非表示
      openNewPost: false,
    // models.pyと対応したatate、一覧を取得するので配列にしてる
      posts: [
        {
          id: 0,
          title: "",
          userPost: 0,
          created_on: "",
          img: "",
          liked: [0],
        },
      ],
      comments: [
        {
          id: 0,
          text: "",
          userComment: 0,
          post: 0,
        },
      ],
    },
    reducers: {
      fetchPostStart(state) {
        state.isLoadingPost = true;
      },
      fetchPostEnd(state) {
        state.isLoadingPost = false;
      },
      setOpenNewPost(state) {
        state.openNewPost = true;
      },
      resetOpenNewPost(state) {
        state.openNewPost = false;
      },
    },
    // 非同期関数が動作した後の処理
    extraReducers: (builder) => {
        builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
            return {
              ...state,
              posts: action.payload,
            };
        });
        // 新規投稿を投稿一覧の最後の要素に追加する
        builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
            return {
              ...state,
              posts: [...state.posts, action.payload],
            };
          });
        // コメント一覧をstoreのcommentsに格納
        builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
            return {
                ...state,
                comments: action.payload,
            };
        });
        // 新規コメント投稿時に既存のコメント一覧を展開して、最後の要素に追加する
        builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
            return {
              ...state,
              comments: [...state.comments, action.payload],
            };
        });
        // 更新した投稿に一致するidのみ、今回の要素（action.payload）で更新する
        builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
            return {
              ...state,
              posts: state.posts.map((post) =>
                post.id === action.payload.id ? action.payload : post
              ),
            };
        });
    },
});

export const {
    fetchPostStart,
    fetchPostEnd,
    setOpenNewPost,
    resetOpenNewPost,
} = postSlice.actions;

// postSliceで作ったstateを返すためのやつ
export const selectIsLoadingPost = (state: RootState) =>
  state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;

export default postSlice.reducer;
