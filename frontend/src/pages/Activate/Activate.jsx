import { useState } from "react";
import stepName from "../Steps/StepName/StepName";
import stepAvatar from "../Steps/StepAvatar/StepAvatar";

const steps = {
  1: stepName,
  2: stepAvatar,
};

const Activate = () => {
  const [step, setStep] = useState(1);
  const Step = steps[step];

  function onNext() {
    setStep(step + 1);
  }

  return (
    <div className="cardWrapper">
      <Step onNext={onNext} />
    </div>
  );
};

export default Activate;
