import React, { useEffect } from "react";
import Auth from '../auth/auth'

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md";

import {
  editNickname,
  selectProfile,
  selectIsLoadingAuth,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
} from "../auth/authSlice";

import {
  selectPosts,
  selectIsLoadingPost,
  setOpenNewPost,
  resetOpenNewPost,
  fetchAsyncGetPosts,
  fetchAsyncGetComments,
} from "../post/postSlice";

import Post from "../post/Post";
import EditProfile from "./EditProfile";
import NewPost from "./NewPost";

// ログインしているユーザーのアイコンの右下にランプがつくやつ、マテリアルUI
const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

// TypescriptなのでReact.FCでreactのファンクショナルコンポーネントの型を宣言する
const Core: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  // useSelectorでstoreのstateを取得。
  // ログインしているユーザーのProfileを呼び出し
  const profile = useSelector(selectProfile);
  // 投稿の一覧
  const posts = useSelector(selectPosts);
  // 投稿とログインの処理中画面のtrue,false
  const isLoadingPost = useSelector(selectIsLoadingPost);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  // ブラウザが起動されたときの処理
  useEffect(() => {
    const fetchBootLoader = async () => {
      // トークンがlocalstrageに保存されているか確認
      if (localStorage.localJWT) {
        // サインイン画面を閉じる
        dispatch(resetOpenSignIn());
        // ログインしているプロフィールを取得
        const result = await dispatch(fetchAsyncGetMyProf());
        // トークンの有効期限が切れいている場合、サインイン画面を表示
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          dispatch(setOpenSignIn());
          return null;
        }
        // 投稿一覧の取得
        await dispatch(fetchAsyncGetPosts());
        // プロフィール一覧の取得
        await dispatch(fetchAsyncGetProfs());
        // コメント一覧の取得
        await dispatch(fetchAsyncGetComments());
      }
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />
      <EditProfile />
      <NewPost />
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>SNS clone</h1>
        {/* 最初の？はプロフィールが存在する場合にこの式を評価するためのもの、nickNameの存在有無で分岐 */}
        {profile?.nickName ? (
        <>
          {/* クリックしたら投稿用画面が表示 */}
          <button
            className={styles.core_btnModal}
            onClick={() => {
              dispatch(setOpenNewPost());
              dispatch(resetOpenProfile());
            }}
          >
            <MdAddAPhoto />
          </button>
          <div className={styles.core_logout}>
            {/* isLoadingPostかisLoadingAuthがtrueの場合、ぐるぐるを出す */}
              {(isLoadingPost || isLoadingAuth) && <CircularProgress />}
              {/* ログアウトボタン */}
              <Button
                onClick={() => {
                  // localStorageのトークンを削除
                  localStorage.removeItem("localJWT");
                  // Nicknameを空にする
                  dispatch(editNickname(""));
                  // 何か画面を開いていたら閉じる
                  dispatch(resetOpenProfile());
                  dispatch(resetOpenNewPost());
                  // サインイン画面を開く
                  dispatch(setOpenSignIn());
                }}
              >
                Logout
              </Button>
              {/* ログインユーザーのプロフィール変更画面を表示 */}
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  dispatch(setOpenProfile());
                  // 投稿用画面が表示されていたら閉じる
                  dispatch(resetOpenNewPost());
                }}
              >
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  {/* ログインしているユーザーのimgを割り当て */}
                  <Avatar alt="who?" src={profile.img} />{" "}
                </StyledBadge>
              </button>
          </div>
        </>):(
          <div>
            {/* ログイン画面表示ボタン */}
            <Button
              onClick={() => {
                dispatch(setOpenSignIn());
                dispatch(resetOpenSignUp());
              }}
            >
              LogIn
            </Button>
            {/* 新規作成画面表示ボタン */}
            <Button
              onClick={() => {
                dispatch(setOpenSignUp());
                dispatch(resetOpenSignIn());
              }}
            >
              SignUp
            </Button>
          </div>
        )}
      </div>

      {/* ログインしている時だけ投稿一覧の画面を表示させる */}
      {profile?.nickName && (
        <>
          <div className={styles.core_posts}>
            <Grid container spacing={4}>
              {/* useSelectorで取得した投稿一覧がpostsに格納されてる */}
              {posts
                .slice(0)
                // 配列の並びをリバースで変換、最新の投稿を左上に持ってくるため
                .reverse()
                .map((post) => (
                  // マテリアルUIのGrid、ブラウザの大きさごとの横並びの表示数を設定
                  <Grid key={post.id} item xs={12} md={4}>
                    <Post
                      postId={post.id}
                      title={post.title}
                      // ログインしているユーザーのID
                      loginId={profile.userProfile}
                      // 投稿をしたdjangoのユーザーID
                      userPost={post.userPost}
                      imageUrl={post.img}
                      liked={post.liked}
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </>
      )}
    </div>
  )
}

export default Core
