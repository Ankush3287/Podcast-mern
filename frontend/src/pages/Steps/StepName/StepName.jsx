import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import TextInput from "../../../components/shared/TextInput/TextInput";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setName } from "../../../store/activateSlice";
import styles from "./StepName.module.css";

const StepName = ({ onNext }) => {
  const { name } = useSelector((state) => state.activate);
  const dispatch = useDispatch();
  const [fullname, setFullName] = useState(name);

  function submit() {
    if (!fullname) return;
    dispatch(setName(fullname));
    onNext();
  }

  return (
    <>
      <Card title="Enter your full name" icon="goggle-emoji">
        <TextInput
          value={fullname}
          onChange={(e) => setFullName(e.target.value)}
        />
        <p className={styles.paragraph}>
          People use real names at Podcast :) !
        </p>
        <div>
          <Button onClick={submit} text="Next"></Button>
        </div>
      </Card>
    </>
  );
};

export default StepName;
