import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./StepAvatar.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { setAvatar } from "../../../store/activateSlice";
import { activate } from "../../../http";
import { setAuth } from "../../../store/authSlice";
import Loader from "../../../components/shared/Loader/Loader";

const StepAvatar = ({ onNext }) => {
  const { name, avatar } = useSelector((state) => state.activate);
  const [image, setImage] = useState("/images/monkey-avatar.png");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const changeImg = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
    };
  };

  async function submit() {
    if (!name || !avatar) return;
    setLoading(true);
    try {
      const { data } = await activate({ name, avatar });
      if (data.auth) {
        dispatch(setAuth(data));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader message="Activation in progress..." />;
  }

  return (
    <>
      <Card title={`Welcome ${name}!`} icon="monkey-emoji">
        <p className={styles.subHeading}>How's this picture?</p>
        <div className={styles.avatarWrapper}>
          <img className={styles.avatar} src={image} alt="avatar" />
        </div>
        <div>
          <input
            id="avatarInput"
            className={styles.avatarInput}
            type="file"
            onChange={changeImg}
          />
          <label htmlFor="avatarInput" className={styles.avatarLabel}>
            Choose a different photo
          </label>
        </div>
        <div>
          <Button onClick={submit} text="Next"></Button>
        </div>
      </Card>
    </>
  );
};

export default StepAvatar;
