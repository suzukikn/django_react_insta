import React, { useState } from "react";
import styles from "./Post.module.css";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
// いいねボタンのハートマーク
import { Favorite, FavoriteBorder } from "@material-ui/icons";

import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

// authSliceの中のプロフィール一覧を取得できる
import { selectProfiles } from "../auth/authSlice";

import {
    selectComments,
    fetchPostStart,
    fetchPostEnd,
    fetchAsyncPostComment,
    fetchAsyncPatchLiked,
} from "./postSlice";

import { PROPS_POST } from "../types";

// コメントに表示されるアイコンをサイズを調整
const useStyles = makeStyles((theme) => ({
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      marginRight: theme.spacing(1),
    },
}));

const Post: React.FC<PROPS_POST> = ({
// Core.tsxから渡される全てのパラメータを設定、以下を設定するために、1行上で<PROPS_POST>を記述
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
  liked,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const profiles = useSelector(selectProfiles);
  const comments = useSelector(selectComments);
  const [text, setText] = useState("");

// filterを使って全てのコメントを1つずつ展開、IDが一致する投稿をcommentsOnPostに格納
  const commentsOnPost = comments.filter((com) => {
    return com.post === postId;
  });

// 投稿したユーザーのプロフィールを格納
  const prof = profiles.filter((prof) => {
    return prof.userProfile === userPost;
  });

// コメントを書いて、postボタンを押したときの関数
// 引数にeventオブジェクトを受けとっている
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    // ページのリロードを実行させない
    e.preventDefault();
    const packet = { text: text, post: postId };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPostComment(packet));
    await dispatch(fetchPostEnd());
    setText("");
  };

// いいねボタンが押されたときの関数、likedの属性を更新する
  const handlerLiked = async () => {
    // propsで受け取った各要素がpacketに格納されている。（Post: React.FC<PROPS_POST>のところ）
    const packet = {
      id: postId,
      title: title,
      current: liked,
      new: loginId,
    };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPatchLiked(packet));
    await dispatch(fetchPostEnd());
  };

// 投稿内容がある場合のみ表示させるため、titleの有無で分岐
  if (title) {
    return (
        <div className={styles.post}>
          <div className={styles.post_header}>
            {/* 投稿の右上にアバターとニックネームが表示されるようにする */}
            {/* 投稿したユーザーの情報がprofにはいいているので、profからimgを取得 */}
            <Avatar className={styles.post_avatar} src={prof[0]?.img} />
            <h3>{prof[0]?.nickName}</h3>
          </div>
        {/* imageUrlを参照して画像を表示 */}
        <img className={styles.post_image} src={imageUrl} alt="" />

        <h4 className={styles.post_text}>
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            // 投稿にいいねをしたIDとloginIdを比較、一致すると投稿一覧が表示された際に、いいね済みの投稿のハートマークが活性化する
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          <strong> {prof[0]?.nickName}</strong> {title}
          <AvatarGroup max={7}>
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                // likedにはいっているユーザーのIDをkeyにしてprofileを展開、一致するprofileのデータからアイコン画像を取得、画面に表示
                key={like}
                src={profiles.find((prof) => prof.userProfile === like)?.img}
              />
            ))}
          </AvatarGroup>
        </h4>

        {/* コメント欄の表示 */}
        <Divider />
        <div className={styles.post_comments}>
        {/* commentsOnPostにこの投稿へのコメントが入っている */}
          {commentsOnPost.map((comment) => (
            <div key={comment.id} className={styles.post_comment}>
              <Avatar
                src={
                  profiles.find(
                    // comment.userCommentにコメントを投稿したユーザーのIDがあるので、IDが一致したユーザーのアイコンを取得
                    (prof) => prof.userProfile === comment.userComment
                  )?.img
                }
                className={classes.small}
              />
              <p>
                <strong className={styles.post_strong}>
                  {
                    profiles.find(
                    // コメントをしたユーザーのニックネームを取得
                      (prof) => prof.userProfile === comment.userComment
                    )?.nickName
                  }
                </strong>
                {/* コメントのテキストを表示 */}
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        {/* コメント投稿フォーム */}
        <form className={styles.post_commentBox}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={text}
            // useStateを使って、ユーザーがタイピングするたびにtext stateが更新されるようにする
            onChange={(e) => setText(e.target.value)}
          />
          <button
            // textが入力されていない場合はボタンを非活性化
            disabled={!text.length}
            className={styles.post_button}
            type="submit"
            // クリックするとpostComment関数が呼び出される
            onClick={postComment}
          >
            Post
          </button>
        </form>

        </div>
    )
  }
  return null;

}

export default Post
