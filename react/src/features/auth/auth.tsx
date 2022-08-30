import React from 'react'
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Auth.module.css";
import Modal from "react-modal";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextField, Button, CircularProgress } from "@material-ui/core";

import { fetchAsyncGetPosts, fetchAsyncGetComments } from "../post/postSlice";

import {
    // useSelectに関係している
    selectIsLoadingAuth,
    selectOpenSignIn,
    selectOpenSignUp,
    // reducerの所画面の表示のtrue、falseのやつ
    setOpenSignIn,
    resetOpenSignIn,
    setOpenSignUp,
    resetOpenSignUp,
    // 非同期関数
    fetchCredStart,
    fetchCredEnd,
    fetchAsyncLogin,
    fetchAsyncRegister,
    fetchAsyncGetMyProf,
    fetchAsyncGetProfs,
    fetchAsyncCreateProf,
  } from "./authSlice";

const customStyles = {
    overlay: {
    backgroundColor: "#777777",
    },
    content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 350,
    padding: "50px",

    transform: "translate(-50%, -50%)",
    },
};

const Auth = () => {
    // reactのモーダルのsetAppElementでDOMのIDを指定
    Modal.setAppElement("#root");
    // storeのopenSignInをselectOpenSignInで取得
    const openSignIn = useSelector(selectOpenSignIn);
    const openSignUp = useSelector(selectOpenSignUp);
    const isLoadingAuth = useSelector(selectIsLoadingAuth);
    // dispatchに返り値を渡す
    const dispatch: AppDispatch = useDispatch();

    return (
    <>
        {/* 新規作成用モーダル */}
        <Modal
        // openSignUpのtruefalseを取得
        isOpen={openSignUp}
        // モーダル以外のところがクリックされたときにresetOpenSignUpを呼び出して、モーダルを閉じる
        onRequestClose={async () => {
          await dispatch(resetOpenSignUp());
        }}
        style={customStyles}
      >
        <Formik
        // ブラウザが立ち上がった時の空白状態をエラーと認識させるための奴
          initialErrors={{ email: "required" }}
        // フォームの入力項目で管理する項目を作る
          initialValues={{ email: "", password: "" }}
        // onSubmitでsubmitボタンが押されたときに実行するないようを定義、この中に具体的な処理を書く
        // valuesにユーザーが入力した内容をオブジェクトで格納している
          onSubmit={async (values) => {
            // 処理開始で処理中の画面を表示
            await dispatch(fetchCredStart());
            // fetchAsyncRegisterに入力内容を渡して、ユーザー作成のAPI呼び出してユーザー作成する
            const resultReg = await dispatch(fetchAsyncRegister(values));

            // fetchAsyncRegisterが成功してユーザー作成された場合にこの中の処理が動く
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
                // トークン取得
              await dispatch(fetchAsyncLogin(values));
                // プロフィールを作成、nickNameは"anonymous"を設定
              await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

            //   プロフィールの一覧を取得
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
            // ログインしているユーザーのプロフィールを取得
              await dispatch(fetchAsyncGetMyProf());
            }
            // 処理終了で処理中の画面閉じる
            await dispatch(fetchCredEnd());
            // 新規登録のモーダルを閉じる
            await dispatch(resetOpenSignUp());
          }}
        // 入力内容のバリデーションを行う、Yup.object()はオブジェクトが渡されるときに宣言する
          validationSchema={Yup.object().shape({
            // emailのバリデーション、Yup.string()は文字列であること
            email: Yup.string()
              // .emailはemailメールアドレスであるか、かっこの中がエラーメッセージ
              .email("email format is wrong")
              // .requiredは必須項目
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            // 入力項目のvalueを取得できる
            values,
            // エラーは↑のバリデーションのエラーを取得できる
            errors,
            // 入力フォームに1度でもフォーカスが当たった場合にtrueとなる
            touched,
            // ↑のバリデーションの結果が問題なかった場合にtrueとなる
            isValid,
          }) => (
            <div>
                {/* ここにhandleSubmitを書く */}
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {/* isLoadingAuthがtrueの時にくるくるを表示する、CircularProgressはマテリアルUIのやつ*/}
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    // 入力の度にformikのバリデーションを走らせる
                    onChange={handleChange}
                    // テキストフィールドからフォーカスが外れた時にバリデーションチェックする
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <br />
                  {/* エラーが出ていて、一度でもフォーカスが当たっていたら */}
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                {/* マテリアルUIのbutton */}
                  <Button
                    // 色で塗りつぶされた感じのボタンになる
                    variant="contained"
                    color="primary"
                    // バリデーションの結果に問題があった場合にボタンが非活性化される
                    disabled={!isValid}
                    type="submit"
                  >
                    Register
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    // クリックされたらサインイン用画面が出て、新規登録画面を閉じる
                    onClick={async () => {
                      await dispatch(setOpenSignIn());
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    You already have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* ログイン用モーダル */}
      <Modal
        isOpen={openSignIn}
        onRequestClose={async () => {
          await dispatch(resetOpenSignIn());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const result = await dispatch(fetchAsyncLogin(values));
            if (fetchAsyncLogin.fulfilled.match(result)) {
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignIn());
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}
                  <br />

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    Login
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      await dispatch(resetOpenSignIn());
                      await dispatch(setOpenSignUp());
                    }}
                  >
                    You don't have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

    </>
    );
};

export default Auth
