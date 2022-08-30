import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
    editNickname,
    selectProfile,
    selectOpenProfile,
    resetOpenProfile,
    fetchCredStart,
    fetchCredEnd,
    fetchAsyncUpdateProf,
} from "../auth/authSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

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

const EditProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openProfile = useSelector(selectOpenProfile);
  const profile = useSelector(selectProfile);
  const [image, setImage] = useState<File | null>(null);

//   updateボタンが押されたときの関数、Profileを更新する
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const packet = { id: profile.id, nickName: profile.nickName, img: image };

    await dispatch(fetchCredStart());
    await dispatch(fetchAsyncUpdateProf(packet));
    await dispatch(fetchCredEnd());
    await dispatch(resetOpenProfile());
  };

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  return (
    <>
      <Modal
        isOpen={openProfile}
        onRequestClose={async () => {
          await dispatch(resetOpenProfile());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          <TextField
            placeholder="nickname"
            type="text"
            value={profile?.nickName}
            // storeの中のnickNameを更新
            onChange={(e) => dispatch(editNickname(e.target.value))}
          />

        {/* ファイルの入力フォーム */}
          <input
            type="file"
            id="imageInput"
            // 通常のボタンは非表示にしている
            hidden={true}
            // 複数ファイル選択できるため配列で返ってくる。今回は1ファイルのみ使うので配列の1番目の要素のみ取り出す
            // image stateにファイルを格納
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          {/* アイコンをクリックした際にhandlerEditPictureが呼び出される */}
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          {/* ニックネームが空の時は非活性 */}
          <Button
            disabled={!profile?.nickName}
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile}
          >
            Update
          </Button>
        </form>
      </Modal>
    </>
  )
}

export default EditProfile
