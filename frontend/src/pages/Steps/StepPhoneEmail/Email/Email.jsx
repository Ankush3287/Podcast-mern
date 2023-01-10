import Card from "../../../../components/shared/Card/Card";
import Button from "../../../../components/shared/Button/Button";
import TextInput from "../../../../components/shared/TextInput/TextInput";
import { useState } from "react";
import styles from "../../StepPhoneEmail/StepPhoneEmail.module.css";

const Email = ({ onNext }) => {
  const [emailID, setEmailID] = useState("");

  return (
    <Card title="Enter your Email ID" icon="email-emoji">
      <TextInput value={emailID} onChange={(e) => setEmailID(e.target.value)} />
      <div>
        <div className={styles.actionButtonWrap}>
          <Button text="Next" onClick={onNext}></Button>
        </div>
        <p className={styles.bottomParagraph}>
          By entering your number, you're agreeing to our Terms of Service and
          Privacy Policy. Thanks!
        </p>
      </div>
    </Card>
  );
};

export default Email;
