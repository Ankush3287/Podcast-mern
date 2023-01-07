import styles from "./Register.module.css";
import { useState } from "react";

/**Steps import */
import StepAvatar from "../Steps/StepAvatar/StepAvatar";
import StepName from "../Steps/StepName/StepName";
import StepOTP from "../Steps/StepOTP/StepOTP";
import StepPhoneEmail from "../Steps/StepPhoneEmail/StepPhoneEmail";
import StepUsername from "../Steps/StepUsername/StepUsername";

const steps = {
  1: StepPhoneEmail,
  2: StepOTP,
  3: StepName,
  4: StepAvatar,
  5: StepUsername,
};

const Register = () => {
  const [step, setStep] = useState(1);
  const Step = steps[step];

  function onNext() {
    setStep(step + 1);
  }

  return (
    <div>
      <Step onNext={onNext} />
    </div>
  );
};

export default Register;
