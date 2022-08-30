import React, { useState } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import styles from "./Core.module.css";

import { File } from "../types";

import {
    selectOpenNewPost,
    resetOpenNewPost,
    fetchPostStart,
    fetchPostEnd,
    fetchAsyncNewPost,
} from "../post/postSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

// modal用
const customStyles = {
    content: {
      top: "55%",
      left: "50%",
  
      width: 280,
      height: 220,
      padding: "50px",
  
      transform: "translate(-50%, -50%)",
    },
};

const NewPost: React.FC = () => {
        const dispatch: AppDispatch = useDispatch();
        const openNewPost = useSelector(selectOpenNewPost);
      
        const [image, setImage] = useState<File | null>(null);
        const [title, setTitle] = useState("");

        // アイコンを押してファイルを選べるようにする
        const handlerEditPicture = () => {
            const fileInput = document.getElementById("imageInput");
            fileInput?.click();
        };
        
        // submitボタンが押されたときの関数
        const newPost = async (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            // 取得したタイトルと選択されたイメージ
            const packet = { title: title, img: image };
            await dispatch(fetchPostStart());
            await dispatch(fetchAsyncNewPost(packet));
            await dispatch(fetchPostEnd());
            // titleとimageを消す
            setTitle("");
            setImage(null);
            dispatch(resetOpenNewPost());
          };

  return (
    <>
      <Modal
        isOpen={openNewPost}
        onRequestClose={async () => {
          await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          {/* title入力 */}
          <TextField
            placeholder="Please enter caption"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* ファイル選択 */}
          <input
            type="file"
            id="imageInput"
            hidden={true}
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          <Button
            // titleとimageどちらかが入力されていない場合は非活性
            disabled={!title || !image}
            variant="contained"
            color="primary"
            // ボタンを押してnewPostを呼び出し
            onClick={newPost}
          >
            New post
          </Button>
        </form>
      </Modal>
      
    </>
  )
}

export default NewPost
